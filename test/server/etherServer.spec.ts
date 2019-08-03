import { expect } from 'chai';
import { EtherServer } from './../../src/server/EtherServer';
import { db } from '../../src/database/database';


describe('etherServer test', () => {

  var connect;
  const etherServer = new EtherServer;

  before(async function() {
    connect = await db().then(connect => connect);
  })

  it('获取eth地址所支持币种余额', async () => {
    const accountList = await etherServer.getAccountAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
    expect(accountList).to.a('array');
    expect(accountList[0]).to.an('object').include.keys(['name', 'amount']);
  })

  it('获取支持币种发送所需gas手续费对象', async () => {
    const gasObj = await etherServer.calcGasToEthAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', undefined);
    expect(gasObj).to.include.keys(['gasLimit', 'gasPrice', 'gasToEth']);
    expect(gasObj.gasPrice).to.be.a('string');
    expect(gasObj.gasLimit).to.be.a('number');
    expect(gasObj.gasToEth).to.be.a('string');
  })

  it('获取最多可发送数量', async () => {
    const maxAmountObj = await etherServer.getMaxSendAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '0xdAC17F958D2ee523a2206206994597C13D831ec7');
    expect(maxAmountObj).to.be.include.keys('coinType','maxSendAmount');
    expect(maxAmountObj.coinType).to.be.a('string').eq('usdt');
    expect(maxAmountObj.maxSendAmount).to.be.a('string');
    const maxAmountOb = await etherServer.getMaxSendAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8');
    expect(maxAmountOb).to.be.include.keys('coinType','maxSendAmount');
    expect(maxAmountOb.coinType).to.be.a('string').eq('eth');
    expect(maxAmountOb.maxSendAmount).to.be.a('string');
  })

  it('检验私钥', async () => {
    await etherServer.validatorPrivateKey('3e4eab809406649d24fec3fff07f3bd96194d5ef5cce3e3f498432c2adda3073', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8');
  });

  it('解析usdt交易', async () => {
    await etherServer.analysisTransaction('0x37f2bf2d9878a407b04ac811a2de07e11a3d893eaac6c97370d780d0df58f164');
  });

  it('解析eth交易', async () => {
    await etherServer.analysisTransaction('0x97da3f1a010cf0c9c990e5496d896fbf92f45bf6463e75c338173a52d80a40ce');
  });

  after(async () => {
    await connect.close();
  })

});