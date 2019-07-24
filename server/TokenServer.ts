import Contract from "web3/eth/contract";
import { web3 } from "../config/web3.config";
import { EthCoinTypeModel } from "../model/EthCoinTypeModel";
import dec from 'decimal.js';

/**
 * 代币服务
 * @export
 * @class TokenServer
 */
export class TokenServer {

  private contract: Contract;

  private contractName: string;
  private contractAddress: string;
  private contractDecimal: number;
  private contractCalcGasAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  /**
   * 合约初始化
   * @memberof TokenServer
   */
  async contractInit() {
    const ethCoinTypeModel = new EthCoinTypeModel;
    const info = await ethCoinTypeModel.getContractInfo(this.contractAddress);
    this.contractName = info.name;
    this.contractDecimal = info.decimal;
    this.contractCalcGasAddress = info.calcGasAddress;
    this.contract = new web3.eth.Contract(info.abi, this.contractAddress);
  }


  /**
   * 获取代币余额
   * @param {string} address
   * @returns
   * @memberof TokenServer
   */
  async getTokenAmount(address: string) {
    const tokenAmount = await this.contract.methods.balanceOf(address).call();
    return new dec(tokenAmount).div(this.contractDecimal).toFixed();
  }


  /**
   * 构建转账参数
   * @param {string} to
   * @param {(string|number)} tokenAmount
   * @returns
   * @memberof TokenServer
   */
  async buildTransactionAbiData(to: string, tokenAmount: string|number) {
    tokenAmount = new dec(tokenAmount).mul(10 ** this.contractDecimal).toString();
    const abiData = await this.contract.methods.transfer(to, tokenAmount).encodeABI();
    return  abiData;
  }


  /**
   * 计算发送代币所需的eth
   * @param {string} from
   * @param {string} to
   * @param {(string|number)} tokenAmount
   * @returns
   * @memberof TokenServer
   */
  async calcTokenGas(from: string, to: string, tokenAmount: string|number) {
    const gasPrice = await web3.eth.getGasPrice();
    tokenAmount = new dec(tokenAmount).mul(10 ** this.contractDecimal).toString();
    const abiData = await this.buildTransactionAbiData(to, tokenAmount);
    const gasLimit = await web3.eth.estimateGas({
      from,to,data: abiData, gasPrice
    });

    return {
      gasPrice,
      gasLimit,
      gasToEth: web3.utils.fromWei(new dec(gasPrice).mul(gasLimit).toFixed(), 'ether')
    }
  }

  

}