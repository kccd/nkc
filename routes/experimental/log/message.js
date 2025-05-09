const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const { getUrl } = require('../../../nkcModules/tools');
const nkcRender = require('../../../nkcModules/nkcRender');
const cheerio = require('cheerio');
const { filterMessageContent } = require('../../../nkcModules/xssFilters');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.visitMessageLogs),
  async (ctx, next) => {
    const { db, data, query, nkcModules } = ctx;
    let { c, t, page = 0 } = query;
    ctx.template = 'experimental/log/message.pug';
    if (c && t) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, 'base64').toString()));
      let {
        uidType = 'username',
        tUidType = 'username',
        tUid = '',
        uid = '',
        ip = '',
        et = '',
        st = '',
        keyword = '',
      } = c;
      if (t === 'messages') {
        const q = {
          ty: 'UTU',
        };
        const getUidByType = async (type, data) => {
          if (!data) return;
          if (type === 'uid') return data;
          if (type === 'username') {
            const tUser = await db.UserModel.findOne({
              usernameLowerCase: data.toLowerCase(),
            });
            if (!tUser) {
              // 返回一个错误的用户ID，为了让搜索结果为空。
              return 'null';
            } else {
              return tUser.uid;
            }
          }
        };
        // uid筛选
        uid = await getUidByType(uidType, uid);
        tUid = await getUidByType(tUidType, tUid);
        if (uid && tUid) {
          q.$or = [
            {
              s: uid,
              r: tUid,
            },
            {
              s: tUid,
              r: uid,
            },
          ];
        } else if (uid) {
          q.$or = [
            {
              s: uid,
            },
            {
              r: uid,
            },
          ];
        } else if (tUid) {
          q.$or = [
            {
              s: tUid,
            },
            {
              r: tUid,
            },
          ];
        }
        // ip筛选
        if (ip) {
          q.ip = await db.IPModel.getTokenByIP(ip);
        }
        // 内容筛选
        if (keyword) {
          q.c = new RegExp(keyword, 'ig');
        }
        // 开始时间
        if (st) {
          q.tc = { $gte: st };
        }
        // 结束时间
        if (et) {
          q.tc = { $lte: et };
        }
        const count = await db.MessageModel.countDocuments(q);
        const paging = nkcModules.apiFunction.paging(page, count);
        const messages = await db.MessageModel.find(q)
          .sort({ tc: -1 })
          .skip(paging.start)
          .limit(paging.perpage);
        // 拓展信息信息
        const uids = new Set();
        const ipToken = [];
        const filesId = [];
        messages.map((m) => {
          uids.add(m.s).add(m.r);
          ipToken.push(m.ip);
          if (m.ty === 'UTU' && m.c.fileId) {
            filesId.push(m.c.fileId);
          }
        });
        const ipsObj = await db.IPModel.getIPByTokens(ipToken);
        const users = await db.UserModel.find({ uid: { $in: [...uids] } });
        const usersObj = {};
        users.map((u) => {
          usersObj[u.uid] = u;
        });
        const files = await db.MessageFileModel.find({ _id: { $in: filesId } });
        const filesObj = {};
        files.map((file) => {
          file.extendDefaultFile();
          filesObj[file._id] = file;
        });
        data.messages = [];
        for (const message of messages) {
          const { r, s, tc, c, withdrawn, ip, ty } = message;
          const m = {
            user: usersObj[s],
            targetUser: usersObj[r],
            toc: tc,
            ip: ipsObj[ip],
            withdrawn,
            c,
            content: '',
          };
          if (typeof c !== 'string') {
            if (ty === 'UTU' && c.fileId && filesObj[c.fileId]) {
              const file = filesObj[c.fileId];
              message.contentType = file.type;
              m.c = {
                type: file.type,
                filename: file.defaultFile.name,
                fileId: file._id,
                fileUrl: getUrl('messageResource', file._id),
                fileUrlSM: getUrl(`messageResource`, file._id, `sm`),
                fileCover: getUrl('messageResource', file._id, 'cover'),
                fileSize: file.defaultFile.size,
                fileDuration: file.defaultFile.duration,
              };
            }
          } else {
            if (['UTU'].includes(ty)) {
              const replaceSpace = 'replaceSpace';
              m.content = m.c.replace(
                / /g,
                `<span data-type="${replaceSpace}"></span>`,
              );
              // 处理链接
              m.content = nkcRender.URLifyHTML(m.content);

              const $ = cheerio.load(m.content);

              const spaceElements = $(`span[data-type="${replaceSpace}"]`);
              for (let i = 0; i < spaceElements.length; i++) {
                const spaceElement = spaceElements.eq(i);
                spaceElement.replaceWith(function () {
                  return '&nbsp;';
                });
              }

              m.content = $('body').html() || '';

              // 过滤标签 仅保留标签 a['href']
              m.content = filterMessageContent(m.content);
              // 替换换行符
              m.content = m.content.replace(/\n/g, '<br/>');
              m.content = m.content.replace(/\[f\/(.*?)]/g, function (r, v1) {
                const emojiUrl = getUrl('emoji', v1);
                return '<img class="message-emoji" src="' + emojiUrl + '"/>';
              });
            }
            m.content = `<span>${m.content}</span>`;
          }
          data.messages.push(m);
        }
        data.paging = paging;
      } else {
      }
    }
    await next();
  },
);
module.exports = router;
