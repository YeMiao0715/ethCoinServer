import { expect } from 'chai';
import { TransactionModel } from '../../src/model/ether/TransactionModel';
import { db } from "../../src/database/database";

describe('transactionModel test', () => {

  var connect;
  const transactionModel = new TransactionModel();

  before(async function() {
    connect = await db().then(connect => connect);
  });

  it('代币交易Tx 构建(全部转移)', async () => {
      const TxObj = await transactionModel.buildTokenTransaction('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', 'all');
      expect(TxObj).to.be.include.keys(['data', 'gasLimit', 'gasPrice', 'nonce']);
      expect(TxObj.data).to.be.a('string').include('0x');
      expect(TxObj.gasLimit).to.be.a('number').above(10000);
      expect(TxObj.gasPrice).to.be.a('string');
      expect(TxObj.nonce).to.be.a('number').above(0);
      const TxData = await transactionModel.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      expect(TxData).to.be.a('string').include('0x');
  });

  it('代币交易Tx 构建(1)', async () => {
      const TxObj = await transactionModel.buildTokenTransaction('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '1');
      expect(TxObj).to.be.include.keys(['data', 'gasLimit', 'gasPrice', 'nonce']);
      expect(TxObj.data).to.be.a('string').include('0x');
      expect(TxObj.gasLimit).to.be.a('number').above(10000);
      expect(TxObj.gasPrice).to.be.a('string');
      expect(TxObj.nonce).to.be.a('number').above(0);
      const TxData = await transactionModel.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      expect(TxData).to.be.a('string').include('0x');
  })

  it('eth交易Tx 构建(全部转移)', async () => {
      const TxObj = await transactionModel.buildEthTransaction('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', 'all');
      expect(TxObj).to.be.include.keys(['value', 'gasLimit', 'gasPrice', 'nonce']);
      expect(TxObj.value).to.be.a('string');
      expect(TxObj.gasLimit).to.be.a('number').above(10000);
      expect(TxObj.gasPrice).to.be.a('string');
      expect(TxObj.nonce).to.be.a('number').above(0);
      const TxData = await transactionModel.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      expect(TxData).to.be.a('string').include('0x');
  });

  it('eth交易Tx 构建(0.005)', async () => {
      const TxObj = await transactionModel.buildEthTransaction('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad', '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8', '0.005');
      expect(TxObj).to.be.include.keys(['value', 'gasLimit', 'gasPrice', 'nonce']);
      expect(TxObj.value).to.be.a('string');
      expect(TxObj.gasLimit).to.be.a('number').above(10000);
      expect(TxObj.gasPrice).to.be.a('string');
      expect(TxObj.nonce).to.be.a('number').above(0);
      const TxData = await transactionModel.signTransaction(TxObj, '7db92a57e83281d3cc8269543a87bd09ac57fda6408a11ade1c190435a4de94f');
      expect(TxData).to.be.a('string').include('0x');
  });

  after(async function() {
    await connect.close();
  });

});