const Router = require('koa-router');
const router = new Router();
const routers = require('../requireFolder')(__dirname);
const userRouter = routers.user;
const documentRouter = routers.document;
const draftRouter = routers.draft;
const watermarkRouter = routers.watermark;
const meRouter = routers.me;
const threadRouter = routers.thread;
const postRouter = routers.post;
const forumRouter = routers.forum;
const otherRouter = routers.other;
const experimentalRouter = routers.experimental;
const resourceRouter = routers.resource;
const resourcesRouter = routers.resources;
const fundRouter = routers.fund;
const registerRouter = routers.register;
const downloadRouter = routers.download;
const problemRouter = routers.problem;
const loginRouter = routers.login;
const appRouter = routers.app;
const messageRouter = routers.message;
const activityRouter = routers.activity;
const friendRouter = routers.friend;
const homeRouter = routers.home;
const shareRouter = routers.share;
const lotteryRouter = routers.lottery;
const columnRouter = routers.column;
const columnsRouter = routers.columns;
const examRouter = routers.exam;
const forgotPasswordRouter = routers.forgotPassword;
const shopRouter = routers.shop;
const accountRouter = routers.account;
const complaintRouter = routers.complaint;
const searchRouter = routers.search;
const protocolRouter = routers.protocol;
const reviewRouter = routers.review;
const threadsRouter = routers.threads;
const surveyRouter = routers.survey;
const editorRouter = routers.editor;
const nkcRouter = routers.nkc;
const readerRouter = routers.reader;
const stickerRouter = routers.sticker;
const stickersRouter = routers.stickers;
const verificationsRouter = routers.verifications;
// 访问文库相关
const libraryRouter = routers.library;
const userAvatarRouter = routers.userAvatar;
const userBannerRouter = routers.userBanner;
const creationRouter = routers.creation;
const librariesRouter = routers.libraries;
const noteRouter = routers.note;
// 编辑器公式展示
const mathJaxRouter = routers.mathJax;
// 网站工具
const siteToolsRouter = routers.tools;
// ip信息
const ipinfoRouter = routers.ipinfo;
// 黑名单
const blacklistRouter = routers.blacklist;
// 附件
const attachmentRouter = routers.attachment;
// 支付
const paymentRouter = routers.payment;
// 外链跳转
const linkRouter = routers.link;
// 社区
const communityRouter = routers.community;
// 网站 logo
const logoRouter = routers.logo;
// 产品管理系统
const pimRouter = routers.pim;
//手机浏览器滑动框
const drawDataRouter = routers.drawData;
// 书籍详细页
const bookRouter = routers.book;
//资源分组
const resourceCategoryRouter = routers.resourceCategory;
//图书评论
const commentRouter = routers.comment;
// 空间
const zoneRouter = routers.zone;
// 首页关注
const subscribeRouter = routers.subscribe;
//独立文章
const articleRouter = routers.article;
//动态
const momentRouter = routers.moment;
// 后台设置
const settingsRouter = routers.settings;
// 最新页
const latestRouter = routers.latest;
// 第三方登录
const oauthRouter = routers.oauth;

router
  .use('/', async (ctx, next) => {
    const {db, state, data, settings} = ctx;
    const {operationId, user} = data;
    const isWhitelistOperation = settings.operationsType.whitelistOfGlobalAccessControl.includes(operationId);
    const isResourceOperation = settings.operationsType.fileDownload.includes(operationId);
    if(
      !isWhitelistOperation &&
      (
        !user ||
        !user.certs ||
        !user.certs.includes('dev')
      )
    ) {
      // 非白名单操作且非管理员需要进行全局权限判断
      const sources = await db.AccessControlModel.getSources();
      let permissionChecker = db.AccessControlModel.checkAccessControlPermissionWithThrowError;
      if(
        isResourceOperation ||
        (ctx.request.accepts('json', 'html') === 'json' && ctx.request.get('FROM') === 'nkcAPI')
      ) {
        permissionChecker = db.AccessControlModel.checkAccessControlPermission;
      }
      await permissionChecker({
        isApp: state.isApp,
        uid: state.uid,
        rolesId: data.userRoles.map(role => role._id),
        gradeId: state.uid? data.userGrade._id: undefined,
        source: sources.global,
      });
    }
    await next();
  });
