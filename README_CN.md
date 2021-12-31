# nkc

## 运行环境

- 基于：[Node.js](https://nodejs.org) v12.14.0 
- 数据库：
    1. **[mongoDB](https://www.mongodb.com)** v4.4.5
    2. **[Redis](https://redis.io/)** v3.2.100
    3. **[ElasticSearch](https://elastic.co)** v6.0.1
- 图片处理：**[ImageMagick](https://www.imagemagick.org)** v7.0.10
- 音视频处理：**[ffmpeg](https://www.ffmpeg.org/)** v4.0.2
- PDF 文件处理：**[Ghostscript](https://www.ghostscript.com/)** v9.53.3, **[QPDF](https://qpdf.sourceforge.io/)** v10.3.2


## 安装
1. 安装运行环境，并将 ImageMagick、Ghostscript、QPDF 以及 FFmpeg 的执行程序添加到环境变量；
2. 安装并运行 **[nkc-media](https://github.com/kccd/nkc-media)** ；
3. 拉取当前仓库到本地；
4. 执行 `npm i` 安装依赖；
5. 执行 `npm run build-pages-p` 编译前端文件；
6. 根据需要调整项目根目录 `config` 文件夹下的配置文件；
7. 执行 `pm2 start pm2.config.js` 启动项目；
8. 浏览器访问 `localhost:9000`；