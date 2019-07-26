import { EtherServer } from './../server/EtherServer';
import Router from 'koa-router';
import { web3 } from '../../config/web3.config';


const router = new Router();

router.get('/getAmount/:coin_name/:address', async (ctx, next) => {
  let coin_name = ctx.params.coin_name;  
  let address = ctx.params.address; 
  try {
    address = web3.utils.toChecksumAddress(address);  
  } catch (error) {
    ctx.throw(400, 'eth解析地址错误')
  }

  const etherServer = new EtherServer;

  try {
    const accountList = await etherServer.getAccountAmount(address, coin_name);
    ctx.body = ctx.return('ok', accountList);
  } catch (error) {
    ctx.throw(400, error.message);
  }  
  
  next();
})


export default router;