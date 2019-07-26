import { EthModel } from '../../model/ether/EthModel';
import { db } from "../../database/database";
import { expect } from 'chai';

describe('ether EthModel test', () => {
  var connect;
  const ethModel = new EthModel;

  before(async function() {
    connect = await db().then(connect => connect);
  })

  it('获取eth账户余额', async () => {
      const amount = await ethModel.getEthAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
      expect(amount).to.be.a('string');
  });

  it('获取eth转账所需gas', async () => {
      const gasObj = await ethModel.calcEthGas('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '1');
      expect(gasObj).to.include.keys(['gasLimit', 'gasPrice', 'gasToEth']);
      expect(gasObj.gasPrice).to.be.a('string');
      expect(gasObj.gasLimit).to.be.a('number');
      expect(gasObj.gasToEth).to.be.a('string');
  });

  after(async function() {
    connect.close();
  });
});

