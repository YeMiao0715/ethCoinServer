import { TokenServer } from './../server/TokenServer';
import { db } from '../database/database';
import assert from 'assert';

describe('TokenServer test', () => {

  it('获取代币数量', async () => {
    await db().then(async connect => {
      const tokenServer = new TokenServer('0xdAC17F958D2ee523a2206206994597C13D831ec7');
      await tokenServer.contractInit();
      const tokenAmount = await tokenServer.getTokenAmount('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
      assert.ok(tokenAmount);
      await connect.close();
    });
  })

  it('获取代币转账所需gas', async () => {
    await db().then(async connect => {
      const tokenServer = new TokenServer('0xdAC17F958D2ee523a2206206994597C13D831ec7');
      await tokenServer.contractInit();
      const gas = await tokenServer.calcTokenGas('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '0.004');
      assert.ok(gas);
      await connect.close();
    });
  });

  // it('获取代币历史转账记录', async () => {
  //   await db().then(async connect => {
  //     const tokenServer = new TokenServer('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  //     await tokenServer.contractInit();
  //     const evens = await tokenServer.getTokenPastEvent('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad');
      
  //     connect.close();
  //   })
  // });
  
});