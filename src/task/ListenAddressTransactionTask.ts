import { ListenAddressModel } from "../model/databaseModel/ListenAddressModel";
import { db } from "../database/database";

const listenAddressModel = new ListenAddressModel;
const addressList = new Set();
const addressIndex = new Map();


/**
 * 载入监听地址
 */
async function loadListenAddressList() {
  const list = await listenAddressModel.getAddressList();
  list.map(value => {
    addressList.add(value.address);
    addressIndex.set(value.address, value.id);
  });
}

db().then(async connect => {
  await loadListenAddressList();
  console.log(addressList.has('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad'));
  console.log(addressIndex.get('0x6d1056f53a24Ee9052898bCc30AbCc40166eebad'));

  await connect.close();
})
