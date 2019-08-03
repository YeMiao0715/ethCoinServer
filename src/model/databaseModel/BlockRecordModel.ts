import { BlockRecord } from "../../database/entity/BlockRecord";
import { getRepository } from "typeorm";


export class BlockRecordModel {

  /**
   * 获取最后扫描的区块
   * @returns
   * @memberof BlockRecordModel
   */
  async getLastBlockNum() {
    const find = await getRepository(BlockRecord)
      .createQueryBuilder('block')
      .select('block.block_number')
      .orderBy('block.block_number', 'DESC')
      .getOne();
    
    if(find === undefined) {
      return false;
    }
    return find.block_number;
  }

  /**
   * 保存区块扫描记录
   * @param {number} blockNumber
   * @param {number} transactionCount
   * @returns
   * @memberof BlockRecordModel
   */
  async saveBlockRecord(blockNumber: number, transactionCount: number) {
    const blockRecord = new BlockRecord;
    blockRecord.block_number = blockNumber;
    blockRecord.transaction_count = transactionCount;
    return await getRepository(BlockRecord).save(blockRecord);
  }


  /**
   * 捕获交易数量+1
   * @param {number} blockNumber
   * @param {number} [captureNum=1]
   * @returns
   * @memberof BlockRecordModel
   */
  async captureInc(blockNumber: number, captureNum: number = 1) {
    const find = await getRepository(BlockRecord).findOne(blockNumber);
    find.capture_num += captureNum;
    return await getRepository(BlockRecord).save(find);
  }


  /**
   * 区块确认次数增加
   * @param {number} blockNumber
   * @param {number} [affertNum=1]
   * @returns
   * @memberof BlockRecordModel
   */
  async affertInc(blockNumber: number, affertNum: number = 1) {
    const find = await getRepository(BlockRecord).findOne(blockNumber);
    find.affert_num += affertNum;
    return await getRepository(BlockRecord).save(find);
  }

}