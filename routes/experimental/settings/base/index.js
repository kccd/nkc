const Router = require('koa-router');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const baseRouter = new Router();
baseRouter
  .get(
    '/',
    OnlyOperation(Operations.visitWebBaseSettings),
    async (ctx, next) => {
      const { data } = ctx;
      data.type = 'base';
      ctx.template = 'experimental/settings/base.pug';
      await next();
    },
  )
  .put('/', OnlyOperation(Operations.modifyWebBase), async (ctx, next) => {
    const { db, body } = ctx;
    let { fields, files } = body;
    let {
      siteIcon,
      links,
      websiteCode,
      websiteName,
      websiteAbbr,
      github,
      backgroundColor,
      copyright,
      record,
      description,
      keywords,
      brief,
      telephone,
      statement,
    } = JSON.parse(fields['settings']);
    let { siteicon } = files;
    if (!websiteName) ctx.throw(400, '网站名不能为空');
    if (!websiteCode) ctx.throw(400, `网站代号不能为空`);
    websiteName = websiteName.trim();
    record = record
      .filter((r) => !!r.title)
      .map((r) => {
        const { title = '', url = '' } = r;
        return {
          title: title.trim(),
          url: url.trim(),
        };
      });
    const serverSettings = await db.SettingModel.findOnly({ _id: 'server' });
    const obj = {
      c: {
        websiteCode,
        websiteName,
        websiteAbbr,
        github,
        backgroundColor,
        copyright,
        record,
        statement,
        description,
        keywords,
        brief,
        telephone,
        links,
        siteIcon: siteIcon,
      },
    };
    if (siteicon) {
      await db.SettingModel.saveSiteLog(siteicon.path);
    }
    await serverSettings.updateOne(obj);
    await db.SettingModel.saveSettingsToRedis('server');
    await next();
  });
module.exports = baseRouter;
