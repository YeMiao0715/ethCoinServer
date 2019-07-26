import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';
import { WebRunLogModel } from '../model/databaseModel/WebRunLogModel';

const app = new Koa();

app.context.return = function(message: string, data: object = {}) {
  return {
    message, data
  }
}

/**
 * 检测安全组
 * @param {string} ip
 * @returns
 */
function checkIp(ip: string) {
  let status = false;
  let ipString = process.env.HTTP_SERVER_IP_LIST;
  if(ipString.includes(',')){
    const ipList = ipString.split(',');
    ipList.map(value => {
      if(ip === value) {
        status = true
      }
    });
  }else{
    if(ip === ipString) {
      status = true;
    }else {
      status = false;
    }
  }
  return status;
}

app.use(bodyParser());

app.use(async (ctx, next) => {
  // 安全组检测
  if(checkIp(ctx.ip) === false) {
    ctx.throw(403, '权限不足');
  }

  WebRunLogModel.info(ctx.method, ctx.url, ctx.request.body, ctx.ip);
  
  // 设置响应头
  ctx.set('Content-Type', 'application/json;charset: UTF-8');
  await next();
});

app.on('error', (error, ctx) => {
  
});


app.use(router.routes());
app.use(router.allowedMethods());

export = app;