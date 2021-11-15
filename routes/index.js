const Router = require('koa-router');
const router = new Router();
const routers = require('../requireFolder')(__dirname);
const userRouter = routers.user;
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
const newResourceRouter = routers.newResource;
const librariesRouter = routers.libraries;
const noteRouter = routers.note;
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

const path = require('path');

router.use('/', async (ctx, next) => {
  const {data, state, db, nkcModules, settings} = ctx;
  const {user, operationId} = data;
  if(
    !user &&
    !settings.operationsType.whitelistOfVisitorLimit.includes(operationId)
  ) {
    const visitSettings = await db.SettingModel.getSettings('visit');
    if(visitSettings.globalLimitVisitor.status) {
      data.description = nkcModules.nkcRender.plainEscape(visitSettings.globalLimitVisitor.description);
      if(!state.isApp) ctx.status = 401;

      return ctx.body = nkcModules.render(path.resolve(__dirname, '../pages/filter_visitor.pug'), data, state);
    }
  }
  await next();
});

router.use('/', homeRouter.routes(), homeRouter.allowedMethods());
router.use("/nr", newResourceRouter.routes(), newResourceRouter.allowedMethods());
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
router.use('/payment', paymentRouter.routes(), paymentRouter.allowedMethods())
router.use('/c', communityRouter.routes(), communityRouter.allowedMethods())
router.use("/l", linkRouter.routes(), linkRouter.allowedMethods());
router.use("/wm", watermarkRouter.routes(), watermarkRouter.allowedMethods());
module.exports = router;
