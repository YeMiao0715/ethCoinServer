import { TokenModel } from '../../src/model/ether/TokenModel';
import { expect } from 'chai';

import { db } from '../../src/database/database';


describe('ether TokenModel test', () => {

  var connect;
  const tokenModel = new TokenModel('0xdAC17F958D2ee523a2206206994597C13D831ec7');
      

  before(async function() {
    connect = await db().then(connect => connect);
    await tokenModel.contractInit();
  });

  it('获取代币数量', async () => {
      const tokenAmount = await tokenModel.getTokenAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
      expect(tokenAmount).to.be.a('string');
  })

  it('获取代币转账所需gas', async () => {
      const gasObj = await tokenModel.calcTokenGas('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '0.004');
      expect(gasObj).to.include.keys(['gasLimit', 'gasPrice', 'gasToEth']);
      expect(gasObj.gasPrice).to.be.a('string');
      expect(gasObj.gasLimit).to.be.a('number');
      expect(gasObj.gasToEth).to.be.a('string');
  });
  
  after(async function() {
    await connect.close();
  });
});