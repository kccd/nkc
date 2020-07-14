const Router = require('koa-router');
const kcbRouter = new Router();
kcbRouter
  .get('/', async (ctx, next) => {
    const {nkcModules, data, db, query, state} = ctx;
    const {page = 0, t, content, operationId, scoreType} = query;
    const q = {};
    if(t === 'username' && content) {
      const u = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
      if(u) {
        q.$or = [
          {
            from: u.uid
          },
          {
            to: u.uid
          }
        ];
      } else {
        data.info = '用户名不存在';
      }
    } else if(t === 'uid' && content) {
      q.$or = [
        {
          from: content
        },
        {
          to: content
        }
      ];
    } else if(t === 'ip' && content) {
      q.ip = content;
    }
    if(operationId) {
      q.type = operationId;
    }
    if(scoreType) {
      q.scoreType = scoreType;
    }
    data.kcbsTypes = state.language['kcbsTypes'];
    const count = await db.KcbsRecordModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const kcbsRecords = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
    for(const record of data.kcbsRecords) {
      record.typeInfo = ctx.state.lang("kcbsTypes", record.type);
    }
    // data.kcbSettings = (await db.SettingModel.findOnly({_id: 'kcb'})).c;
    data.paging = paging;
    data.t = t;
    data.content = content;
    data.operationId = operationId;
    data.scoreType = scoreType;
    data.scores = await db.SettingModel.getScores();
    data.nkcBankName = await db.SettingModel.getNKCBankName();
    ctx.template = 'experimental/log/kcb.pug';
    await next();
  })
  .get("/diff", async (ctx, next) => {
    const {data, db} = ctx;
    const users = await db.UsersGeneralModel.find({
      "kcbSettings.diff": true
    }).sort({"kcbSettings.time": 1});
    data.users = await Promise.all(users.map(async u => {
      let user = await db.UserModel.findOne({uid: u.uid});
      return {
        username: user.username,
        uid: user.uid,
        diff: u.kcbSettings.diff,
        time: u.kcbSettings.time,
        total: u.kcbSettings.total,
        totalNew: u.kcbSettings.totalNew,
        recordId: u.kcbSettings.recordId
      };
    }));
    ctx.template = "experimental/log/kcbDiff.pug";
    await next();
  })
  .post("/diff", async (ctx, next) => {
    const {body, db} = ctx;
    const {uid} = body;
    const latestRecord = await db.KcbsRecordModel.findOne({
      verify: true,
      $or: [
        {
          from: uid
        },
        {
          to: uid
        }
      ]
    }).sort({toc: -1});
    if(!latestRecord) return;
    const latestRecordId = latestRecord._id;
    // 统计该条记录之前的

    const getKcb = async (uid, latestRecordId) => {
      const fromRecords = await db.KcbsRecordModel.aggregate([
        {
          $match: {
            _id: {
              $lte: latestRecordId
            },
            from: uid,
            verify: true
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$num"
            }
          }
        }
      ]);
      const toRecords = await db.KcbsRecordModel.aggregate([
        {
          $match: {
            _id: {
              $lte: latestRecordId
            },
            to: uid,
            verify: true
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$num"
            }
          }
        }
      ]);
      const expenses = fromRecords.length? fromRecords[0].total: 0;
      const income = toRecords.length? toRecords[0].total: 0;
      return income - expenses;
    };

    const totalLatest = await getKcb(uid, latestRecordId);
    await db.UsersGeneralModel.update({uid}, {
      $set: {
        "kcbSettings.recordId": latestRecordId,
        "kcbSettings.total": totalLatest,
        "kcbSettings.diff": false,
        "kcbSettings.time": Date.now()
      }
    });
    await next();
  });
module.exports = kcbRouter;
