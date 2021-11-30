const fileProcessor = require("../services/fileProcessor");
module.exports = async (ctx, next) => {
  const {body} = ctx;
  const {files, fields} = body;
  const {file, cover} = files;
  let {type, storeUrl, data} = fields;
  data = JSON.parse(data);
  ctx.data.files = await fileProcessor[type]({
    file,
    cover,
    data,
    storeUrl
  });
  await next();
};