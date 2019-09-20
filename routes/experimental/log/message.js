const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    let {c, t, page = 0} = query;
    ctx.template = "experimental/log/message.pug";
    if(c && t) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString()));
      const {tUid = "", uid = "", ip = "", et = "", st = "", keyword = ""} = c;
      if(t === "messages") {
        const q = {
          ty: "UTU"
        };
        // uid筛选
        if(uid && tUid) {
          q.$or = [
            {
              s: uid,
              r: tUid
            },
            {
              s: tUid,
              r: uid
            }
          ];
        } else if(uid) {
          q.$or = [
            {
              s: uid
            },
            {
              r: uid
            }
          ]
        } else if(tUid) {
          q.$or = [
            {
              s: tUid
            },
            {
              r: tUid
            }
          ]
        }
        // ip筛选
        if(ip) {
          q.ip = ip;
        }
        // 内容筛选
        if(keyword) {
          q.c = new RegExp(keyword, "ig");
        }
        // 开始时间
        if(st) {
          q.tc = {$gte: st}
        }
        // 结束时间
        if(et) {
          q.tc = {$lte: et}
        }
        const count = await db.MessageModel.count(q);
        const paging = nkcModules.apiFunction.paging(page, count);
        const messages = await db.MessageModel.find(q).sort({tc: -1}).skip(paging.start).limit(paging.perpage);
        // 拓展信息信息
        const uids = new Set();
        messages.map(m => {
          uids.add(m.s).add(m.r);
        });
        const users = await db.UserModel.find({uid: {$in: [...uids]}});
        const usersObj = {};
        users.map(u => {
          usersObj[u.uid] = u;
        });
        data.messages = [];
        for(const message of messages) {
          const {r, s, tc, c, withdrawn, ip} = message;
          const m = {
            user: usersObj[s],
            targetUser: usersObj[r],
            toc: tc,
            ip,
            withdrawn,
            c
          };
          data.messages.push(m);
        }
        data.paging = paging;
      } else {

      }
    }
    await next();
  });
module.exports = router;