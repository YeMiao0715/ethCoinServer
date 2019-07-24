import { TokenServer } from './TokenServer';
import { web3 } from './../config/web3.config';
import { Transaction as Tx } from 'ethereumjs-tx';
import getAddressNonce from '../lib/getAddressNonce';
import { EthServer } from './EthServer';
import dec from 'decimal.js';

export class TransactionServer {
  
  /**
   * 构建代币转移TxObj
   * @param {string} contractAddress
   * @param {string} from
   * @param {string} to
   * @param {(string| number)} [amount='all']
   * @returns
   * @memberof TransactionServer
   */
  async buildTokenTransaction(contractAddress: string, from: string, to: string, amount: string| number = 'all') {
    const tokenServer = new TokenServer(contractAddress);
    await tokenServer.contractInit();
    let abiData: string;
    if(amount === 'all') {
      amount = await tokenServer.getTokenAmount(from);
      abiData = await tokenServer.buildTransactionAbiData(to, amount);
    }else{
      abiData = await tokenServer.buildTransactionAbiData(to, amount);
    }

    const gasObj = await tokenServer.calcTokenGas(from, to, amount);
    const nonce = await this.getAddressNonce(from);

    return {
      nonce,
      gasPrice: gasObj.gasPrice,
      gasLimit: gasObj.gasLimit,
      data: abiData
    }
  }


  /**
   * 构建Eth 转移
   * @param {string} from
   * @param {string} to
   * @param {(string|number)} [amount='all']
   * @memberof TransactionServer
   */
  async buildEthTransaction(from: string, to: string, amount: string|number = 'all') {
    const ethServer = new EthServer;
    let gasObj: {
      gasLimit: number;
      gasPrice: number;
      gas: string;
    };

    if(amount === 'all') {
      amount = await ethServer.getEthAmount(from);
      gasObj = await ethServer.calcEthGas(from, to, amount);
      amount = new dec(amount).sub(gasObj.gas).toString();
    }else{
      gasObj = await ethServer.calcEthGas(from, to, amount);
    }
    
    const nonce = await this.getAddressNonce(from);
    
    return {
      nonce,
      gasPrice: gasObj.gasPrice,
      gasLimit: gasObj.gasLimit,
      value: web3.utils.toWei(amount.toString(), 'ether')
    }
  }

  async getAddressNonce(address: string) {
    return await getAddressNonce(address);
  }

  /**
   * 签名交易
   * @param {object} transaction
   * @param {string} privateKey
   * @returns
   * @memberof TransactionServer
   */
  async signTransaction(transaction: object, privateKey: string) {
    Object.keys(transaction).map(key => {
      if(['to','data'].includes(key) === false) {
        transaction[key] = web3.utils.toHex(transaction[key]);
      }
    });
    const bufferKey = Buffer.from(privateKey.replace('0x', ''), 'hex');
    const tx = new Tx(transaction);
    tx.sign(bufferKey);
    const serializedTx = tx.serialize();
    return `0x${serializedTx.toString('hex')}`;
  }


  /**
   * 发送交易
   * @param {string} Tx
   * @returns
   * @memberof TransactionServer
   */
  sendTransaction(Tx: string) {
    return web3.eth.sendSignedTransaction(Tx);
  }

}