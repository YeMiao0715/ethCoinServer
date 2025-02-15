import { EtherServer } from '../../server/EtherServer';
import Router from 'koa-router';
import { checkAddress } from '../../lib/utils';
import { isNumeric } from 'validator';
const router = new Router();
import seneca from 'seneca'
import { getAddressTransactionList } from '../../model/ether/EthTransactionListModel';

const send = seneca()
  .use('seneca-amqp-transport')
  .client({
    type: 'amqp',
    pin: 'cmd:send',
    url: process.env.AMQP_URL
  });

/**
 * eth 获取账户余额
 */
router.get('/getAccountAmount/:address/:coin_name', async (ctx, next) => {
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
    ctx.body = accountList;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

/**
 * 计算gas所需数量
 */
router.get('/calaGasAmount/:address/:coinName', async (ctx, next) => {
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
    ctx.body = gasObj;
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
    ctx.body = maxAmountObj;
  } catch (error) {
    ctx.throw(400, error.message);
  }
})

/**
 * 调起交易
 */
router.post('/sendTransaction/:coinName', async (ctx, next) => {
  let post = ctx.request.body;
  let from = post.from;
  let to = post.to;
  let amount = post.amount;
  let coinName = ctx.params.coinName.toLowerCase();
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
    const buildSendObject = await etherServer.buildSendTransactionObject(from, to, amount, coinName);

    buildSendObject['privateKey'] = privateKey;
    
    send.act('cmd:send', {
      buildSendObject
    }, (err, res) => {
      if(err) console.log(err);
      console.log(res);
    })

    ctx.body = {
      id: buildSendObject.id,
      from: buildSendObject.from,
      to: buildSendObject.to,
      nonce: buildSendObject.nonce,
      gasPrice: buildSendObject.gasPrice,
      gasLimit: buildSendObject.gasLimit,
      data: buildSendObject.data,
    };
    
  } catch (error) {
    ctx.throw(400, error.message);
  }
})

/**
 * 获取交易记录
 */
router.get('/getTransactionList/:address/:coin_name', async (ctx, next) => {
  let address = ctx.params.address;
  let coin_name = ctx.params.coin_name.toLowerCase();
  let type = ctx.query.type ? ctx.query.type : 0;
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
    let list = await getAddressTransactionList(address, coin_name, parseInt(type), page, limit);
    ctx.body = list
  } catch (error) {
    ctx.throw(400, error.message);
  }
})

export default router;