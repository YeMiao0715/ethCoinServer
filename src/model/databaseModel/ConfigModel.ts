import { Config } from './../../database/entity/Config';
import { getRepository } from "typeorm";

export class ConfigModel {

  listenAddress = 'listenAddress';
  notificationUrl = 'notificationUrl';


  /**
   * 保存配置
   *
   * @param {string} param
   * @param {string} value
   * @param {string} [desc=null]
   * @returns
   * @memberof ConfigModel
   */
  async save(param: string, value: string, desc: string = null) {
    const config = await getRepository(Config).findOne(param);
    if(config) {
      config.value = value;
      return await getRepository(Config).save(config);
    }else{
      const config = new Config;
      config.param = param;
      config.value = value;
      config.desc = desc;
      return await getRepository(Config).save(config);
    }
    
  }

  /**
   * 获取监听地址
   *  -- 孪生地址监听
   * @returns
   * @memberof ConfigModel
   */
  async getListenAddress() {
    const config = await this.getConfigValue(this.listenAddress);
    return config.value;
  }


  /**
   * 获取孪生交易通知地址
   *
   * @returns
   * @memberof ConfigModel
   */
  async getNotificationUrl () {
    const config = await this.getConfigValue(this.notificationUrl);
    return config.value;
  }


  /**
   * 获取参数值
   * @param {string} param
   * @returns
   * @memberof ConfigModel
   */
  async getConfigValue(param: string) {
    return await getRepository(Config).findOne(param);
  }

}