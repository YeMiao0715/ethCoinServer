import { SendEthTransactionOption, SendTokenTransactionOption } from './../src/queue/sendTransactionQueue';
import { expect } from "chai";
import net from 'net';
import dotenv from 'dotenv';
dotenv.config();

describe('SendTransactionQueue Test', () => {
  
  it('发送一笔eth数据', async () => {
    const sendEthTransactionOption: SendEthTransactionOption = {
      from: '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad',
      to: '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8',
      value: 0.001
    }
    net.connect(process.env.QUEUE_PORT).write(JSON.stringify(sendEthTransactionOption));  
  })

  it('发送一笔token数据', async () => {
    const sendTokenTransactionOption: SendTokenTransactionOption = {
      from: '0x6d1056f53a24Ee9052898bCc30AbCc40166eebad',
      to: '0xF02C7B189aDB95207AF90Fbd05347E1C58301Df8',
      value: 0.001,
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
    net.connect(process.env.QUEUE_PORT).write(JSON.stringify(sendTokenTransactionOption));  
  })


});