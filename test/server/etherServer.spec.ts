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
    const gasObj = await etherServer.calcGasToEthAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', undefined);
    expect(gasObj).to.include.keys(['gasLimit', 'gasPrice', 'gasToEth']);
    expect(gasObj.gasPrice).to.be.a('string');
    expect(gasObj.gasLimit).to.be.a('number');
    expect(gasObj.gasToEth).to.be.a('string');
  })

  after(async () => {
    await connect.close();
  })

});