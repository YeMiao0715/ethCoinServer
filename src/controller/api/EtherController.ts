import { AddressTransactionListModel } from './../../model/databaseModel/AddressTransactionListModel';
import { EtherServer } from '../../server/EtherServer';
import Router from 'koa-router';
import { checkAddress } from '../../lib/utils';
import net from 'net';
import { isNumeric } from 'validator';
const router = new Router();

const client = net.connect(process.env.SEND_QUEUE_PORT).on('error', error => {
  throw error;
})

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
    await etherServer.getAddressOrCreate(address);
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
router.get('/calaGasAmount/:coinName/:address', async (ctx, next) => {
  let coinName = ctx.params.coinName;
  let address = ctx.params.address;

  try {
    address = checkAddress(address);
  } catch (error) {
    ctx.throw(400, 'from地址解析错误');
  }

  const etherServer = new EtherServer;
  try {
    const gasObj = await etherServer.calcGasToEthAmount(address, coinName);
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

  if (!isNumeric(amount)) {
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
    const buildSendObject = await etherServer.buildSendTransactionObject(from, to, amount, contractAddress);
    buildSendObject['privateKey'] = privateKey;
    client.write(JSON.stringify(buildSendObject));
    delete buildSendObject['privateKey'];
    ctx.body = ctx.return('ok', buildSendObject);
  } catch (error) {
    ctx.throw(400, error.message);
  }
})

/**
 * 获取交易记录
 */
router.get('/getTransactionList/:coin_name/:address', async (ctx, next) => {
  let address = ctx.params.address;
  let coin_name = ctx.params.coin_name;
  let type = ctx.query.type ? ctx.query.type : 'all';
  let page = ctx.query.page ? ctx.query.page : 1;
  let limit = ctx.query.limit ? ctx.query.limit : 20;

  if (address !== undefined) {
    try {
      address = checkAddress(address);
    } catch (error) {
      ctx.throw(400, '用户地址解析错误');
    }
  }

  try {
    const etherServer = new EtherServer;
    const list = await etherServer.getUserTransactionList(address, coin_name, type, page, limit);
    ctx.body = ctx.return('ok', {
      list
    });
  } catch (error) {
    ctx.throw(400, error.message);
  }
})


export default router;