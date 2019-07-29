import { web3 } from "../../../config/web3.config";
import dec from 'decimal.js';
import { getGasPrice } from "../../lib/utils";

export interface GasObj {
  gasLimit: number,
  gasPrice: number| string,
  gasToEth: string
}

/**
 * eth服务
 * @export
 * @class EthModel
 */
export class EthModel {

  /**
   * 获取eth 余额
   * @param {string} address
   * @returns
   * @memberof EthModel
   */
  async getEthAmount(address: string) {
    const amount = await web3.eth.getBalance(address);
    return web3.utils.fromWei(amount, 'ether');
  }


  /**
   *  获取转移所需手续费
   * @param {string} from
   * @param {string} to
   * @param {(number| string)} value
   * @returns
   * @memberof EthModel
   */
  async calcEthGas(from: string, to: string, value: number| string) {

    const gasPrice = await getGasPrice();
    const gasLimit = await web3.eth.estimateGas({
      from,
      to,
      gasPrice,
      value: web3.utils.toWei(value.toString(),'ether')
    });

    return {
      gasLimit, gasPrice,
      gasToEth: web3.utils.fromWei(new dec(gasPrice).mul(gasLimit).toFixed())
    }
  }
  
}