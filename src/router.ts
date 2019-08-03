import Router from 'koa-router';
import EtherController from './controller/EtherController';

const router = new Router();
router.use('/api',EtherController.routes());

export default router;