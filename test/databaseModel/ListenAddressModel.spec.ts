import { expect } from 'chai';
import { ListenAddressModel } from '../../src/model/databaseModel/ListenAddressModel';
import { db } from '../../src/database/database';


describe('ListenAddressModel test', () => {

  var connect;
  const listenAddressModel = new ListenAddressModel;   

  before(async function() {
    connect = await db().then(connect => connect);
  })

  it('添加一个地址到监听列表', async () => {
    const address = await listenAddressModel.saveAddress('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
    expect(address.id).to.eql(1);
    expect(address.address).to.eq('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
    expect(address.start_block).to.be.null
    expect(address.last_block).to.be.null;
  })

  it('更新一条数据', async () => {
    const address = await listenAddressModel.updateBlockNumber(1, 100, 1);
    expect(address).to.include.keys(['address','start_block','last_block', 'id', 'transaction_count', 'create_time', 'update_time']);
    expect(address.transaction_count).to.a('number').eq(1);
    expect(address.start_block).to.a('number').eq(100);
    expect(address.last_block).to.be.null;
    const address1 = await listenAddressModel.updateBlockNumber(1, 200, 1);
    expect(address1.transaction_count).to.a('number').eq(2);
    expect(address1.last_block).to.a('number').eq(200);
  })


  after(async function() {
    await connect.query('truncate listen_address');
    await connect.close();
  });
})