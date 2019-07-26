import Router from 'koa-router';
import EtherController from './controller/EtherController';

const router = new Router();
router.use(EtherController.routes());

export default router;