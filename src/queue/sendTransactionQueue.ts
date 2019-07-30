import { EthTaskEventModel } from './../model/databaseModel/EthTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import net from 'net';
import dotenv from 'dotenv';
import { TransactionModel } from '../model/ether/TransactionModel';
dotenv.config({
  path: `${__dirname}/../../.env`
});

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

  server.listen(process.env.QUEUE_PORT, () => {
    SystemRunLogModel.info('eth提币服务开启', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, server.address());
  })
});

async function handleData(data) {
  data = JSON.parse(data);
  SystemRunLogModel.info('接收到数据', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, data);
  let orderId = data.id;
  delete data.id;
  let privateKey = data.privateKey;
  delete data.privateKey;
  const transactionModel = new TransactionModel;
  const ethTaskEventModel = new EthTaskEventModel;
  const TxData = await transactionModel.signTransaction(data, privateKey);

  
  transactionModel.sendTransaction(TxData)
    .on('transactionHash', (hash) => {
      SystemRunLogModel.info('hash 打包', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, {
        id: orderId,
        hash: hash
      });
      ethTaskEventModel.updateEventState(orderId, {
        hash
      });
    })
    .on('receipt', (receipt) => {
      SystemRunLogModel.info('交易完成', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, {
        id: orderId,
        receipt
      });
      ethTaskEventModel.updateEventState(orderId, {
        state: EthTaskEventModel.STATE_FINISHE,
        state_message: '成功',
        extends: receipt
      });
    })
    .on('error', (error) => {
      SystemRunLogModel.info('交易失败', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, {
        id: orderId,
        error: error.message
      });
      ethTaskEventModel.updateEventState(orderId, {
        state: EthTaskEventModel.STATE_ERROR,
        state_message: error.message
      });
    });
}


