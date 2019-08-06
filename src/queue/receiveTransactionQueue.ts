import { EthReceiveTaskEventModel } from '../model/databaseModel/EthReceiveTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../../.env`
});

const port = process.env.RECEIVE_QUEUE_PORT;

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
    SystemRunLogModel.info('eth提币服务开启', SystemRunLogModel.SCENE_SENDTRANSACTION_EVENT, server.address());
  })
});

async function handleData(data) {

}