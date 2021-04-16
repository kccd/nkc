const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    let {c, t, page = 0} = query;
    ctx.template = "experimental/log/message.pug";
    if(c && t) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString()));
      let {uidType = "username", tUidType = "username", tUid = "", uid = "", ip = "", et = "", st = "", keyword = ""} = c;
      if(t === "messages") {
        const q = {
          ty: "UTU"
        };
        const getUidByType = async (type, data) => {
          if(!data) return;
          if(type === "uid") return data;
          if(type === "username") {
            const tUser = await db.UserModel.findOne({usernameLowerCase: data.toLowerCase()});
            if(!tUser) {
              // 返回一个错误的用户ID，为了让搜索结果为空。
              return "null"
            } else {
              return tUser.uid;
            }
          }
        };
        // uid筛选
        uid = await getUidByType(uidType, uid);
        tUid = await getUidByType(tUidType, tUid);
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
          q.ip = await db.IPModel.getTokenByIP(ip);
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
        const count = await db.MessageModel.countDocuments(q);
        const paging = nkcModules.apiFunction.paging(page, count);
        const messages = await db.MessageModel.find(q).sort({tc: -1}).skip(paging.start).limit(paging.perpage);
        // 拓展信息信息
        const uids = new Set();
        const ipToken = [];
        messages.map(m => {
          uids.add(m.s).add(m.r);
          ipToken.push(m.ip);
        });
        const ipsObj = await db.IPModel.getIPByTokens(ipToken);
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
            ip: ipsObj[ip],
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
