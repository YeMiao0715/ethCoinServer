import { EthCoinTypeModel } from './EthCoinTypeModel';
import { getRepository, getManager } from "typeorm";
import { EthTaskEvent } from "../database/entity/EthTaskEvent";

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
}

export class EthTaskEventModel {

  static EVENT_TYPE_ETH = {
    type: 1,
    name: 'sendEthTransaction'
  };

  static EVENT_TYPE_TOKEN = {
    type: 2,
    name: 'sendTokenTransaction'
  };

  static STATE_UNFINISHED = 1;
  static STATE_FINISHE = 2;

  static CALLBACK_STATE_UNFINISHED = 0;
  static CALLBACK_STATE_SUCCESS = 1;
  static CALLBACK_STATE_ERROR = 2;


  /**
   * 添加sendEthTransactionEvent
   * @param {EthEventParam} EventParam
   * @returns
   * @memberof EthTaskEventModel
   */
  async addSendEthEventObj(eventParam: EthEventParam) {
    const ethTaskEvent = new EthTaskEvent;
    ethTaskEvent.event_type = EthTaskEventModel.EVENT_TYPE_ETH.name;
    ethTaskEvent.type = EthTaskEventModel.EVENT_TYPE_ETH.type;
    ethTaskEvent.event_param = JSON.stringify(eventParam);
    ethTaskEvent.state = EthTaskEventModel.STATE_UNFINISHED;
    ethTaskEvent.coin_name = 'eth';
    ethTaskEvent.callback_state = EthTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthTaskEvent).save(ethTaskEvent);
  }

  /**
   * 添加sendTokenTransactionEvent
   * @param {TokenEventParam} eventParam
   * @returns
   * @memberof EthTaskEventModel
   */
  async addSendTokenEventObj(eventParam: TokenEventParam) {
    const ethTaskEvent = new EthTaskEvent;
    ethTaskEvent.event_type = EthTaskEventModel.EVENT_TYPE_ETH.name;
    ethTaskEvent.type = EthTaskEventModel.EVENT_TYPE_ETH.type;
    ethTaskEvent.event_param = JSON.stringify(eventParam);
    ethTaskEvent.state = EthTaskEventModel.STATE_UNFINISHED;
    const ethCoinTypeModel = new EthCoinTypeModel;
    const contractInfo = await ethCoinTypeModel.getContractInfo(eventParam.contract);
    ethTaskEvent.coin_name = contractInfo.name;
    ethTaskEvent.callback_state = EthTaskEventModel.CALLBACK_STATE_UNFINISHED;
    return await getRepository(EthTaskEvent).save(ethTaskEvent);
  }

  async updateEventState(id: number, updataStateParam: UpdataStateParam) {
    const find = await getRepository(EthTaskEvent).findOne(id);
    Object.keys(updataStateParam).map(keys => {
      find[keys] = updataStateParam[keys];
    })
    return await getRepository(EthTaskEvent).save(find);
  }
  
}