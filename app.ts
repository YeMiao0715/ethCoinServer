import { SystemRunLogModel } from './model/databaseModel/SystemRunLogModel';
import app from './src/bootstrap';
import dotenv from 'dotenv';
import { db } from './database/database';

dotenv.config();

db().then(connect => {
  app.listen(process.env.HTTP_SERVER_PORT, () => {
    SystemRunLogModel.info(`服务已在${process.env.HTTP_SERVER_PORT}开启`, SystemRunLogModel.SCENE_HTTPS_INFO);
  });
})
