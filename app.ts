import { SystemRunLogModel } from './src/model/databaseModel/SystemRunLogModel';
import app from './src/bootstrap';
import dotenv from 'dotenv';
import { db } from './src/database/database';

dotenv.config();

db().then(connect => {
  app.listen(process.env.HTTP_SERVER_PORT, () => {
    SystemRunLogModel.info(`服务已在${process.env.HTTP_SERVER_PORT}开启`, SystemRunLogModel.SCENE_SYSTEM_INFO);
  });
})
