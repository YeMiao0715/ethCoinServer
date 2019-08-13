import { checkAddress } from '../../lib/utils';
import { ListenAddress } from '../../database/entity/ListenAddress';
import { getRepository } from 'typeorm';


export class ListenAddressModel {


  /** 
   * 查找地址
   * @param {string} address
   * @returns
   * @memberof ListenAddressModel
   */
  async findAddress(address: string) { 
    const find = await getRepository(ListenAddress).findOne({
      address: address
    })
    return find;
  }

  /**
   * 添加一条监听地址
   * @param {string} address
   * @returns
   * @memberof ListenAddressModel
   */
  async saveAddress(address: string) {
    const listenAddress = new ListenAddress;
    try {
      listenAddress.address = checkAddress(address);  
    } catch (error) {
      throw new Error('eth地址解析错误');
    }
    return await getRepository(ListenAddress).save(listenAddress);
  }


  /**
   * 更新区块高度
   * @param {number} id
   * @param {number} blockNumber
   * @param {number} [transactionCount=0]
   * @returns
   * @memberof ListenAddressModel
   */
  async updateBlockNumber(id: number, blockNumber: number, transactionCount: number = 0) {
    const find = await getRepository(ListenAddress).findOne(id);
    if(find.start_block == null) {
      find.start_block = blockNumber;
    }else{
      find.last_block = blockNumber;
    }

    if(transactionCount !== 0) {
      find.transaction_count += transactionCount;
    }
    return await getRepository(ListenAddress).save(find);
  }


  /**
   * 获取监听地址列表
   * @returns
   * @memberof ListenAddressModel
   */
  async getAddressList() {
    const list = await getRepository(ListenAddress)
      .createQueryBuilder('listAddress')
      .select(['listAddress.id', 'listAddress.address'])
      .getMany();
    return list;
  }

}