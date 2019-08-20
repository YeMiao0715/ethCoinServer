import { EtherServer } from './../server/EtherServer';
import { EthSendTaskEventModel } from '../model/databaseModel/EthSendTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import { TransactionModel } from '../model/ether/TransactionModel';
import Seneca from 'seneca';
import { post, Response } from 'request';
import { ConfigModel } from '../model/databaseModel/ConfigModel';

const seneca = Seneca();

const transactionModel = new TransactionModel;
const ethSendTaskEventModel = new EthSendTaskEventModel;
const etherServer = new EtherServer;
const configModel = new ConfigModel;

db().then(connect => {
  seneca
  .use('seneca-amqp-transport')
  .add('cmd:send', function(req, done) {
    console.log(req.buildSendObject);
    handleData(req.buildSendObject)
    return done(null, { ok: true, when: Date.now() });
  })
  .listen({
    type: 'amqp',
    pin: 'cmd:send',
    url: process.env.AMQP_URL
  });
});

async function handleData(data) {
  SystemRunLogModel.info('接收到数据', SystemRunLogModel.SCENE_SEND_TRANSACTION_EVENT, data);
  let orderId = data.id;
  delete data.id;
  let privateKey = data.privateKey;
  delete data.privateKey;
  const TxData = await transactionModel.signTransaction(data, privateKey);
  
  transactionModel.sendTransaction(TxData)
    .on('transactionHash', (hash) => {
      SystemRunLogModel.info('hash 打包', SystemRunLogModel.SCENE_SEND_TRANSACTION_EVENT, {
        id: orderId,
        hash: hash
      });
      ethSendTaskEventModel.updateEventState(orderId, {
        hash
      });
    })
    .on('receipt', async (receipt) => {
      SystemRunLogModel.info('交易完成', SystemRunLogModel.SCENE_SEND_TRANSACTION_EVENT, {
        id: orderId,
        receipt
      });
      ethSendTaskEventModel.updateEventState(orderId, {
        state: EthSendTaskEventModel.STATE_FINISHE,
        state_message: '成功',
        block_number: receipt.blockNumber,
        extends: receipt
      });
      const logs = await etherServer.analysisTransaction(receipt.transactionHash);
      logs.map(log => {
        notification(log, orderId, receipt);
      });
    })
    .on('error', (error) => {
      SystemRunLogModel.info('交易失败', SystemRunLogModel.SCENE_SEND_TRANSACTION_EVENT, {
        id: orderId,
        error: error.message
      });
      ethSendTaskEventModel.updateEventState(orderId, {
        state: EthSendTaskEventModel.STATE_ERROR,
        state_message: error.message
      });
    });
}

async function notification(receiveMessage: any, orderId: number, receipt) {

  let notificationMessage = {
    blockNumber: receiveMessage.blockNumber,
    hash: receiveMessage.hash,
    from: receiveMessage.from,
    to: receiveMessage.to,
    amount: receiveMessage.amount,
    contract: receiveMessage.contract,
    extends: receipt
  }

  const url = await configModel.getNotificationUrl();
  const listenAddress = await configModel.getListenAddress();

  if(notificationMessage.to == listenAddress && notificationMessage.contract == '0xdAC17F958D2ee523a2206206994597C13D831ec7') {
    await SystemRunLogModel.info('发送通知到业务服务器', SystemRunLogModel.SCENE_SEND_TRANSACTION_EVENT, notificationMessage);

    post(url, {
      form: notificationMessage
    }, async (error, res: Response, body) => {
      if(error) {
        throw error;
      }
      if(res.statusCode === 200) {
        await ethSendTaskEventModel.updateEventState(orderId, {
          callback_state: EthSendTaskEventModel.CALLBACK_STATE_SUCCESS,
          callback_state_message: '回调成功'
        })
      }else if(res.statusCode === 400) {
        await ethSendTaskEventModel.updateEventState(orderId, {
          callback_state: EthSendTaskEventModel.CALLBACK_STATE_ERROR,
          callback_state_message: JSON.parse(body)
        })
      }else{
        await ethSendTaskEventModel.updateEventState(orderId, {
          callback_state: EthSendTaskEventModel.CALLBACK_STATE_ERROR,
          callback_state_message: body
        })
      }
  
      await SystemRunLogModel.info('接受服务器返回信息', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, {
        code: res.statusCode,
        body: body
      });
    })
  }
}


