const router = require('koa-router')();

router
  .get('/', async (ctx, next) => {
    const {db, query, data, nkcModules} = ctx;
    const {nkcRender} = nkcModules;
    const {page = 0, t} = query;
    if(t === 'page') {
      const count = await db.ColumnPageModel.countDocuments({});
      const paging = nkcModules.apiFunction.paging(page, count);
      const pages = await db.ColumnPageModel.find({})
        .sort({toc: -1})
        .skip(paging.start)
        .limit(paging.perpage);
      const references = [];
      const columnsId = pages.map(p => {
        references.push(`column-${p._id}`);
        return p.columnId;
      });
      const resources = await db.ResourceModel.getResourcesByReference(references);
      const resourcesObj = {};
      resources.map(r => {
        for(const re of r.references) {
          if(!resourcesObj[re]) resourcesObj[re] = [];
          resourcesObj[re].push(r);
        }
      });
      const columns = await db.ColumnModel.find({_id: {$in: columnsId}});
      const columnsObj = {};
      columns.map(c => columnsObj[c._id] = c);
      const colors = ['red', 'green', 'blue', '#791E94', 'yellow', '#87314e'];
      let colorIndex = 0;
      const getColor = () => {
        const color = colors[colorIndex];
        colorIndex ++;
        if(colorIndex > colors.length - 1) {
          colorIndex = 0;
        }
        return color;
      };
      data.pages = pages.map(p => {
        p = p.toObject();
        p.column = columnsObj[p.columnId];
        const pageResources = resourcesObj[`column-${p._id}`] || [];
        p.c = nkcRender.renderHTML({
          type: 'article',
          post: {
            c: p.c,
            resources: pageResources
          },
        });
        p.color = getColor();
        return p;
      });
      data.paging = paging;
      data.t = t;
    } else {
      const count = await db.ColumnModel.countDocuments({});
      const paging = nkcModules.apiFunction.paging(page, count);
      const columns = await db.ColumnModel.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      data.columns = await db.ColumnModel.extendColumns(columns);
      data.paging = paging;
    }
    data.nav = "column";
    ctx.template = 'nkc/column/column.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    await next();
  });

module.exports = router;