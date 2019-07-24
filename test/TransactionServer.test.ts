import { TransactionServer } from './../server/TransactionServer';
import { db } from "../database/database";


describe('TransactionServer test', () => {

  it('代币交易Tx 构建', async () => {
    db().then(async connect => {
      const transactionServer = new TransactionServer();
      const TxObj = await transactionServer.buildTokenTransaction('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '1');
      console.log(TxObj);
      await connect.close();
    });
  })

});