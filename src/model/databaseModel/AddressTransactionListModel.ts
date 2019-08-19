import { AddressTransaction } from './../../database/entity/AddressTransaction';
import { getRepository } from 'typeorm';


export class AddressTransactionListModel {

  static TYPE_SEND = 1;
  static TYPE_RECEIVE = 2;

  /**
   * 保存记录
   * @param {number} type
   * @param {number} addressId
   * @param {number} blockNumber
   * @param {string} hash
   * @param {string} from
   * @param {string} to
   * @param {string} amount
   * @param {string} coinId
   * @param {object} extend
   * @memberof AddressTransactionListModel
   */
  async saveTransaction(
    type: number, 
    addressId: number, 
    coinId: number, 
    blockNumber: number, 
    hash: string, 
    from: string, 
    to: string, 
    amount: string, 
    extend: object) {
    const find = await getRepository(AddressTransaction)
      .createQueryBuilder('transaction')
      .select(['transaction.id'])
      .where({
        address_id: addressId,
        coin_id: coinId,
        block_number: blockNumber,
        hash
      }).getOne();
    if(!find){
      const addressTransaction = new AddressTransaction;
      addressTransaction.type = type;
      addressTransaction.address_id = addressId;
      addressTransaction.coin_id = coinId;
      addressTransaction.block_number = blockNumber.toString();
      addressTransaction.hash = hash;
      addressTransaction.from = from;
      addressTransaction.to = to;
      addressTransaction.amount = amount;
      addressTransaction.extends = JSON.stringify(extend);
      return await getRepository(AddressTransaction).save(addressTransaction);
    }
  }


  /**
   * 获取地址交易列表
   * @param {number} addressId
   * @param {number} coinId
   * @param {number} [page=0]
   * @param {number} [limit=20]
   * @returns
   * @memberof AddressTransactionListModel
   */
  async getUserTransactionList(addressId: number, coinId: number, type: number | string = 0, page: number = 0, limit: number = 20) {
    let list: AddressTransaction[];
    if(type == 0) {
      list = await getRepository(AddressTransaction)
        .createQueryBuilder('transaction')
        .where({
          address_id: addressId,
          coin_id: coinId
        })
        .orderBy('create_time', 'DESC')
        .getMany();
    }else{
      list = await getRepository(AddressTransaction)
        .createQueryBuilder('transaction')
        .where({
          address_id: addressId,
          coin_id: coinId,
          type: type
        })
        .orderBy('create_time', 'DESC')
        .getMany();
    }
    return list;
  }

}