const router = require('koa-router')();
const { OnlyUnbannedUser } = require('../../../../middlewares/permission');
const {
  ThrowForbiddenResponseTypeError,
} = require('../../../../nkcModules/error');
const { ResponseTypes } = require('../../../../settings/response');
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  //获取当前登录用户的独立文章信息
  const { db, data, body } = ctx;
  let { type, columns = [], articlesId, passed = '' } = body;
  const { user } = data;
  ctx.apiData = {};
  // 检查文章是否存在
  // 检查用户是否能够对该文章进行撤稿==>暂时开放给文章主
  if (!type || !articlesId || columns.length === 0) {
    return await next();
  }
  const article = await db.ArticleModel.findOne({
    _id: articlesId,
    source: 'column',
  });
  // 撤稿相关
  if (type === 'retreat' && article && article.uid === user.uid) {
    const columnId = columns[0];
    const columnPosts = await db.ColumnPostModel.findOne({
      columnId: columnId,
      type: 'article',
      pid: articlesId,
    });
    if (!columnPosts) {
      ctx.throw(403, '专栏中不存在该文章');
    }
    const columnContributes = await db.ColumnContributeModel.findOne({
      columnId,
      tid: articlesId,
      source: 'article',
      type: 'retreat',
    }).sort({
      toc: -1,
    });
    if (passed === 'cancel') {
      // 取消撤稿申请
      if (!columnContributes || columnContributes.passed !== 'pending') {
        ctx.throw(400, `文章ID:${articlesId}撤稿申请已失效`);
      }
      await columnContributes.updateOne({
        $set: {
          passed,
        },
      });
      ctx.apiData = {
        passed,
      };
    } else if (passed === 'pending') {
      const sendMessageColumns = new Set();
      const columnObj = {};
      if (columnContributes && columnContributes.passed === 'pending') {
        ctx.throw(400, `文章ID:${articlesId}撤稿申请正在审核中`);
      }
      const column = await db.ColumnModel.findOne({
        _id: columnId,
      });
      // let passed = 'pending';
      let description = '';
      if (column.uid === user.uid) {
        // 专栏主直接撤稿文章
        passed = 'resolve';
        description = '专栏主撤稿';
        await db.ColumnPostModel.deleteOne({
          columnId,
          pid: articlesId,
          type: 'article',
        });
        // 撤稿时清除文章sid中专栏ID片段
        let sidArray = [];
        // let sid = '';
        const columnPostArray = await db.ColumnPostModel.find({
          pid: article._id,
          type: 'article',
        });
        for (const columnPostItem of columnPostArray) {
          sidArray.push(columnPostItem.columnId);
        }
        sidArray = [...new Set(sidArray)];
        await article.updateOne({
          $set: {
            sid: sidArray.join('-'),
          },
        });
      }
      // 创建撤稿申请
      const contribute = db.ColumnContributeModel({
        _id: await db.SettingModel.operateSystemID('columnContributes', 1),
        uid: user.uid,
        tid: articlesId,
        pid: '',
        columnId: columnId,
        source: 'article',
        passed,
        description,
        type: 'retreat',
      });
      await contribute.save();
      sendMessageColumns.add(column.uid);
      columnObj[column.uid] = column._id;
      ctx.apiData = {
        passed,
      };
      for (const columnUid of [...sendMessageColumns]) {
        const message = db.MessageModel({
          _id: await db.SettingModel.operateSystemID('messages', 1),
          r: columnUid,
          ty: 'STU',
          ip: ctx.address,
          port: ctx.port,
          c: {
            type: 'newColumnDisContribute',
            columnId: columnObj[columnUid],
          },
        });
        await message.save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    }
  }
  // 投稿相关
  if (type === 'submit' && article && article.uid === user.uid) {
    // 文章主取消投稿申请
    // 检查文章是否已经在专栏中？？
    // 检查文章投稿申请是否存在
    const columnId = columns[0];
    // const columnPosts = await db.ColumnPostModel.findOne({
    //   columnId: columnId,
    //   type: 'article',
    //   pid: articlesId,
    // });
    // if (columnPosts) {
    //   ctx.throw(403, '专栏中已存在该文章');
    // }
    if (passed === 'cancel') {
      const contribute = await db.ColumnContributeModel.findOne({
        columnId,
        tid: articlesId,
        source: 'article',
        type: 'submit',
      }).sort({
        toc: -1,
      });
      if (!contribute || contribute.passed !== 'pending') {
        ctx.throw(403, '该投稿申请不存在');
      }
      await contribute.updateOne({ passed });
      ctx.apiData = {
        passed,
      };
    }
  }
  await next();
});
module.exports = router;
