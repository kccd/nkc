const {getTargetFilePath} = require('../tools')
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  for(const file of files) {
    const {path, time} = file;
    file.storePath = await getTargetFilePath(Number(time), path);
  }
  data.files = files;
  await next();

}
