import { get } from 'request';
import { EthCoinTypeModel } from '../databaseModel/EthCoinTypeModel';
import dec from 'decimal.js';

const url = 'http://api.etherscan.io/api';

const typeAll = 0; 
const typeSend = 1; 
const typeReceive = 2; 
const typeError = 4; 

// 获取eth交易记录
export const getTransactionOfEthList = function (address: string, type: number, page: number = 1, offset: number = 20) {
  
  const queryString = paresQuery({
    module: 'account',
    action: 'txlist',
    startblock: 0,
    endblock: 99999999,
    sort: 'desc',
    address: address,
    page, 
    offset
  });
  return new Promise((resolve, reject) => {
    get(url + queryString, function(error, res, body) {
      if(error) {
        reject(error);
      }else{
        let data = JSON.parse(body);
        if(data.status == 1) {
          let list = [];
          // 获取全部
          switch(type) {
            case typeAll: 
              for(const transaction of data.result) {
                list.push(handleTransaction(transaction))
              }
            break;
            case typeSend: 
              for(const transaction of data.result) {
                if(transaction.from.toLowerCase() == address.toLowerCase()) {
                  list.push(handleTransaction(transaction))
                }
              }
            break;
            case typeReceive: 
              for(const transaction of data.result) {
                if(transaction.to.toLowerCase() == address.toLowerCase()) {
                  list.push(handleTransaction(transaction))
                }
              }
            break;
            case typeError: 
              for(const transaction of data.result) {
                if(transaction.isError == 1) {
                  list.push(handleTransaction(transaction))
                }
              }
              
            break;
          } 
          resolve(list);
        }else{
          reject('服务异常')
        }
      }
    })
  })
}

// 获取token交易记录
export const getTransactionOfTokenList = async function (address: string,coinName: string, type: number, page: number = 1, offset: number = 20) {
  
  const ethCoinTypeModel = new EthCoinTypeModel;
  let contractAddress: string;
  const contractObj = await ethCoinTypeModel.verifyCoinNameOrContractAddress(coinName);
  if (contractObj !== false) {
    contractAddress = contractObj.contract_address;
  }else{
    throw new Error(`[${coinName}] 该币种不支持`);
  }

  const queryString = paresQuery({
    module: 'account',
    action: 'tokentx',
    startblock: 0,
    endblock: 99999999,
    sort: 'desc',
    address: address,
    page, 
    offset
  });

  
  return new Promise((resolve, reject) => {
    get(url + queryString, function(error, res, body) {
      if(error) {
        reject(error);
      }else{
        
        let data = JSON.parse(body);
        if(data.status == 1) {
          let list = [];
          // 获取全部
          switch(type) {
            case typeAll: 
              for(const transaction of data.result) {
                if(transaction.contractAddress.toLowerCase() == contractAddress.toLowerCase()) {
                  list.push(handleTransaction(transaction))
                }
              }
            break;
            case typeSend: 
              for(const transaction of data.result) {
                if(transaction.from.toLowerCase() == address.toLowerCase() && transaction.contractAddress.toLowerCase() == contractAddress.toLowerCase()) {
                  list.push(handleTransaction(transaction))
                }
              }
            break;
            case typeReceive: 
              for(const transaction of data.result) {
                if(transaction.to.toLowerCase() == address.toLowerCase() && transaction.contractAddress.toLowerCase() == contractAddress.toLowerCase()) {
                  list.push(handleTransaction(transaction))
                }
              }
            break;
            case typeError: 
              // for(const transaction of data.result) {
              //   if(transaction.isError == 1 && transaction.contractAddress == contractAddress) {
              //     list.push(handleTransaction(transaction))
              //   }
              // }
            break;
          } 
          resolve(list);
        }else{
          reject('服务异常')
        }
      }
    })
  })
}

const handleTransaction = function(transaction: any) {
  transaction['gasToEth'] = new dec(transaction.gas).mul(transaction.gasPrice).div(10 ** 18).toFixed();
  if(transaction.tokenSymbol !== undefined) {
    transaction['value'] = new dec(transaction.value).div(10 ** transaction.tokenDecimal).toFixed();
  }else{
    transaction.value = new dec(transaction.value).div(10 ** 18).toFixed();
  }
  return transaction;
}

export const paresQuery = function (obj: object): string {
  let queryString: string = '?';
  Object.keys(obj).map(key => {
    queryString += key + '=' + obj[key] + '&';
  });
  return queryString;
}


export const getAddressTransactionList = async function (address: string, coinName: string, type: number, page: number = 1, offset: number = 20) {
  let data: any;
  switch(coinName.toLowerCase()) {
    case 'eth': 
      data = await getTransactionOfEthList(address, type, page, offset);
    break;
    default: 
      data = await getTransactionOfTokenList(address, coinName, type, page, offset);
    break;
  }
  return data;
}