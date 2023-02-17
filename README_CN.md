# nkc

## 运行环境

- 基于：**[NodeJS](https://nodejs.org)** v16.14.0 
- 数据库：
    1. **[MongoDB](https://www.mongodb.com)** v4.4.5
    2. **[Redis](https://redis.io/)** v3.2.100
    3. **[ElasticSearch](https://elastic.co)** v6.0.1
- 图片处理：**[ImageMagick](https://www.imagemagick.org)** v7.0.10
- 音视频处理：**[FFmpeg](https://www.ffmpeg.org/)** v4.0.2
- PDF 文件处理：**[Ghostscript](https://www.ghostscript.com/)** v9.53.3, **[QPDF](https://qpdf.sourceforge.io/)** v10.3.2


## 安装并运行 nkc
### 准备
1. 安装运行环境，并将 ImageMagick、Ghostscript、QPDF 以及 FFmpeg 的执行程序添加到系统环境变量中；
2. 安装并运行依赖服务 **[nkc-reverse-proxy](https://github.com/kccd/nkc-reverse-proxy)**、**[nkc-media](https://github.com/kccd/nkc-media)**、**[nkc-render](https://github.com/kccd/nkc-render)**、**[nkc-websocket](https://github.com/kccd/nkc-websocket)**；

### 从源代码安装
1. 拉取当前仓库到本地；
2. 执行 `npm i` 安装依赖；
3. 执行 `npm run build` 初始化目录；
4. 执行 `npm run init` 初始化缓存；
5. 执行 `npm run build-pages-p` 编译前端文件；
6. 根据需要调整项目根目录 `config` 文件夹下的配置文件（默认账号信息在文件 `config/account.json` 中）；
7. 执行 `pm2 start pm2.config.js` 启动项目；
8. 浏览器访问 `localhost:9000`（由于 `nkc-websocket` 服务使用的是非 `9000` 端口，所以需要借助 `nkc-reverse-proxy` 或其他反向代理软件才能连接短消息服务）；
