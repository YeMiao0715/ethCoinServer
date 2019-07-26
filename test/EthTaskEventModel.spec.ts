import { EthTaskEventModel, EthEventParam, TokenEventParam } from '../src/model/databaseModel/EthTaskEventModel';
import { db } from "../src/database/database";
import { expect } from 'chai';

describe('EthTaskEventModel', () => {

  var connect;
  const ethTaskEventModel = new EthTaskEventModel;

  before(async function() {
    connect = await db().then(connect => connect);
  })
  
  it('添加一条ethSendTransaction事件记录', async () => {
      const ethEventParam: EthEventParam = {
        from: '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad',
        to: '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8',
        value: 0.1
      }
      const save = await ethTaskEventModel.addSendEthEventObj(ethEventParam);
      expect(save).to.be.not.empty;
      expect(save.coin_name).to.be.eq('eth');
      expect(save.callback_state).to.be.eq(EthTaskEventModel.CALLBACK_STATE_UNFINISHED);
      expect(save.state).to.be.eq(EthTaskEventModel.STATE_UNFINISHED);
      expect(save.state_message).to.be.null;
      expect(save.callback_state_message).to.be.null;
      expect(save.event_param).to.be.eq(JSON.stringify(ethEventParam));
      expect(save.extends).to.be.null;
  });

  it('添加一条TokenSendTransaction事件记录', async () => {
      const tokenEventParam: TokenEventParam = {
        contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        from: '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad',
        to: '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8',
        value: 0.1
      }
      const save = await ethTaskEventModel.addSendTokenEventObj(tokenEventParam);
      expect(save).to.be.not.empty;
      expect(save.coin_name).to.be.eq('usdt');
      expect(save.callback_state).to.be.eq(EthTaskEventModel.CALLBACK_STATE_UNFINISHED);
      expect(save.state).to.be.eq(EthTaskEventModel.STATE_UNFINISHED);
      expect(save.state_message).to.be.null;
      expect(save.callback_state_message).to.be.null;
      expect(save.event_param).to.be.eq(JSON.stringify(tokenEventParam));
      expect(save.extends).to.be.null;
  });

  it('更新一条事件状态', async () => {
      const save = await ethTaskEventModel.updateEventState(1, {
        state: EthTaskEventModel.STATE_FINISHE,
        state_message: 'ssss',
        callback_state: EthTaskEventModel.CALLBACK_STATE_SUCCESS,
        callback_state_message: 'cccc'
      })
      expect(save).to.not.empty;
      expect(save.state).to.eq(EthTaskEventModel.STATE_FINISHE);
      expect(save.state_message).to.eq('ssss');
      expect(save.callback_state).to.eq(EthTaskEventModel.CALLBACK_STATE_SUCCESS);
      expect(save.callback_state_message).to.eq('cccc');
  });

  after(async function() {
    await connect.close();
  });
});