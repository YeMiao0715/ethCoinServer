import { TransactionServer } from "../src/model/ether/TransactionModel";

export const sendTokenTransaction = async function (contractAddress: string, from: string, to: string, amount: string| number = 'all') {
  const transaction = new TransactionServer;
  const Tx = await transaction.buildTokenTransaction(contractAddress, from, to, amount);
  console.log(Tx);
}

export const sendEthTransaction = async function (from: string, to: string, amount: string|number = 'all') {
  const transaction = new TransactionServer;
  const Tx = await transaction.buildEthTransaction(from, to, amount);
  console.log(Tx);
}


