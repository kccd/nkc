# nkc

## 运行环境

- 基于：**[NodeJS](https://nodejs.org)** v12.14.0 
- 数据库：
    1. **[MongoDB](https://www.mongodb.com)** v4.4.5
    2. **[Redis](https://redis.io/)** v3.2.100
    3. **[ElasticSearch](https://elastic.co)** v6.0.1
- 图片处理：**[ImageMagick](https://www.imagemagick.org)** v7.0.10
- 音视频处理：**[FFmpeg](https://www.ffmpeg.org/)** v4.0.2
- PDF 文件处理：**[Ghostscript](https://www.ghostscript.com/)** v9.53.3, **[QPDF](https://qpdf.sourceforge.io/)** v10.3.2


## 安装并运行 nkc
### 准备
1. 安装运行环境，并将 ImageMagick、Ghostscript、QPDF 以及 FFmpeg 的执行程序添加到环境变量\
   （对于 MongoDB，Redis 和 ElasticSearch ，也可使用 `docker compose` 直接在容器中运行（试验阶段），请自行查看、调整 `docker-compose.yml` ）
2. 安装并运行 **[nkc-media](https://github.com/kccd/nkc-media)**
3. 将 `/defaultData/config` 文件夹复制到根目录 `/config`

### 从源代码安装
1. 拉取当前仓库到本地
2. 执行 `npm i` 安装依赖
3. 执行 `npm run build-pages-p` 使用生产环境编译前端文件\
   （`npm run build-pages` 开发环境）
4. 根据需要调整项目根目录 `config` 文件夹下的配置文件
5. 执行 `pm2 start pm2.config.js` 启动项目\
   （如果遇到启动错误或无限弹框，请在另一个控制台中运行 `pm2 log` 查看输出）
6. 浏览器访问 `localhost:9000`

### 从 Docker 安装
1. 咕咕咕。