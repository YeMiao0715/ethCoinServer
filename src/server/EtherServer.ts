import { AddressTransactionListModel } from './../model/databaseModel/AddressTransactionListModel';
import { ListenAddressModel } from './../model/databaseModel/ListenAddressModel';
import { TransactionModel } from './../model/ether/TransactionModel';
import { TokenModel } from '../model/ether/TokenModel';
import { EthCoinTypeModel } from '../model/databaseModel/EthCoinTypeModel';
import { EthModel, GasObj } from "../model/ether/EthModel";
import { EthSendTaskEventModel } from '../model/databaseModel/EthSendTaskEventModel';
import dec from 'decimal.js';
import { web3 } from '../../config/web3.config';
import * as wallet from 'ethereumjs-wallet';
import { AddressTransaction } from '../database/entity/AddressTransaction';

export class EtherServer {

  ethModel = new EthModel;
  ethCoinTypeModel = new EthCoinTypeModel;
  listenAddressModel = new ListenAddressModel;
  addressTransactionListModel = new AddressTransactionListModel;

  async getAddressOrCreate(address: string) {
    const find = await this.listenAddressModel.findAddress(address);
    if(!find) {
      return await this.listenAddressModel.saveAddress(address);
    }
    return find;
  }

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
        return {
          name: 'eth',
          contractAddress: null,
          amount: await this.ethModel.getEthAmount(address)
        };
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
          return {
            name: contractObj.name,
            contractAddress: contractObj.contract_address,
            amount: await tokenModel.getTokenAmount(address)
          };
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
  async calcGasToEthAmount(address: string, coinName: string = 'eth') {
    let gasObj: GasObj;

    switch (coinName) {
      case 'eth':
          gasObj = await this.ethModel.calcEthGas(address, address, 0);    
        break;
      default:
          const contractObj = await this.ethCoinTypeModel.verifyCoinNameOrContractAddress(coinName);
          if (contractObj !== false) {
            const tokenModel = new TokenModel(contractObj.contract_address);
            await tokenModel.contractInit();
            gasObj = await tokenModel.calcTokenGas(address, address, 1);  
          }else{
            throw new Error(`[${coinName}] 该币种不支持`);
          }
        break;
    }
    return gasObj;
  }


  /**
   * 构建发送对象
   * @param {string} from
   * @param {string} to
   * @param {(string | number)} value
   * @param {(string)} coinName
   * @returns
   * @memberof EtherServer
   */
  async buildSendTransactionObject(from: string, to: string, value: string | number, coinName: string = 'eth') {
    const transactionModel = new TransactionModel;
    const ethsendTaskEventModel = new EthSendTaskEventModel;
    let buildSendObject: any;
    let orderId: number;

    switch (coinName) {
      case 'eth': 
        buildSendObject = await transactionModel.buildEthTransaction(from, to, value);
        await this.validatorAddressGas(from, buildSendObject.gasPrice, buildSendObject.gasLimit);
        if(value !== 'all') {
          await this.validatorAddressEthAmount(from, value, buildSendObject.gasPrice, buildSendObject.gasLimit);
        }
        const eventObj = await ethsendTaskEventModel.addSendEthEventObj({
          from,
          to,
          value
        })
        orderId = eventObj.id
        break;
      default:
          const contractObj = await this.ethCoinTypeModel.verifyCoinNameOrContractAddress(coinName);
          if (contractObj !== false) {
            buildSendObject = await transactionModel.buildTokenTransaction(contractObj.contract_address, from, to, value);
            await this.validatorAddressGas(from, buildSendObject.gasPrice, buildSendObject.gasLimit);
            
            if(value !== 'all') {
              await this.validatorAddressTokenAmount(from, contractObj.contract_address, value);
            }

            const eventObj = await ethsendTaskEventModel.addSendTokenEventObj({
              contract: contractObj.contract_address,
              from,
              to,
              value
            })
            orderId = eventObj.id
          }else{
            throw new Error(`[${coinName}] 该币种不支持`);
          }
        break;
    }

    let data: object = {
      id: orderId
    }
    Object.keys(buildSendObject).map(key => {
      data[key] = buildSendObject[key];
    })

    return data;
  }

