import { TransactionServer } from './../server/TransactionServer';
import { db } from "../database/database";
import assert from 'assert';

describe('TransactionServer test', () => {

  it('代币交易Tx 构建(全部转移)', async () => {
    db().then(async connect => {
      const transactionServer = new TransactionServer();
      const TxObj = await transactionServer.buildTokenTransaction('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', 'all');
      assert.ok(TxObj.data);
      assert.ok(TxObj.gasLimit);
      assert.ok(TxObj.gasPrice);
      assert.ok(TxObj.nonce);
      const TxData = await transactionServer.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      assert.ok(TxData);
      await connect.close();
    });
  });

  it('代币交易Tx 构建(1)', async () => {
    db().then(async connect => {
      const transactionServer = new TransactionServer();
      const TxObj = await transactionServer.buildTokenTransaction('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '1');
      assert.ok(TxObj.data);
      assert.ok(TxObj.gasLimit);
      assert.ok(TxObj.gasPrice);
      assert.ok(TxObj.nonce);
      const TxData = await transactionServer.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      assert.ok(TxData);
      await connect.close();
    });
  })

  it('eth交易Tx 构建(全部转移)', async () => {
    db().then(async connect => {
      const transactionServer = new TransactionServer();
      const TxObj = await transactionServer.buildEthTransaction('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', 'all');
      assert.ok(TxObj.value);
      assert.ok(TxObj.gasLimit);
      assert.ok(TxObj.gasPrice);
      assert.ok(TxObj.nonce);
      const TxData = await transactionServer.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      assert.ok(TxData);
      await connect.close();
    });
  });

  it('eth交易Tx 构建(0.005)', async () => {
    db().then(async connect => {
      const transactionServer = new TransactionServer();
      const TxObj = await transactionServer.buildEthTransaction('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '0.005');
      assert.ok(TxObj.value);
      assert.ok(TxObj.gasLimit);
      assert.ok(TxObj.gasPrice);
      assert.ok(TxObj.nonce);
      const TxData = await transactionServer.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      assert.ok(TxData);
      await connect.close();
    });
  });

});