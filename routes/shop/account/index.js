'user strict'
const Router = require('koa-router');
const accountRouter = new Router();
accountRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.goods = [
      {
        _id: 74185,
        name: '这是商品1',
        info: [
          '2019/3/4 14:48:34 张全蛋（18545623521）正在配送',
          '2019/2/12 12:34:19 快递已从深圳市发往成都市'
        ],
        toc: new Date('2019-3-4 2:32:53')
      },
      {
        _id: 74230,
        name: '这是商品1',
        info: [
          '2019/3/4 14:48:34 张全蛋（18545623521）正在配送',
          '2019/2/12 12:34:19 快递已从深圳市发往成都市'
        ],
        toc: new Date('2019-3-4 2:32:53')
      },
      {
        _id: 74165,
        name: '这是商品1',
        info: [
          '2019/3/4 14:48:34 张全蛋（18545623521）正在配送',
          '2019/2/12 12:34:19 快递已从深圳市发往成都市'
        ],
        toc: new Date('2019-3-4 2:32:53')
      }
    ]
    ctx.template = 'shop/account/account.pug';
    await next();
  });
module.exports = accountRouter;