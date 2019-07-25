import { LogModel } from './../model/LogModel';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';
const app = new Koa();

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



app.use(async (ctx, next) => {
  // 安全组检测
  if(checkIp(ctx.ip) === false) {
    ctx.throw(403, '权限不足');
  }

  LogModel.info(`${ctx.method} ${ctx.url}`, LogModel.SCENE_HTTPS_INFO, ctx.query);
  
  // 设置响应头
  ctx.set('Content-Type', 'application/json;charset: UTF-8');
  await next();
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

export = app;