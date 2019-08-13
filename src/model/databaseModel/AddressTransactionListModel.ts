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

  async getUserTransactionList(addressId: number, contractId: number = 0) {
    const list = await getRepository(AddressTransaction)
      .createQueryBuilder('transaction')
      .where({
        address_id: addressId,
      })
  }

}