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

  after(async () => {
    await connect.close();
  })

});