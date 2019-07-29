import { EthTaskEventModel } from './../model/databaseModel/EthTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import net from 'net';
import dotenv from 'dotenv';
import { TransactionModel } from '../model/ether/TransactionModel';
dotenv.config({
  path: `${__dirname}/../../.env`
});

export interface SendEthTransactionOption {
  from: string;
  to: string;
  value: string| number
}

export interface SendTokenTransactionOption {
  from: string;
  to: string;
  value: string| number,
  contractAddress: string
}

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
    SystemRunLogModel.info('eth提币服务开启', SystemRunLogModel.SCENE_SYSTEM_INFO, server.address());
  })
});

async function handleData(data) {
  data = JSON.parse(data);
  let orderId = data.id;
  delete data.id;
  let privateKey = data.privateKey;
  delete data.privateKey;
  const transactionModel = new TransactionModel;
  const ethTaskEventModel = new EthTaskEventModel;
  const TxData = await transactionModel.signTransaction(data, privateKey);

  transactionModel.sendTransaction(TxData)
    .on('transactionHash', (hash) => {
      console.log(hash);
      ethTaskEventModel.updateEventState(orderId, {
        hash
      });
    })
    .on('receipt', (receipt) => {
      console.log(receipt);
      ethTaskEventModel.updateEventState(orderId, {
        state: EthTaskEventModel.STATE_FINISHE,
        state_message: '成功',
        extends: receipt
      });
    })
    .on('error', (error) => {
      ethTaskEventModel.updateEventState(orderId, {
        state: EthTaskEventModel.STATE_ERROR,
        state_message: error.message
      });
    });

}


