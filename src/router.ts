import Router from 'koa-router';
import EtherController from './controller/api/EtherController';

const router = new Router();
router.use('/api', EtherController.routes());

export default router;