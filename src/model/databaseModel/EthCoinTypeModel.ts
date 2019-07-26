import { SystemRunLogModel } from './SystemRunLogModel';
import { getRepository } from "typeorm";
import { EthCoinType } from "../../database/entity/EthCoinType";

export class EthCoinTypeModel {

  static ETH_TYPE = 'eth';
  static ERC20_TYPE = 'erc20';

  static IS_NOT_CONTRACT = 0;
  static IS_CONTRACT = 1;
  static STATE_OFF = false;
  static STATE_ON = true;

  /**
   * 获取合约列表
   * @memberof EthCoinTypeModel
   */
  async getContractList() {
    const list = await getRepository(EthCoinType)
      .createQueryBuilder('coinType')
      .select(['coinType.name','coinType.contract_address'])
      .where({
        is_contract: EthCoinTypeModel.IS_CONTRACT,
        state: EthCoinTypeModel.STATE_ON,
        type: EthCoinTypeModel.ERC20_TYPE
      })
      .getMany();
    return list;
  }


  /**
   * 添加合约地址
   * @param {string} name
   * @param {string} contract_address
   * @param {number} decimal
   * @param {string} abi
   * @returns
   * @memberof EthCoinTypeModel
   */
  async addContractAddress(name: string, contract_address: string, decimal: number, calcGasAddress: string, abi: string) {
    const ethCoinType = new EthCoinType;
    ethCoinType.name = name;
    ethCoinType.contract_address = contract_address;
    ethCoinType.is_contract = EthCoinTypeModel.IS_CONTRACT;
    ethCoinType.decimal = decimal;
    ethCoinType.abi = abi;
    ethCoinType.type = EthCoinTypeModel.ERC20_TYPE;
    ethCoinType.state = EthCoinTypeModel.STATE_ON;
    ethCoinType.calc_gas_address = calcGasAddress;
    return await getRepository(EthCoinType).save(ethCoinType);
  }
  
  /**
   * eth配置初始化
   *
   * @returns
   * @memberof EthCoinTypeModel
   */
  async ethTypeInit() {
    const ethCoinType = new EthCoinType;
    ethCoinType.name = 'eth';
    ethCoinType.is_contract = EthCoinTypeModel.IS_NOT_CONTRACT;
    ethCoinType.contract_address = null;
    ethCoinType.decimal = 18;
    ethCoinType.abi = null;
    ethCoinType.type = EthCoinTypeModel.ETH_TYPE;
    ethCoinType.state = EthCoinTypeModel.STATE_ON;
    return await getRepository(EthCoinType).save(ethCoinType);
  }


  /**
   * 获取代币支持列表
   * @returns
   * @memberof EthCoinTypeModel
   */
  async getCoinSupportList() {
    const getContractList = await this.getContractList();
    return getContractList;
  }


  /**
   * 检测合约名称和合约地址并返回代币对象
   * @param {string} nameOrContractAddress
   * @returns
   * @memberof EthCoinTypeModel
   */
  async verifyCoinNameOrContractAddress(nameOrContractAddress: string) {
    let status = false;
    let contractObj: {
      name: string;
      contract_address: string;
    };
    const coinSupportList = await this.getCoinSupportList();
    coinSupportList.map(coin => {
      if(coin.name.toLowerCase() === nameOrContractAddress.toLocaleLowerCase()){
        status = true;
        contractObj = coin;
      }

      if(coin.contract_address.toLowerCase() === nameOrContractAddress.toLocaleLowerCase()){
        status = true;
      }
    })

    if(status) {
      return contractObj;
    }else{
      return status;
    }
  }
  
  /**
   * 获取合约基本信息
   * @param {string} contract_address
   * @returns
   * @memberof EthCoinTypeModel
   */
  async getContractInfo(contract_address: string) {
    const find = await getRepository(EthCoinType)
      .createQueryBuilder('coinType')
      .select(['coinType.abi', 'coinType.calc_gas_address', 'coinType.decimal', 'coinType.name'])
      .where({
        contract_address,
        is_contract: EthCoinTypeModel.IS_CONTRACT,
        type: EthCoinTypeModel.ERC20_TYPE,
        state: EthCoinTypeModel.STATE_ON,
      }).getOne();

    if(find === undefined) {
      SystemRunLogModel.error(`合约地址${contract_address}不存在`, SystemRunLogModel.SCENE_TOKEN_INFO);
      throw new Error(`合约地址${contract_address}不支持`);
    }else{
      let abi: any[];
      let calcGasAddress: string; 
      try {
        abi = JSON.parse(find.abi);  
      } catch (error) {
        SystemRunLogModel.error(`合约地址${contract_address}abi解析错误`, SystemRunLogModel.SCENE_TOKEN_INFO);
        throw new Error(`合约地址${contract_address}abi解析错误`);
      }

      if(find.calc_gas_address.includes('0x')){
        calcGasAddress = find.calc_gas_address;  
      }else{
        SystemRunLogModel.error(`合约地址${contract_address}的计算gas地址不存在`, SystemRunLogModel.SCENE_TOKEN_INFO);
        throw new Error(`合约地址${contract_address}的计算gas地址不存在`);
      }
      
      return {
        abi,
        calcGasAddress,
        name: find.name,
        decimal: find.decimal
      };
    }
  }
}