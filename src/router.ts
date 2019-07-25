import Router from 'koa-router';

const router = new Router();

router.head('/ipCheck', (ctx) => {
  ctx.body = {status: 'ok'};
})

export default router;