import { EtherServer } from './../server/EtherServer';
import { ListenAddressModel } from "../model/databaseModel/ListenAddressModel";
import { db } from "../database/database";
import { BlockRecordModel } from "../model/databaseModel/BlockRecordModel";
import { web3 } from "../../config/web3.config";
import { Transaction } from "web3/eth/types";
import { EthCoinTypeModel } from "../model/databaseModel/EthCoinTypeModel";

const listenAddressModel = new ListenAddressModel;
const blockRecord = new BlockRecordModel;
const ethCoinTypeModel = new EthCoinTypeModel;
const etherServer = new EtherServer;
const a

const transactionListenAddressList = new Set();
const transactionListenAddressIndex = new Map();
const contractListenList = new Set();

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
    transactionListenAddressList.add(value.address);
    transactionListenAddressIndex.set(value.address, value.id);
  });
}

/**
 * 载入合约监听列表
 */
async function loadContractListenList() {
  const list = await ethCoinTypeModel.getContractList();
  list.map(value => {
    contractListenList.add(value.contract_address);
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
  if(!lastBlockNum) {
    onBlockNum = chainsLastNum;
  }else{
    if(chainsLastNum > lastBlockNum + 4) {
      onBlockNum = lastBlockNum + 1;
    }else{
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
  if(transactionListenAddressList.has(transaction.from)) {
    // TODO: send记录

  }

  if(transactionListenAddressList.has(transaction.to)) {
    // TODO: 接受记录
  }

  if(contractListenList.has(transaction.to)) {
    // TODO: 分发合约
    const logs = await etherServer.analysisTransaction(transaction.hash)
    logs.map(log => {
      if(transactionListenAddressList.has(log.from)) {
        // TODO: 合约send记录
      }
    
      if(transactionListenAddressList.has(log.to)) {
        // TODO: 合约接受记录
      }
    });
  }
}

async function saveTransaction() {

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
  // console.log(addressList.has('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad'));
  // console.log(addressIndex.get('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad'));
  const lastBlockNum = await getLastBlockNum();
  const blockData = await web3.eth.getBlock(lastBlockNum, true);
  blockData.transactions.map(transaction => {
    distributeTransaction(transaction)
  })
  await blockRecord.saveBlockRecord(lastBlockNum, blockData.transactions.length);
  await start();
}

db().then(async connect => {
  await start();
  await connect.close();
})
