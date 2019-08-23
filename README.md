# eth节点交互服务

## 服务安装
```
  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
  $ nvm install 10
  $ npm i -g yarn pm2 typescript ts-node
  $ pm2 install typescript
  $ #安装依赖
  $ yarn 
```

[CentOS7 安装RabbitMQ](https://www.cnblogs.com/liaojie970/p/6138278.html)

---
## eth配置节点等信息
> 将 **.env.default** 文件改名为 **.env** 并配置环境项
---
## 初始化数据库并增加2个默认币种
```
 $ yarn run init
```
> 文件目录为 **/src/init/Init.ts** 可自行研究修改
---
## 启动
```
 $ yarn pm2 
```
## 重启
```
 $ yarn restart
```

