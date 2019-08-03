import { EtherServer } from './../server/EtherServer';
import { ListenAddressModel } from "../model/databaseModel/ListenAddressModel";
import { db } from "../database/database";
import { BlockRecordModel } from "../model/databaseModel/BlockRecordModel";
import { web3 } from "../../config/web3.config";
import { Transaction } from "web3/eth/types";
import { EthCoinTypeModel } from "../model/databaseModel/EthCoinTypeModel";
import { AddressTransactionListModel } from '../model/databaseModel/AddressTransactionListModel';
import { SystemRunLogModel } from '../model/databaseModel/SystemRunLogModel';
import dec from 'decimal.js';

const listenAddressModel = new ListenAddressModel;
const blockRecord = new BlockRecordModel;
const ethCoinTypeModel = new EthCoinTypeModel;
const etherServer = new EtherServer;
const addressTransactionListModel = new AddressTransactionListModel;

const transactionListenAddressList = new Set();
const transactionListenAddressIndex = new Map();
const contractListenList = new Set();
const contractListenIndex = new Map();

async function listenAddressInit() {
  await loadTransactionListenAddressList();
  await loadContractListenList();
}

/**
 * 载入交易监听地址列表
 */
async function loadTransactionListenAddressList() {
  const list = await listenAddressModel.getAddressList();
  list.map(value => {
    if(!transactionListenAddressList.has(value.address)) {
      transactionListenAddressList.add(value.address);
      transactionListenAddressIndex.set(value.address, value.id);
    }
  })
}

/**
 * 载入合约监听列表
 */
async function loadContractListenList() {
  const list = await ethCoinTypeModel.getContractList();
  list.map(value => {
    if(!contractListenList.has(value.contract_address)) {
      contractListenList.add(value.contract_address);
      contractListenIndex.set(value.contract_address, value.id);
    }
  })
}

/**
 * 获取最后区块高度
 * @returns
 */
async function getLastBlockNum() {
  let chainsLastNum = await web3.eth.getBlockNumber();
  let onBlockNum: number;
  const lastBlockNum = await blockRecord.getLastBlockNum();
  if (!lastBlockNum) {
    onBlockNum = chainsLastNum;
  } else {
    if (chainsLastNum > lastBlockNum + 4) {
      onBlockNum = lastBlockNum + 1;
    } else {
      await sellp(5000);
      await listenAddressInit();
      return await getLastBlockNum();
    }
  }
  return onBlockNum;
}

/**
 * 分发交易
 * @param {Transaction} transaction
 */
async function distributeTransaction(transaction: Transaction) {

  if (contractListenList.has(transaction.to)) {
    // 分发合约
    const logs = await etherServer.analysisTransaction(transaction.hash)
    for (const log of logs) {
      if (transactionListenAddressList.has(log.from)) {
        // 合约send记录
        await saveTokenTransaction(log, AddressTransactionListModel.TYPE_SEND, log.from);
      }

      if (transactionListenAddressList.has(log.to)) {
        // 合约接受记录
        await saveTokenTransaction(log, AddressTransactionListModel.TYPE_RECEIVE, log.to);

        if(log.to === '') {
          // TODO: 对某地址进行特殊操作
        }
      }
    }
  }else{
    // 分发合约记录
    if (transactionListenAddressList.has(transaction.from)) {
      // send记录
      await saveEthTransaction(transaction, AddressTransactionListModel.TYPE_SEND, transaction.from);
    }
  
    if (transactionListenAddressList.has(transaction.to)) {
      // 接受记录
      await saveEthTransaction(transaction, AddressTransactionListModel.TYPE_RECEIVE, transaction.to);
    }
  }
}

/**
 * 保存eth交易消息
 * @param {Transaction} transaction
 * @param {number} type
 * @param {string} eventAddress
 */
async function saveEthTransaction(transaction: Transaction, type: number, eventAddress: string) {
  await SystemRunLogModel.info('处理hash ' + transaction.hash, SystemRunLogModel.SCENE_LIENT_INFO);
  const addressId = transactionListenAddressIndex.get(eventAddress);
  try {
    await addressTransactionListModel.saveTransaction(
      type,
      addressId,
      0,
      transaction.blockNumber,
      transaction.hash,
      transaction.from,
      transaction.to,
      web3.utils.fromWei(transaction.value, 'ether'),
      transaction
    )
    await listenAddressModel.updateBlockNumber(addressId, transaction.blockNumber, 1);  
  } catch (error) {
    console.log(error);
  }
}


/**
 * 保存token交易消息
 * @param {*} transaction
 * @param {number} type
 * @param {string} eventAddress
 */
async function saveTokenTransaction(transaction: any, type: number, eventAddress: string) {
  await SystemRunLogModel.info('处理hash ' + transaction.hash, SystemRunLogModel.SCENE_LIENT_INFO);
  const addressId = transactionListenAddressIndex.get(eventAddress);
  const contractId = contractListenIndex.get(transaction.contract);
  const tokenInfo = await ethCoinTypeModel.getContractInfoOfId(contractId);
  try {
    await addressTransactionListModel.saveTransaction(
      type,
      addressId,
      contractId,
      transaction.blockNumber,
      transaction.hash,
      transaction.from,
      transaction.to,
      new dec(transaction.amount).div(10 ** tokenInfo.decimal).toString(),
      transaction
    )
    await listenAddressModel.updateBlockNumber(addressId, transaction.blockNumber, 1);  
  } catch (error) {
    console.log(error);
  }
}

/**
 * 暂停方法
 * @param {*} time
 * @returns
 */
function sellp(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  })
}


async function start() {
  await listenAddressInit();
  const lastBlockNum = await getLastBlockNum();
  const blockData = await web3.eth.getBlock(lastBlockNum, true);
  await SystemRunLogModel.info('处理区块 ' + lastBlockNum, SystemRunLogModel.SCENE_LIENT_INFO);
  blockData.transactions.map(transaction => {
    distributeTransaction(transaction)
  })
  await blockRecord.saveBlockRecord(lastBlockNum, blockData.transactions.length);
  start();
}

async function one(blockNumber) {
  await listenAddressInit();
  // console.log(transactionListenAddressList);
  // console.log(transactionListenAddressIndex);
  // console.log(contractListenList);
  // console.log(contractListenIndex);
  const blockData = await web3.eth.getBlock(blockNumber, true);
  blockData.transactions.map(transaction => {
    distributeTransaction(transaction)
  })
  await blockRecord.saveBlockRecord(blockNumber, blockData.transactions.length);
}

db().then(connect => {
  start();
  // one(8276915);
})
