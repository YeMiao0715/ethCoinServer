import { LogModel } from './model/LogModel';
import app from './src/bootstrap';
import dotenv from 'dotenv';
import { db } from './database/database';

dotenv.config();

db().then(connect => {
  app.listen(process.env.HTTP_SERVER_PORT, () => {
    LogModel.info(`服务已在${process.env.HTTP_SERVER_PORT}开启`, LogModel.SCENE_HTTPS_INFO);
  });
})
