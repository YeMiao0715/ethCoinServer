import { TokenModel } from '../model/ether/TokenModel';
import { EthCoinTypeModel } from '../model/databaseModel/EthCoinTypeModel';
import { EthModel } from "../model/ether/EthModel";

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
    switch(coinName) {
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
        if(contractObj !== false){
          const tokenModel = new TokenModel(contractObj.contract_address);
          await tokenModel.contractInit();
          amountObj.push({
            name: coinName,
            contractAddress: contractObj.contract_address,
            amount: await tokenModel.getTokenAmount(address)
          });
        }else{
          throw new Error(coinName + '币种不支持');
        }
        break;
    }
    return amountObj;
  }

}