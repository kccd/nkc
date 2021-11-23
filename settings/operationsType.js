module.exports = {
  usersBehavior: [
    'visitHome',         'postToForum',
    'visitForumLatest',  'viewForumFollowers',
    'submitLogin',       'logout',
    'visitPost',         'visitThread',
    'collectThread',     'visitForumHome',
    'viewForumVisitors', 'unSubscribeForum',
    'subscribeForum',    'postToThread',
    'subscribeUser',     'unSubscribeUser',

    'post-vote-up',      'post-vote-down'
  ],
  timeLine: [ 'postToForum', 'postToThread' ],
  experimental: [
    'updateFundBanner',
    'modifyWebBase',
    'addRole',
    'deleteOperationType',
    'addForum',
    'modifyForumInfo',
    'addForumCategory',
    'modifyForumPermission',
    'modifyFundBill',
    'deleteFundBill',
    'addFund',
    'deleteFundObject',
    'disableHistories',
    'modifyQuestion',
    'toppedThread',
    'unBannedUser',
    'updateFundLogo',
    'deleteRole',
    'addOperationType',
    'modifyOperation',
    'modifyOperationType',
    'modifyUsersGradeSettings',
    'modifyKcbSettings',
    'logParamsSettingModify',
    'sendSystemInfo',
    'deleteForum',
    'modifyForumCategory',
    'modifyFundSettings',
    'addFundBill',
    'modifyFundObject',
    'unToppedThread',
    'bannedUser'
  ],
  files: [
    "getAttachment",
    "getUserAvatar",
    "getUserBanner",
    "column_single_avatar_get",
    "column_single_Banner_get",
    "getHomeLogo",
    "getActivityPoster",
    "getForumAvatar",
    "getResources",
    "getThumbs",
    "getMediums",
    "getDefaultImage",
    "getOrigins",
    "getThreadCover",
    "getVideoImg",
    "getSiteSpecific",
    "getAttachmentIcon",
    "getFundLogo",
    "getFundBanner",
    "getPhoto",
    "getSmallPhoto",
    "visitForumBanner",
    "getMessageFile"
  ],
  whitelistOfVisitorLimit: [
    'visitLogin',
    'submitLogin',
    'getRegisterCode',
    'submitRegister',
    'sendLoginMessage',
    'getVerifications',
    'registerSubscribe',
    'sendRegisterMessage',
    'sendGetBackPasswordMessage',
    'sendPhoneMessage',

    'visitFindPasswordByMobile', // 忘记密码相关
    'visitFindPasswordByEmail',
    'findPasswordVerifyMobile',
    'modifyPasswordByMobile',
    'findPasswordSendVerifyEmail',
    'modifyPasswordByEmail',
    'findPasswordVerifyEmail',

    'visitAppDownload', // app 相关
    'downloadApp',
    'APPcheckout',

    'rechargePost', // 支付相关
    'receiveAliPayPaymentInfo',
    'receiveWeChatPaymentInfo',
    'fundDonation'
  ],
  whitelistOfClosedFund: [

  ],
  fileDownload: [
    'getResources',
    'getAttachment',
    'visitVerifiedUpload',
    'auditorVisitVerifiedUpload',
    'getMessageFile',
    'getSticker'
  ]
}