  /**
   * 获取该地址最多可发某代币送数量
   * @param {string} from
   * @param {string} to
   * @param {(string | undefined)} contractAddress
   * @returns
   * @memberof EtherServer
   */
  async getMaxSendAmount(from: string, to: string, contractAddress: string = null) {
    let maxSendAmount: string;
    let coinType: string;
    if (contractAddress === null) {
      coinType = 'eth';
      maxSendAmount = await this.ethModel.calcMaxSendEthAmount(from, to);
    } else {
      const tokenModel = new TokenModel(contractAddress);
      await tokenModel.contractInit();
      coinType = tokenModel.getContractName();
      maxSendAmount = await tokenModel.getTokenAmount(from);
    }
    return {
      coinType,
      maxSendAmount
    };
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
    const gas = new dec(gasPrice).mul(gasLimit).toString();
    if (new dec(eth).sub(gas).lt(0)) {
      throw new Error('eth手续费不足');
    }
    return gas;
  }


  /**
   * 判断eth数量是否足够
   * @param {string} from
   * @param {(string | number)} amount
   * @memberof EtherServer
   */
  async validatorAddressEthAmount(from: string, amount: string | number, gasPrice: string, gasLimit: string) {
    const eth = await web3.eth.getBalance(from);
    const sendAmount = web3.utils.toWei(amount.toString(), 'ether');
    const gas = await this.validatorAddressGas(from, gasPrice, gasLimit);

    if (new dec(eth).lt(sendAmount)) {
      throw new Error('eth数量不足');
    }
    const maxSendAmount = new dec(eth).sub(gas)

    if (maxSendAmount.lt(sendAmount)) {
      throw new Error('最多可转移 ' + web3.utils.fromWei(maxSendAmount.toString(), 'ether') + ' eth');
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
    if (new dec(tokenAmount).lt(amount.toString())) {
      throw new Error(`${tokenModel.getContractName()} 数量不足`);
    }
  }

  /**
   * 验证私钥是否正确
   * @param {string} privateKey
   * @param {string} address
   * @memberof EtherServer
   */
  async validatorPrivateKey(privateKey: string, address: string) {
    try {
      const privateKeyObj = wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));  
      const privateKeyToAddress = privateKeyObj.getChecksumAddressString();
      if(privateKeyToAddress !== address) {
        throw new Error('私钥错误');
      }
      return privateKey;
    } catch (error) {
      throw new Error('私钥错误');
    }
  }

  /**
   * 解析交易
   * @param {string} transaction
   * @returns
   * @memberof EtherServer
   */
  async analysisTransaction(transaction: string) {
    const receipt = await web3.eth.getTransactionReceipt(transaction);
    let eventTransactions = [];
    const contractInfo = await this.ethCoinTypeModel.judgeContractAddress(receipt.to);
    if(contractInfo) {
      if(receipt.logs.length) {
        receipt.logs.map(value => {
          const from = web3.eth.abi.decodeParameter('address', value.topics[1]);
          const to = web3.eth.abi.decodeParameter('address', value.topics[2]);
          const amount = web3.eth.abi.decodeParameter('uint256', value.data);
          eventTransactions.push({
            blockNumber: value.blockNumber,
            hash: value.transactionHash,
            from,
            to,
            amount: new dec(amount).div(10 ** contractInfo.decimal).toFixed(),
            contract: value.address,
          });
        });
      }
    }else{
      const receipt = await web3.eth.getTransaction(transaction);
      eventTransactions.push({
        blockNumber: receipt.blockNumber,
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        amount: web3.utils.fromWei(receipt.value, 'ether'),
        contract: null,
      });
    }
    
    return eventTransactions;
  }


  /**
   * 获取地址交易记录
   * @param {string} address
   * @param {string} [coinName=null]
   * @param {number} page
   * @param {number} [limit=20]
   * @returns
   * @memberof EtherServer
   */
  async getUserTransactionList(address: string, coinName: string, type: number | string, page: number, limit: number = 20) {
    const addressInfo = await this.listenAddressModel.findAddress(address);
    let transactionList: AddressTransaction[];
    type = type == 'all' ? 0 : type;
    switch (coinName) {
      case 'eth':
          const ethInfo = await this.ethCoinTypeModel.getEthInfo();
          transactionList = await this.addressTransactionListModel.getUserTransactionList(addressInfo.id, ethInfo.id, type, page, limit);
        break;
      default:
        const contractObj = await this.ethCoinTypeModel.verifyCoinNameOrContractAddress(coinName);
        if (contractObj !== false) {
          const contractInfo = await this.ethCoinTypeModel.getContractInfo(contractObj.contract_address);
          transactionList = await this.addressTransactionListModel.getUserTransactionList(addressInfo.id, contractInfo.id, type, page, limit);
        }else{
          throw new Error(`[${coinName}] 该币种不支持`);
        }
    }
    return transactionList;
  }

}