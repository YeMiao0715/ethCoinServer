# eth节点交互服务

## 服务安装
```
  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/
  install.sh | bash
  $ nvm install 10
  $ npm i -g yarn
  $ yarn 
```
---
## 全局依赖
```
  $ npm i -g pm2 typescript ts-node
  $ pm2 install typescript
```
---
## eth配置节点等信息
> 将 **.env.default** 文件改名为 **.env** 并配置环境项
---
## 初始化数据库并增加2个默认币种
```
 $ yarn coinTypeInit
```
> 文件目录为 **/src/init/EthCoinType.init.ts** 可自行研究修改
---
## 启动
```
 $ pm2 start start.json
```

