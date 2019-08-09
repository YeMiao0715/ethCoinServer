import { EthCoinTypeModel } from './EthCoinTypeModel';
import { getRepository } from "typeorm";
import { EthSendTaskEvent } from "../../database/entity/EthSendTaskEvent";

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
  block_number?: number;
  extends?: object;
}

export class EthSendTaskEventModel {

  static EVENT_TYPE_ETH = {
    type: 1,
    name: 'sendEthTransaction'
  };

  static EVENT_TYPE_TOKEN = {
    type: 2,
    name: 'sendTokenTransaction'
  };

  static EVENT_TYPE_TOPUP = {
    type: 3,
    name: 'topUpTransaction'
  }

  static STATE_UNFINISHED = 1;
  static STATE_FINISHE = 2;
  static STATE_ERROR = 3;

  static CALLBACK_STATE_UNFINISHED = 0;
  static CALLBACK_STATE_SUCCESS = 1;
  static CALLBACK_STATE_ERROR = 2;


  /**
   * 添加sendEthTransactionEvent
   * @param {EthEventParam} EventParam
   * @returns
   * @memberof EthSendTaskEventModel
   */
  async addSendEthEventObj(eventParam: EthEventParam) {
    const ethSendTaskEvent = new EthSendTaskEvent;
    ethSendTaskEvent.event_type = EthSendTaskEventModel.EVENT_TYPE_ETH.name;
    ethSendTaskEvent.type = EthSendTaskEventModel.EVENT_TYPE_ETH.type;
    ethSendTaskEvent.event_param = JSON.stringify(eventParam);
    ethSendTaskEvent.state = EthSendTaskEventModel.STATE_UNFINISHED;
    const ethCoinTypeModel = new EthCoinTypeModel;
    const ethInfo = await ethCoinTypeModel.getEthInfo();
    ethSendTaskEvent.coin_id = ethInfo.id;
    ethSendTaskEvent.callback_state = EthSendTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthSendTaskEvent).save(ethSendTaskEvent);
  }

  /**
   * 添加sendTokenTransactionEvent
   * @param {TokenEventParam} eventParam
   * @returns
   * @memberof EthSendTaskEventModel
   */
  async addSendTokenEventObj(eventParam: TokenEventParam) {
    const ethSendTaskEvent = new EthSendTaskEvent;
    ethSendTaskEvent.event_type = EthSendTaskEventModel.EVENT_TYPE_TOKEN.name;
    ethSendTaskEvent.type = EthSendTaskEventModel.EVENT_TYPE_TOKEN.type;
    ethSendTaskEvent.event_param = JSON.stringify(eventParam);
    ethSendTaskEvent.state = EthSendTaskEventModel.STATE_UNFINISHED;
    const ethCoinTypeModel = new EthCoinTypeModel;
    const contractInfo = await ethCoinTypeModel.getContractInfo(eventParam.contract);
    ethSendTaskEvent.coin_id = contractInfo.id;
    ethSendTaskEvent.callback_state = EthSendTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthSendTaskEvent).save(ethSendTaskEvent);
  }


  /**
   * 更新数据状态
   * @param {number} id
   * @param {UpdataStateParam} updataStateParam
   * @returns
   * @memberof EthSendTaskEventModel
   */
  async updateEventState(id: number, updataStateParam: UpdataStateParam) {
    const find = await getRepository(EthSendTaskEvent).findOne(id);
    Object.keys(updataStateParam).map(keys => {
      if(['extends'].includes(keys)) {
        find[keys] = JSON.stringify(updataStateParam[keys]);
      }else{
        find[keys] = updataStateParam[keys];
      }
    })
    return await getRepository(EthSendTaskEvent).save(find);
  }


  async getOne(id: number) {
    const find = await getRepository(EthSendTaskEvent).findOne(id);
    Object.keys(find).map(keys => {
      if(['event_param', 'extends'].includes(keys) && find[keys] !== null) {
        find[keys] = JSON.parse(find[keys]);
      }
    })
    return find;
  }
  
}