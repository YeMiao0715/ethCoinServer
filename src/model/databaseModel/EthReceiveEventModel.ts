import { EthCoinTypeModel } from './EthCoinTypeModel';
import { getRepository } from "typeorm";
import { EthReceiveTaskEvent } from "../../database/entity/EthReceiveTaskEvent";

export interface EthEventParam {
  from: string,
  to: string,
  value: string| number
}

export interface TokenEventParam {
  contract: string,
  from: string,
  to: string,
  value: string| number
}

export interface UpdataStateParam {
  state?: number;
  state_message?: string;
  callback_state?: number;
  callback_state_message?: string;
  hash?: string;
  extends?: object;
}

export class EthReceiveTaskEventModel {

  // eth交易
  static EVENT_TYPE_RECEIVE_ETH = {
    type: 1,
    name: 'receiveEthTransaction'
  };

  // token交易
  static EVENT_TYPE_RECEIVE_TOKEN = {
    type: 2,
    name: 'receiveTokenTransaction'
  };

  // 未完成
  static STATE_UNFINISHED = 1;
  static STATE_SUCCESS = 2;
  static STATE_ERROR = 3;


  static CALLBACK_STATE_UNFINISHED = 0;
  static CALLBACK_STATE_SUCCESS = 1;
  static CALLBACK_STATE_ERROR = 2;


  
  /**
   * 添加一条eth接受记录
   * 
   * @param {EthEventParam} eventParam
   * @returns
   * @memberof EthReceiveEventModel
   */
  async addReceiveEthEventObj(eventParam: EthEventParam) {
    const ethReceiveTaskEvent = new EthReceiveTaskEvent;
    ethReceiveTaskEvent.event_type = EthReceiveTaskEventModel.EVENT_TYPE_RECEIVE_ETH.name;
    ethReceiveTaskEvent.type = EthReceiveTaskEventModel.EVENT_TYPE_RECEIVE_ETH.type;
    ethReceiveTaskEvent.event_param = JSON.stringify(eventParam);
    ethReceiveTaskEvent.state = EthReceiveTaskEventModel.STATE_SUCCESS;
    ethReceiveTaskEvent.coin_name = 'eth';
    ethReceiveTaskEvent.callback_state = EthReceiveTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthReceiveTaskEvent).save(ethReceiveTaskEvent);
  }

  
  /**
   * 添加一条token接受记录
   *
   * @param {TokenEventParam} eventParam
   * @returns
   * @memberof EthReceiveEventModel
   */
  async addReceiveTokenEventObj(eventParam: TokenEventParam) {
    const ethReceiveTaskEvent = new EthReceiveTaskEvent;
    ethReceiveTaskEvent.event_type = EthReceiveTaskEventModel.EVENT_TYPE_RECEIVE_TOKEN.name;
    ethReceiveTaskEvent.type = EthReceiveTaskEventModel.EVENT_TYPE_RECEIVE_TOKEN.type;
    ethReceiveTaskEvent.event_param = JSON.stringify(eventParam);
    ethReceiveTaskEvent.state = EthReceiveTaskEventModel.STATE_SUCCESS;
    const ethCoinTypeModel = new EthCoinTypeModel;
    const contractInfo = await ethCoinTypeModel.getContractInfo(eventParam.contract);
    ethReceiveTaskEvent.coin_name = contractInfo.name;
    ethReceiveTaskEvent.callback_state = EthReceiveTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthReceiveTaskEvent).save(ethReceiveTaskEvent);
  }


  /**
   * 更新数据状态
   * 
   * @param {number} id
   * @param {UpdataStateParam} updataStateParam
   * @returns
   * @memberof EthReceiveEventModel
   */
  async updateEventState(id: number, updataStateParam: UpdataStateParam) {
    const find = await getRepository(EthReceiveTaskEvent).findOne(id);
    Object.keys(updataStateParam).map(keys => {
      if(['extends'].includes(keys)) {
        find[keys] = JSON.stringify(updataStateParam[keys]);
      }else{
        find[keys] = updataStateParam[keys];
      }
    })
    return await getRepository(EthReceiveTaskEvent).save(find);
  }

  
  /**
   * 
   *
   * @param {number} id
   * @returns {Promise<EthReceiveEvent>}
   * @memberof EthReceiveEventModel
   */
  async getOne(id: number): Promise<EthReceiveTaskEvent>{
    const find = await getRepository(EthReceiveTaskEvent).findOne(id);
    Object.keys(find).map(keys => {
      if(['event_param', 'extends'].includes(keys) && find[keys] !== null) {
        find[keys] = JSON.parse(find[keys]);
      }
    })
    return find;
  }
  
}