import { getGasPrice, checkAddress } from "../src/lib/utils";
import { expect } from "chai";


describe('lib utils test', () => {


  it('获取全局设置的gasPrice 价格', async() => {
    const gasPrice = await getGasPrice();
    expect(gasPrice).to.be.a('string');
  })

  it('检测用户地址', async() => {
    checkAddress('0x6d1056f53a24Ee9052898bCc30AbCc40166eebab');
    try {
      checkAddress('');
    } catch (error) {
      expect(error).to.be.an('error');
    }

    try {
      checkAddress('0x6d1056f53a24Ee9052898bCc30AbCc40166eeba');
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });


});