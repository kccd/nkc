const fs = require('fs');

/*
 * 推送文件到媒体服务
 * @param {String} url 存储服务的链接
 * @param {Object} fileInfo 待推送的文件信息
 *   @param {String} filePath 文件磁盘路径
 *   @param {String} path 文件在存储服务上的目录
 *   @param {Number} time 文件上传时间戳
 * */
module.exports = async (url, props) => {
  const { type, filePath, coverPath, storeUrl, data } = props;
  const formData = new FormData();
  if (!type) {
    throw new Error(`mediaClient: type 不能为空`);
  }
  if (!filePath) {
    throw new Error(`mediaClient: path 不能为空`);
  }
  formData.append('file', await fs.openAsBlob(filePath));
  if (coverPath) {
    formData.append('cover', await fs.openAsBlob(coverPath), 'cover.png');
  }
  formData.append('type', type);
  formData.append('storeUrl', storeUrl);
  formData.append('data', JSON.stringify(data));

  // 超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60 * 1000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      duplex: 'half',
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const errText = contentType.includes('application/json')
        ? JSON.stringify(await res.json())
        : await res.text();
      throw new Error(
        `mediaClient: 请求失败 ${res.status} ${res.statusText} - ${errText}`,
      );
    }

    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    console.log(err);
    throw err;
  }
};
