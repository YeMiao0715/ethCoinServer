import { EthSendTaskEventModel } from '../model/databaseModel/EthSendTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import { TransactionModel } from '../model/ether/TransactionModel';
import Seneca from 'seneca';

const seneca = Seneca();
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
  const transactionModel = new TransactionModel;
  const ethSendTaskEventModel = new EthSendTaskEventModel;
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
    .on('receipt', (receipt) => {
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


