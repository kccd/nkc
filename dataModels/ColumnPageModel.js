const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    _id: Number,
    columnId: {
      type: String,
      required: true,
      index: 1,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    l: {
      type: String,
      default: 'json',
    },
    t: {
      type: String,
      default: '',
    },
    c: {
      type: String,
      required: true,
    },
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    tlm: {
      type: Date,
      default: null,
    },
    asHome: {
      type: Boolean,
      default: false,
      index: 1,
    },
  },
  {
    collection: 'columnPages',
  },
);
// 记录引用资源的专栏独立页面
schema.pre('save', async function (next) {
  const id = `column-${this._id}`;
  const ResourceModel = mongoose.model('resources');
  if (this.l === 'json') {
    await ResourceModel.toReferenceSourceByJson(id, this.c);
  } else {
    await ResourceModel.toReferenceSource(id, this.c);
  }
  await next();
});

/*
 * 更新搜索数据库中的数据
 * */
schema.statics.toSearch = async (pageId) => {
  const ColumnPageModel = mongoose.model('columnPages');
  const page = await ColumnPageModel.findOne({ _id: pageId });
  if (!page) {
    throwErr(404, `未找到ID为${pageId}的专栏自定义页`);
  }
  await page.saveToElasticSearch();
};

/* 
  保存到搜索数据库
*/
schema.methods.saveToElasticSearch = async function () {
  const data = {
    tid: this._id,
    t: this.t,
    c: this.c,
    toc: this.toc,
    l: this.l,
  };
  const es = require('../nkcModules/elasticSearch');
  await es.save('columnPage', data);
};
/* 
  保存所有的页面到搜索数据库
*/
schema.statics.saveAllColumnPagesToElasticSearch = async () => {
  const ColumnPageModel = mongoose.model('columnPages');
  const count = await ColumnPageModel.coundDocuments();
  const limit = 2000;
  for (let i = 0; i < count; i += limit) {
    const pages = await ColumnPageModel.find()
      .sort({ toc: 1 })
      .limit(limit)
      .skip(i);
    for (const page of pages) {
      await page.saveToElasticSearch();
    }
    console.log(
      `【同步ColumnPage到ES】 总：${count}, 当前：${i} - ${i + limit}`,
    );
  }
  console.log(`【同步ColumnPage到ES完成】 总：${count}`);
};

/*
 * 批量保存所有的页面到搜索数据库
 * @author pengxiguaa 2025-11-13
 */
schema.statics.saveAllColumnPagesToElasticSearchBatch = async () => {
  const ColumnPageModel = mongoose.model('columnPages');
  const elasticSearch = require('../nkcModules/elasticSearch');
  const count = await ColumnPageModel.countDocuments();
  const batchSize = 2000;

  console.log(`开始批量同步 ${count} 个专栏页面到ElasticSearch...`);

  for (let i = 0; i < count; i += batchSize) {
    const pages = await ColumnPageModel.find()
      .sort({ toc: 1 })
      .skip(i)
      .limit(batchSize);

    const documents = pages.map((page) => ({
      docType: 'columnPage',
      document: page,
    }));

    await elasticSearch.bulkSave(documents);
    console.log(
      `【批量同步ColumnPage到ES】 总：${count}, 已完成：${i + pages.length}`,
    );
  }

  console.log('【批量同步ColumnPage到ES】完成');
};
module.exports = mongoose.model('columnPages', schema);
