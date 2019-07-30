import { TransactionModel } from './../model/ether/TransactionModel';
import { TokenModel } from '../model/ether/TokenModel';
import { EthCoinTypeModel } from '../model/databaseModel/EthCoinTypeModel';
import { EthModel, GasObj } from "../model/ether/EthModel";
import { EthTaskEventModel } from '../model/databaseModel/EthTaskEventModel';
import dec from 'decimal.js';
import { web3 } from '../../config/web3.config';
export class EtherServer {

  ethModel = new EthModel;
  ethCoinTypeModel = new EthCoinTypeModel;

  /**
   * 获取账户余额
   * @param {string} address
   * @param {string} [coinName='all']
   * @returns
   * @memberof EtherServer
   */
  async getAccountAmount(address: string, coinName: string = 'all') {
    let amountObj = [];
    switch (coinName) {
      case 'eth':
        amountObj.push({
          name: 'eth',
          contractAddress: null,
          amount: await this.ethModel.getEthAmount(address)
        });
        break;
      case 'all':
        amountObj.push({
          name: 'eth',
          contractAddress: null,
          amount: await this.ethModel.getEthAmount(address)
        });
        const coinSupportList = await this.ethCoinTypeModel.getCoinSupportList();
        for (const coin of coinSupportList) {
          const tokenModel = new TokenModel(coin.contract_address);
          await tokenModel.contractInit();
          amountObj.push({
            name: coin.name,
            contractAddress: coin.contract_address,
            amount: await tokenModel.getTokenAmount(address)
          });
        }
        break;
      default:
        const contractObj = await this.ethCoinTypeModel.verifyCoinNameOrContractAddress(coinName);
        if (contractObj !== false) {
          const tokenModel = new TokenModel(contractObj.contract_address);
          await tokenModel.contractInit();
          amountObj.push({
            name: coinName,
            contractAddress: contractObj.contract_address,
            amount: await tokenModel.getTokenAmount(address)
          });
        } else {
          throw new Error(coinName + '币种不支持');
        }
        break;
    }
    return amountObj;
  }


  /**
   * 计算交易所需gas费用
   * @param {string} from
   * @param {string} to
   * @param {(string| undefined)} contractAddress
   * @returns
   * @memberof EtherServer
   */
  async calcGasToEthAmount(from: string, to: string, contractAddress: string | undefined) {
    let gasObj: GasObj;
    if (contractAddress !== undefined) {
      const tokenModel = new TokenModel(contractAddress);
      await tokenModel.contractInit();
      gasObj = await tokenModel.calcTokenGas(from, to, 0);
    } else {
      gasObj = await this.ethModel.calcEthGas(from, to, 0);
    }
    return gasObj;
  }


  /**
   * 构建发送对象
   * @param {string} from
   * @param {string} to
   * @param {(string | number)} value
   * @param {(string | undefined)} contractAddress
   * @returns
   * @memberof EtherServer
   */
  async bulidSendTransactionObject(from: string, to: string, value: string | number, contractAddress: string | undefined) {
    const transactionModel = new TransactionModel;
    const ethTaskEventModel = new EthTaskEventModel;
    let buildSendObject;
    if (contractAddress !== undefined) {
      buildSendObject = await transactionModel.buildTokenTransaction(contractAddress, from, to, value);
      await this.validatorAddressGas(from, buildSendObject.gasPrice, buildSendObject.gasLimit);
      await this.validatorAddressTokenAmount(from, contractAddress, value);
      const eventObj = await ethTaskEventModel.addSendTokenEventObj({
        contract: contractAddress,
        from,
        to,
        value
      })
      buildSendObject['id'] = eventObj.id;
    } else {
      buildSendObject = await transactionModel.buildEthTransaction(from, to, value);
      await this.validatorAddressGas(from, buildSendObject.gasPrice, buildSendObject.gasLimit);
      const eventObj = await ethTaskEventModel.addSendEthEventObj({
        from,
        to,
        value
      })
      buildSendObject['id'] = eventObj.id;
    }
    return buildSendObject;
  }


  /**
   * 判断地址手续费是否足够
   * @param {string} from
   * @param {string} gasPrice
   * @param {string} gasLimit
   * @memberof EtherServer
   */
  async validatorAddressGas(from: string, gasPrice: string, gasLimit: string) {
    const eth = await web3.eth.getBalance(from);
    if (new dec(eth).sub(new dec(gasPrice).mul(gasLimit).toString()).lt(0)) {
      throw new Error('eth手续费不足');
    }
  }


  /**
   * 判断代币数量是否足够
   * @param {string} from
   * @param {string} contractAddress
   * @param {(string | number)} amount
   * @memberof EtherServer
   */
  async validatorAddressTokenAmount(from: string, contractAddress: string, amount: string | number) {
    const tokenModel = new TokenModel(contractAddress);
    await tokenModel.contractInit();
    const tokenAmount = await tokenModel.getTokenAmount(from);
    if(new dec(tokenAmount).lt(amount.toString())) {
      throw new Error(`${tokenModel.getContractName()} 数量不足`);
    }
  }

}