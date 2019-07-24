import { sendEthTransaction } from "../task/SendTransactionTask";
import { db } from "../database/database";


describe('SendTransactionTask test', () => {
  
  it('发送eth任务', async() => {
    db().then(async connect => {
      // await sendEthTransaction();
      await connect.close();
    })
  });
  
});