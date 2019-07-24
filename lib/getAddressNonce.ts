import jayson from 'jayson';
import dotenv from 'dotenv';
dotenv.config();

const rpc = jayson.Client.http({
  host: process.env.ETHEREUM_NODE_HOST,
  port: process.env.ETHEREUM_NODE_PORT
});

async function getAddressNonce(address): Promise<number> {
  let txPoolNumber = await getTxpoolAddressNumber(address);
  if(txPoolNumber > 0) {
    return txPoolNumber + 1;
  }else{
    let num = await getAddressNum(address);
    return num;
  }
}


function getTxpoolAddressNumber(address): Promise<number> {
  return new Promise((resolve, reject) => {
    rpc.request('txpool_content', [], function(err, res) {
      if(err) {
        reject(err);
      }
      let number = '0';
      if(res.result.pending[address] != undefined) {
        for(const index of Object.keys(res.result.pending[address])) {
          number = index;
        }
        resolve(parseInt(number));
      }else{
        resolve(0);
      }
    });
  });
}

function getAddressNum(address): Promise<number> {
  return new Promise((resolve, reject) => {
    rpc.request('eth_getTransactionCount', [address, 'latest'], function(err, res) {
      if(err) {
        reject(err);
      }
      resolve(parseInt(res.result,16));
    });
  });
}

export default getAddressNonce;
