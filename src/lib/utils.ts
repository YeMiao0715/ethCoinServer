import { web3 } from "../../config/web3.config";
import dotenv from 'dotenv';
dotenv.config();


export const checkAddress = function(address) {
  address = web3.utils.toChecksumAddress(address);
  web3.utils.checkAddressChecksum(address);
  return address;
}

export const getGasPrice = async function (amount: string| number = null) {
  if(amount !== null) {
    return web3.utils.toWei(amount.toString(), 'gwei');
  }
  if(!isNaN(parseInt(process.env.ETHEREUM_NODE_GASPRICE))) {
    return web3.utils.toWei('5', 'gwei');
  }else{
    return await web3.eth.getGasPrice();
  }
}
