import { EtherServer } from './../server/EtherServer';
import Router from 'koa-router';
import { checkAddress } from '../lib/utils';
import net from 'net';
import { isNumeric } from 'validator';
const router = new Router();

/**
 * eth 获取账户余额
 */
router.get('/getAccountAmount/:coin_name/:address', async (ctx, next) => {
  let coin_name = ctx.params.coin_name;
  let address = ctx.params.address;
  try {
    address = checkAddress(address);
  } catch (error) {
    ctx.throw(400, '地址解析错误')
  }

  const etherServer = new EtherServer;

  try {
    const accountList = await etherServer.getAccountAmount(address, coin_name);
    ctx.body = ctx.return('ok', {
      accountList
    });
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

/**
 * 计算gas所需数量
 */
router.post('/calaGasAmount', async (ctx, next) => {
  let post = ctx.request.body;
  let from = post.from;
  let contractAddress = post.contractAddress;

  try {
    from = checkAddress(from);
  } catch (error) {
    ctx.throw(400, 'from地址解析错误');
  }

  if (contractAddress !== undefined) {
    try {
      contractAddress = checkAddress(contractAddress);
    } catch (error) {
      ctx.throw(400, '合约地址解析错误');
    }
  }

  const etherServer = new EtherServer;
  try {
    const gasObj = await etherServer.calcGasToEthAmount(from, from, contractAddress);
    ctx.body = ctx.return('ok', gasObj);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

/**
 * 获取可最多发送金额
 */
router.get('/getMaxSendAmount', async (ctx, next) => {
  let post = ctx.request.body;
  let from = post.from;
  let contractAddress = post.contractAddress;

  try {
    from = checkAddress(from);
  } catch (error) {
    ctx.throw(400, 'from地址解析错误');
  }

  if (contractAddress !== undefined) {
    try {
      contractAddress = checkAddress(contractAddress);
    } catch (error) {
      ctx.throw(400, '合约地址解析错误');
    }
  }

  const etherServer = new EtherServer;
  try {
    const maxAmountObj = await etherServer.getMaxSendAmount(from, from, contractAddress);
    ctx.body = ctx.return('ok', maxAmountObj);
  } catch (error) {
    ctx.throw(400, error.message);
  }
})

/**
 * 调起交易
 */
router.post('/sendTransaction', async (ctx, next) => {
  let post = ctx.request.body;
  let from = post.from;
  let to = post.to;
  let amount = post.amount;
  let contractAddress = post.contractAddress;
  let privateKey = post.privateKey;

  try {
    from = checkAddress(from);
  } catch (error) {
    ctx.throw(400, 'from地址解析错误');
  }

  try {
    to = checkAddress(to);
  } catch (error) {
    ctx.throw(400, 'to地址解析错误');
  }

  if (contractAddress !== undefined) {
    try {
      contractAddress = checkAddress(contractAddress);
    } catch (error) {
      ctx.throw(400, '合约地址解析错误');
    }
  }

  if (! isNumeric(amount)) {
    if (amount !== 'all') {
      ctx.throw(400, '数量必须为数字或all');
    }
  }

  const etherServer = new EtherServer;

  try {
    privateKey = await etherServer.validatorPrivateKey(privateKey, from);
  } catch (error) {
    ctx.throw(400, error.message);
  }

  try {
    const buildSendObject = await etherServer.bulidSendTransactionObject(from, to, amount, contractAddress);
    net.connect(process.env.QUEUE_PORT).write(JSON.stringify(buildSendObject));
    ctx.body = ctx.return('ok', buildSendObject);
  } catch (error) {
    ctx.throw(400, error.message);
  }
})


export default router;