import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './router';
const app = new Koa();

app.use(async (ctx, next) => {
  // 安全组检测
  let status = false;
  console.log(process.env.HTTP_SERVER_IP_LIST)

  // 设置响应头
  ctx.set('Content-Type', 'application/json;charset: UTF-8');
  await next();
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

export default app;