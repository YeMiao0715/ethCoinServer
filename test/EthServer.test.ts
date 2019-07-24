import { EthServer } from './../server/EthServer';
import { db } from "../database/database";
import assert from 'assert';

describe('EthServer test', () => {

  it('获取eth账户余额', async () => {
    await db().then(async (connect) => {
      const ethServer = new EthServer;
      const amount = await ethServer.getEthAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
      assert.ok(amount);
      await connect.close();
    });
  });

  it('获取eth转账所需gas', async () => {
    await db().then(async (connect) => {
      const ethServer = new EthServer;
      const gas = await ethServer.calcEthGas('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '1');
      assert.ok(gas);
      await connect.close();
    });
  });
});