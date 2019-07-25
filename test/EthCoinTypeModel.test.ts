import { EthCoinTypeModel } from "../model/EthCoinTypeModel";
import { db } from "../database/database";
import { expect } from 'chai';


describe('ethCoinTypeModel test', () => {

  var connect;

  before(async function() {
    connect = await db().then(connect => connect);
  })

  it('获取合约详情', async () => {
      const ethCoinTypeModel = new EthCoinTypeModel;    
      const info = await ethCoinTypeModel.getContractInfo('0xdAC17F958D2ee523a2206206994597C13D831ec7');
      expect(info).to.include.keys(['abi', 'calcGasAddress', 'name', 'decimal']);
      expect(info.abi).to.an('array').length.least(1);
      expect(info.calcGasAddress).to.a('string').include('0x').not.empty;
      expect(info.name).to.a('string').length.least(2);
      expect(info.decimal).to.a('number').above(1);
  });

  after(async function() {
    connect.close();
  });
});

