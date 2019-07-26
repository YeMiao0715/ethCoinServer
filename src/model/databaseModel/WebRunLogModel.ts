import { WebRunLog } from '../../database/entity/WebRunLog';
import { getRepository } from 'typeorm';
import { configure, getLogger } from 'log4js';
import log4Config from '../../../config/LoggerConfig';
configure(log4Config);


export class WebRunLogModel {

  static TYPE_INFO: number = 0;
  static TYPE_ERROR: number = 1;

  /**
   * web运行日志
   * @static
   * @param {string} method
   * @param {string} path
   * @param {object} param
   * @param {string} ip
   * @memberof WebRunLogModel
   */
  static async info(method: string, path: string, param: object, ip: string) {
    const webRunLog = new WebRunLog;
    webRunLog.method = method;
    webRunLog.path = path;
    webRunLog.ip = ip;
    webRunLog.param = JSON.stringify(param);
    webRunLog.type = WebRunLogModel.TYPE_INFO;
    await getRepository(WebRunLog).save(webRunLog);
    this.fileLogInfo(`${ip} ${method} ${path}`, param);
  }

  /**
   * web运行日志
   * @static
   * @param {string} method
   * @param {string} path
   * @param {object} param
   * @param {object} ip
   * @memberof WebRunLogModel
   */
  static async error(method: string, path: string, param: object, ip: string) {
    const webRunLog = new WebRunLog;
    webRunLog.method = method;
    webRunLog.path = path;
    webRunLog.ip = ip;
    webRunLog.param = JSON.stringify(param);
    webRunLog.type = WebRunLogModel.TYPE_ERROR;
    await getRepository(WebRunLog).save(webRunLog);
    this.fileLogError(`${ip} ${method} ${path}`, param);
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