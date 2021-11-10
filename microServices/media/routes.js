const router = require('koa-router')();
const services = require('./services');
router
  .post('/', async (ctx, next) => {
    const {data, body} = ctx;
    const {files, fields} = body;
    const {file, cover} = files;
    const {type, info} = fields;
    setImmediate(() => {
      services[type]({
        file,
        cover,
        info,
        type
      });
    });
    await next();
  });

module.exports = router;