router.use('/', homeRouter.routes(), homeRouter.allowedMethods());
router.use("/library", libraryRouter.routes(), libraryRouter.allowedMethods());
router.use("/libraries", librariesRouter.routes(), librariesRouter.allowedMethods());
router.use("/editor", editorRouter.routes(), editorRouter.allowedMethods());
router.use('/lottery', lotteryRouter.routes(), lotteryRouter.allowedMethods());
router.use('/app', appRouter.routes(), appRouter.allowedMethods());
router.use('/', otherRouter.routes(), otherRouter.allowedMethods());
router.use("/search", searchRouter.routes(), searchRouter.allowedMethods());
router.use('/u', userRouter.routes(), userRouter.allowedMethods());
router.use('/me', meRouter.routes(), meRouter.allowedMethods());
router.use('/t', threadRouter.routes(), threadRouter.allowedMethods());
router.use('/p', postRouter.routes(), postRouter.allowedMethods());
router.use('/f', forumRouter.routes(), forumRouter.allowedMethods());
router.use('/e', experimentalRouter.routes(), experimentalRouter.allowedMethods());
router.use("/nkc", nkcRouter.routes(), nkcRouter.allowedMethods());
router.use('/r', resourceRouter.routes(), resourceRouter.allowedMethods());
router.use('/fund', fundRouter.routes(), fundRouter.allowedMethods());
router.use('/register', registerRouter.routes(), registerRouter.allowedMethods());
router.use('/download', downloadRouter.routes(), downloadRouter.allowedMethods());
router.use('/problem', problemRouter.routes(), problemRouter.allowedMethods());
router.use('/login', loginRouter.routes(), loginRouter.allowedMethods());
router.use('/message', messageRouter.routes(), messageRouter.allowedMethods());
router.use('/activity', activityRouter.routes(),activityRouter.allowedMethods());
router.use('/friend', friendRouter.routes(), friendRouter.allowedMethods());
router.use("/complaint" ,complaintRouter.routes(), complaintRouter.allowedMethods());
router.use('/exam', examRouter.routes(), examRouter.allowedMethods());
router.use('/s', shareRouter.routes(), shareRouter.allowedMethods());
router.use('/forgotPassword', forgotPasswordRouter.routes(), forgotPasswordRouter.allowedMethods());
router.use('/shop', shopRouter.routes(), shopRouter.allowedMethods());
router.use('/account', accountRouter.routes(), accountRouter.allowedMethods());
router.use("/review", reviewRouter.routes(), reviewRouter.allowedMethods());
router.use("/m", columnsRouter.routes(), columnsRouter.allowedMethods());
router.use("/column", columnRouter.routes(), columnRouter.allowedMethods());
router.use('/protocol', protocolRouter.routes(), protocolRouter.allowedMethods());
router.use("/threads", threadsRouter.routes(), threadsRouter.allowedMethods());
router.use("/avatar", userAvatarRouter.routes(), userAvatarRouter.allowedMethods());
router.use("/survey", surveyRouter.routes(), surveyRouter.allowedMethods());
router.use("/rs", resourcesRouter.routes(), resourcesRouter.allowedMethods());
router.use("/reader", readerRouter.routes(), readerRouter.allowedMethods());
router.use("/banner", userBannerRouter.routes(), userBannerRouter.allowedMethods());
router.use("/stickers", stickersRouter.routes(), stickersRouter.allowedMethods());
router.use("/note", noteRouter.routes(), noteRouter.allowedMethods());
router.use("/sticker", stickerRouter.routes(), stickerRouter.allowedMethods());
router.use("/tools", siteToolsRouter.routes(), siteToolsRouter.allowedMethods());
router.use("/ipinfo", ipinfoRouter.routes(), ipinfoRouter.allowedMethods());
router.use('/blacklist', blacklistRouter.routes(), blacklistRouter.allowedMethods());
router.use('/a', attachmentRouter.routes(), attachmentRouter.allowedMethods());
router.use('/verifications', verificationsRouter.routes(), verificationsRouter.allowedMethods());
router.use('/payment', paymentRouter.routes(), paymentRouter.allowedMethods());
router.use('/c', communityRouter.routes(), communityRouter.allowedMethods());
router.use('/pim', pimRouter.routes(), pimRouter.allowedMethods());
router.use("/l", linkRouter.routes(), linkRouter.allowedMethods());
router.use("/wm", watermarkRouter.routes(), watermarkRouter.allowedMethods());
router.use('/logo', logoRouter.routes(), logoRouter.allowedMethods());
router.use('/creation', creationRouter.routes(), creationRouter.allowedMethods());
router.use('/draw', drawDataRouter.routes(), drawDataRouter.allowedMethods());
router.use('/mathJax', mathJaxRouter.routes(), mathJaxRouter.allowedMethods());
router.use('/book', bookRouter.routes(), bookRouter.allowedMethods());
router.use('/document', documentRouter.routes(), documentRouter.allowedMethods());
router.use('/draft', draftRouter.routes(), draftRouter.allowedMethods());
router.use('/rc', resourceCategoryRouter.routes(), resourceCategoryRouter.allowedMethods());
router.use('/comment', commentRouter.routes(), commentRouter.allowedMethods());
router.use('/zone', zoneRouter.routes(), zoneRouter.allowedMethods());
router.use('/g', subscribeRouter.routes(), subscribeRouter.allowedMethods());
router.use('/article', articleRouter.routes(), articleRouter.allowedMethods());
router.use('/moment', momentRouter.routes(), momentRouter.allowedMethods());
router.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods());
router.use('/n', latestRouter.routes(), latestRouter.allowedMethods());
router.use('/oauth', oauthRouter.routes(), oauthRouter.allowedMethods());
module.exports = router;
