import { SystemRunLog } from '../../database/entity/SystemRunLog';
import { configure, getLogger } from 'log4js';
import log4Config from '../../config/LoggerConfig';
import { getRepository } from 'typeorm';
configure(log4Config);

export class SystemRunLogModel {

  static TYPE_INFO: number = 0;
  static TYPE_ERROR: number = 1;

  static SCENE_SYSTEM_INFO: number = 0;
  static SCENE_ETH_INFO: number = 1;
  static SCENE_TOKEN_INFO: number = 2;
  static SCENE_HTTPS_INFO: number = 3;
  
  /**
   * 添加普通日志
   * @param {string} logs
   * @param {number} scene
   * @param {object} [extend={}]
   * @memberof LogModel
   */
  static async info(logs: string, scene: number, extend: object = {}) {
    const log = new SystemRunLog;
    log.log = logs;
    log.scene = scene;
    log.type = SystemRunLogModel.TYPE_INFO;
    log.extends = JSON.stringify(extend);
    await getRepository(SystemRunLog).save(log);
    this.fileLogInfo(logs, extend);
    return true;
  }

  /**
   * 添加error日志
   * @param {string} logs
   * @param {number} scene
   * @param {object} [extend={}]
   * @memberof LogModel
   */
  static async error(logs: string, scene: number, extend: object = {}) {
    const log = new SystemRunLog;
    log.log = logs;
    log.scene = scene;
    log.type = SystemRunLogModel.TYPE_ERROR;
    log.extends = JSON.stringify(extend);
    await getRepository(SystemRunLog).save(log);
    this.fileLogError(logs, extend);
    return true;
  }


  /**
   * 文件日志
   * @param {string} logs
   * @param {object} [extend={}]
   * @memberof LogModel
   */
  static fileLogInfo(logs: string, extend: object = {}) {
    getLogger().info(logs, extend);
  }


  /**
   * 文件日志
   * @param {string} logs
   * @param {object} [extend={}]
   * @memberof LogModel
   */
  static fileLogError(logs: string, extend: object = {}) {
    getLogger('error').error(logs, extend);
  }
}