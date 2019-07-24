

export class EthTaskEventModel {

  EVENT_TYPE_ETH = {
    type: '1',
    name: 'sendEthTransaction'
  };

  EVENT_TYPE_TOKEN = {
    type: '1',
    name: 'sendTokenTransaction'
  };

  STATE_UNFINISHED = 1;
  STATE_FINISHE = 2;

  CALLBACK_STATE_UNFINISHED = 0;
  CALLBACK_STATE_SUCCESS = 1;
  CALLBACK_STATE_ERROR = 2;

  
}