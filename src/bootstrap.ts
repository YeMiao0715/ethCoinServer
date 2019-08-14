import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';
import { WebRunLogModel } from './model/databaseModel/WebRunLogModel';

const app = new Koa();

/**
 * 检测安全组
 * @param {string} ip
 * @returns
 */
function checkIp(ip: string) {
  let status = false;
  let ipString = process.env.HTTP_SERVER_IP_LIST;
  const ipList = ipString.split(',');
  ipList.map(value => {
    if(ip.includes(value)) {
      status = true
    }
  });
  return status;
}

app.use(bodyParser());

app.use(async (ctx, next) => {
  
  WebRunLogModel.info(ctx.method, ctx.url, ctx.request.body, ctx.ip);
  // 安全组检测
  if(checkIp(ctx.ip) === false) {
    ctx.throw(403, '权限不足');
  }

  // 设置响应头
  ctx.set('Content-Type', 'application/json;charset: UTF-8');
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

export = app;