import { EthCoinTypeModel } from "../../model/databaseModel/EthCoinTypeModel";
import { db } from "../../database/database";
import { expect } from 'chai';


describe('ethCoinTypeModel test', () => {

  var connect;
  const ethCoinTypeModel = new EthCoinTypeModel;   

  before(async function() {
    connect = await db().then(connect => connect);
  })

  it('获取合约详情', async () => {
    const info = await ethCoinTypeModel.getContractInfo('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    expect(info).to.include.keys(['abi', 'calcGasAddress', 'name', 'decimal']);
    expect(info.abi).to.an('array').length.least(1);
    expect(info.calcGasAddress).to.a('string').include('0x').not.empty;
    expect(info.name).to.a('string').length.least(2);
    expect(info.decimal).to.a('number').above(1);
  });

  it('获取代币支持列表并检测代币支持', async () => {
    const coinNameList = await ethCoinTypeModel.getCoinSupportList();
    coinNameList.map(async coin => {
      expect(coin).to.be.an('object').include.keys(['name', 'contract_address']);
    });
    const isVerifyOne = await ethCoinTypeModel.verifyCoinNameOrContractAddress('usdt');
    expect(isVerifyOne).to.ok;
    const isVerifyTwo = await ethCoinTypeModel.verifyCoinNameOrContractAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    expect(isVerifyTwo).to.not.eq(false);
  });

  after(async function() {
    connect.close();
  });
});

