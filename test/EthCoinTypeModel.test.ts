import { EthCoinType } from './../database/entity/EthCoinType';
import { EthCoinTypeModel } from "../model/EthCoinTypeModel";
import { db } from "../database/database";
import assert from 'assert';

describe('ethCoinTypeModel test', () => {

  it('获取合约详情', async () => {
    await db().then(async (connect) => {
      const ethCoinTypeModel = new EthCoinTypeModel;    
      const info = await ethCoinTypeModel.getContractInfo('0xdAC17F958D2ee523a2206206994597C13D831ec7');
      // console.log(info);
      assert.ok(info.abi);
      assert.ok(info.calcGasAddress);
      assert.ok(info.decimal);
      assert.ok(info.name);
      await connect.close();
    });
    
  });
});