const SettingModel = require('../../dataModels/SettingModel');
const ColumnPostModel = require('../../dataModels/ColumnPostModel');
const ColumnModel = require('../../dataModels/ColumnModel');
const { getUrl } = require('../../nkcModules/tools');

class ColumnListService {
  async getColumnsObjectByColumnsId(columnsId) {
    const columns = await ColumnModel.find({
      _id: {
        $in: columnsId,
      },
    });
    const obj = {};
    for (const column of columns) {
      obj[column._id] = column;
    }
    return obj;
  }
  async getColumnsByColumnsId(columnsId) {
    const columnsObject = await this.getColumnsObjectByColumnsId(columnsId);
    const columns = [];
    for (const id of columnsId) {
      const column = columnsObject[id];
      if (!column) {
        continue;
      }
      columns.push(column);
    }
    return columns;
  }
  async getToppedColumns() {
    const { toppedColumnsId } = await SettingModel.getSettings('home');
    return await this.getColumnsByColumnsId(toppedColumnsId);
  }

  async extendColumnsLatestArticles(columns, fidOfCanGetThread) {
    const arr = [];
    for (let column of columns) {
      column = column.toObject();
      column.latestThreads = await ColumnPostModel.getLatestThreads(
        column._id,
        3,
        fidOfCanGetThread,
      );
      arr.push(column);
    }
    return arr;
  }

  async getToppedColumnsWithLatestArticles(fidOfCanGetThread) {
    const toppedColumns = await this.getToppedColumns();
    return await this.extendColumnsLatestArticles(
      toppedColumns,
      fidOfCanGetThread,
    );
  }

  async getHotColumns() {
    const { columnsId } = await SettingModel.getSettings('home');
    return await this.getColumnsByColumnsId(columnsId);
  }

  async extendColumnBaseInfo(column) {
    return {
      _id: column._id,
      avatarUrl: getUrl('columnAvatar', column.avatar),
      name: column.name,
      abbr: column.abbr,
      subCount: column.subCount,
      postCount: column.postCount,
      homeUrl: getUrl('columnHome', column._id),
    };
  }

  async extendColumnsBaseInfo(columns) {
    const arr = [];
    for (const column of columns) {
      const info = await this.extendColumnBaseInfo(column);
      arr.push(info);
    }
    return arr;
  }
}

module.exports = {
  columnListService: new ColumnListService(),
};
