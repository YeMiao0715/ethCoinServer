import { sendEthTransaction } from "../task/SendTransactionTask";
import { db } from "../database/database";


describe('SendTransactionTask test', () => {
  var connect;

  before(async function() {
    connect = await db().then(connect => connect);
  });

  after(async function() {
    await connect.close();
  });

  it('发送eth任务', async() => {
    
  });

  
  
});