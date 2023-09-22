const {
  columnListService,
} = require('../../../services/column/columnList.service');
const listSortTypes = {
  new: 'new',
  sub: 'sub',
  post: 'post',
};

module.exports = async function (ctx, next) {
  const { query, data, db, state } = ctx;
  data.listSortTypes = { ...listSortTypes };
  const columnSettings = await db.SettingModel.getSettings('column');
  const defaultSortType =
    columnSettings.columnHomeSort === 'updateTime'
      ? listSortTypes.new
      : listSortTypes.sub;
  const { page = 0 } = query;
  const { s = defaultSortType } = query;

  const match = {};
  if (!ctx.permission('column_single_disabled')) {
    match.closed = false;
    match.disabled = false;
  }
  const fidOfCanGetThread = await db.ForumModel.getReadableForumsIdByUid(
    data.user ? data.user.uid : '',
  );
  data.permissionHomeHotColumn = ctx.permission('homeHotColumn');
  data.permissionHomeToppedColumn = ctx.permission('homeToppedColumn');
  match.postCount = { $gte: columnSettings.columnHomePostCountMin };
  const count = await db.ColumnModel.countDocuments(match);
  const paging = ctx.nkcModules.apiFunction.paging(page, count);
  const sort = {};
  if (s === listSortTypes.new) {
    sort.tlm = -1;
  } else if (s === listSortTypes.sub) {
    sort.subCount = -1;
  } else {
    sort.postCount = -1;
  }

  data.columns = await db.ColumnModel.find(match, { _v: 0 })
    .sort(sort)
    .skip(paging.start)
    .limit(paging.perpage);
  data.columns = await columnListService.extendColumnsLatestArticles(
    data.columns,
    fidOfCanGetThread,
  );
  data.toppedColumns =
    await columnListService.getToppedColumnsWithLatestArticles(
      fidOfCanGetThread,
    );

  data.s = s;
  data.paging = paging;
  await next();
};
