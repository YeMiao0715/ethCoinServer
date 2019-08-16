import { EthReceiveTaskEventModel, ReceiveMessage } from '../model/databaseModel/EthReceiveTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import net from 'net';
import dotenv from 'dotenv';
import { post, Response } from 'request';
import { ConfigModel } from '../model/databaseModel/ConfigModel';

dotenv.config({
  path: `${__dirname}/../../.env`
});

// 通知信息对象
interface NotificationMessage {
  blockNumber: number;
  contract: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  extends: object;
}

const port = process.env.RECEIVE_QUEUE_PORT;

const ethReceiveTaskEventModel = new EthReceiveTaskEventModel;
const configModel = new ConfigModel;

db().then(connect => {
  const server = net.createServer((socket) => {
    socket.on('data', data => {
      const str = Buffer.from(data).toString('utf8');
      handleData(str);
    })
    socket.end('end');
  }).on('error', (error) => {
    console.log(error);
  })

  server.listen(port, () => {
    SystemRunLogModel.info('eth交易接受数据处理服务开启', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, server.address());
  })
});

async function handleData(data) {
  const receiveMessage = transformType(data);
  await SystemRunLogModel.info('接受信息', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, receiveMessage);
  let orderID: number;
  if(receiveMessage.contract === null) {
    let message = await ethReceiveTaskEventModel.addReceiveEthEventObj(receiveMessage)
    orderID = message.id;
  }else{
    let message = await ethReceiveTaskEventModel.addReceiveTokenEventObj(receiveMessage)
    orderID = message.id;
  }
  await notification(receiveMessage, orderID);
}

/**
 * 交易通知
 *
 * @param {ReceiveMessage} receiveMessage
 * @param {number} orderId
 */
async function notification(receiveMessage: ReceiveMessage, orderId: number) {
  
  let notificationMessage: NotificationMessage = {
    blockNumber: receiveMessage.blockNumber,
    hash: receiveMessage.hash,
    from: receiveMessage.from,
    to: receiveMessage.to,
    amount: receiveMessage.amount,
    contract: receiveMessage.contract,
    extends: receiveMessage.extends
  }

  const url = await configModel.getNotificationUrl();
  
  await SystemRunLogModel.info('发送通知到业务服务器', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, notificationMessage);

  post(url, {
    form: notificationMessage
  }, async (error, res: Response, body) => {
    if(error) {
      throw error;
    }
    
    if(res.statusCode === 200) {
      await ethReceiveTaskEventModel.updateEventState(orderId, {
        callback_state: EthReceiveTaskEventModel.CALLBACK_STATE_SUCCESS,
        callback_state_message: JSON.parse(body)
      })
    }else if(res.statusCode === 400) {
      await ethReceiveTaskEventModel.updateEventState(orderId, {
        callback_state: EthReceiveTaskEventModel.CALLBACK_STATE_ERROR,
        callback_state_message: JSON.parse(body)
      })
    }else{
      await ethReceiveTaskEventModel.updateEventState(orderId, {
        callback_state: EthReceiveTaskEventModel.CALLBACK_STATE_ERROR,
        callback_state_message: body
      })
    }

    await SystemRunLogModel.info('接受服务器返回信息', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, {
      code: res.statusCode,
      body: body
    });
  })
}

/**
 * 转换类型
 *
 * @param {*} data
 * @returns {ReceiveMessage}
 */
function transformType(data): ReceiveMessage{
  return JSON.parse(data);
}
