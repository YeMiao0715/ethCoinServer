import { EthReceiveTaskEventModel } from '../model/databaseModel/EthReceiveTaskEventModel';
import { db } from '../database/database';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../../.env`
});

const port = process.env.RECEIVE_QUEUE_PORT;

const ethReceiveTaskEventModel = new EthReceiveTaskEventModel;

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
  data = JSON.parse(data);
  await SystemRunLogModel.info('接受信息', SystemRunLogModel.SCENE_RECEIVET_RANSACTION_EVENT, data);
  if(data.contract === null) {
    await ethReceiveTaskEventModel.addReceiveEthEventObj(data)
  }else{
    await ethReceiveTaskEventModel.addReceiveTokenEventObj(data)
  }

}