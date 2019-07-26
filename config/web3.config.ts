import Web3 from 'web3';
import dotenv from 'dotenv';
dotenv.config();

export const web3 = new Web3(`http://${process.env.ETHEREUM_NODE_HOST}:${process.env.ETHEREUM_NODE_PORT}`);

