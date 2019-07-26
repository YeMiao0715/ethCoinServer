import { web3 } from "../../config/web3.config";



export const checkAddress = function(address) {
  address = web3.utils.toChecksumAddress(address);
  web3.utils.checkAddressChecksum(address);
  return address;
}
