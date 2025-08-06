module.exports = {
  _id: 'STU',
  name: '应用提醒',
  description: '应用提醒',
  templates: [
    {
      parameters: ['threadTitle', 'threadID', 'threadURL'],
      content: '您发表的文章[url=threadURL(threadTitle)]已被列入精选。',
      type: 'digestThread',
    },
    {
      parameters: ['articleTitle', 'articleURL'],
      content: '您发表的文章[url=articleURL(articleTitle)]已被列入精选。',
      type: 'digestArticle',
    },
    {
      parameters: ['commentURL'],
      content: '您发表的回复已被列入精选，[url=commentURL(查看)]。',
      type: 'digestComment',
    },
    {
      parameters: ['postID', 'postURL'],
      content: '您发表的回复已被列入精选，[url=postURL(查看)]。',
      type: 'digestPost',
    },
    {
      parameters: [
        'threadTitle',
        'threadID',
        'threadURL',
        'scoreNumber',
        'scoreName',
      ],
      content:
        '您发表的文章[url=threadURL(threadTitle)]已被列入精选，发放创作激励[text=scoreName][text=scoreNumber]元。',
      type: 'digestThreadWithMoney',
    },
    {
      parameters: ['articleTitle', 'articleURL', 'scoreNumber', 'scoreName'],
      content:
        '您发表的文章[url=articleURL(articleTitle)]已被列入精选，发放创作激励[text=scoreName][text=scoreNumber]元。',
      type: 'digestArticleWithMoney',
    },
    {
      parameters: ['commentURL', 'scoreNumber', 'scoreName'],
      content:
        '您发表的回复已被列入精选，发放创作激励[text=scoreName][text=scoreNumber]元，[url=commentURL(查看)]。',
      type: 'digestCommentWithMoney',
    },
    {
      parameters: ['postID', 'postURL', 'scoreNumber', 'scoreName'],
      content:
        '您发表的回复已被列入精选，发放创作激励[text=scoreName][text=scoreNumber]元，[url=postURL(查看)]。',
      type: 'digestPostWithMoney',
    },
    {
      parameters: [
        'threadID',
        'threadURL',
        'threadTitle',
        'postContent',
        'postURL',
        'postID',
        'userID',
        'username',
        'userURL',
      ],
      content:
        '用户[url=userURL(username)]在文章[url=threadURL(threadTitle)]中@了你，[url=postURL(查看)]。',
      type: 'at',
    },
    {
      parameters: ['username', 'userURL', 'reviewLink', 'title'],
      content:
        '用户[url=userURL(username)]在文章[url=reviewLink(title)]中@了你，[url=reviewLink(查看)]。',
      type: 'articleAt',
    },
    {
      parameters: ['userUrl', 'reviewLink', 'title', 'username'],
      content:
        '用户[url=userURL(username)]在文章[url=reviewLink(title)]中@了你，[url=reviewLink(查看)]。',
      type: 'commentAt',
    },
    {
      parameters: [
        'userID',
        'userURL',
        'username',
        'threadID',
        'threadURL',
        'threadTitle',
        'postID',
        'postURL',
      ],
      content:
        '用户[url=userURL(username)]在文章[url=threadURL(threadTitle)]中引用了你的回复，[url=postURL(查看)]。',
      type: 'replyPost',
    },
    {
      parameters: [
        'userID',
        'userURL',
        'username',
        'threadID',
        'threadURL',
        'threadTitle',
        'postID',
        'postURL',
        'postContent',
      ],
      content:
        '用户[url=userURL(username)]在您的文章/回复[url=threadURL(threadTitle)]下发表了回复/评论，[url=postURL(点击查看)]（可能因审核等原因延期显示）。  \n以下是回复/评论内容：[text=postContent]',
      type: 'replyThread',
    },
    {
      parameters: [
        'userURL',
        'username',
        'articleURL',
        'articleTitle',
        'commentURL',
        'commentContent',
      ],
      content:
        '用户[url=userURL(username)]在您的文章/回复[url=articleURL(articleTitle)]下发表了回复/评论，[url=commentURL(点击查看)]。  \n以下是回复/评论内容：[text=commentContent]',
      type: 'replyArticle',
    },
    {
      parameters: [
        'userURL',
        'username',
        'articleURL',
        'articleTitle',
        'commentURL',
      ],
      content:
        '用户[url=userURL(username)]在文章[url=articleURL(articleTitle)]中引用了你的回复，[url=commentURL(查看)]。',
      type: 'replyComment',
    },
    {
      parameters: [
        'reason',
        'threadTitle',
        'threadURL',
        'threadID',
        'editThreadURL',
        'deadline',
      ],
      content:
        '您的标题为[url=threadURL(threadTitle)]的文章由于[text=reason]等原因，已被退回，目前只有您自己可以查看。请您在 72 小时之内（[text=deadline]）修改文章内容，消除存在的问题，并确保符合规章。点击[url=editThreadURL(这里)]进行修改。逾期未修改，文章将被彻底屏蔽，不可恢复，届时不再另行通知。',
      type: 'threadWasReturned',
    },
    {
      parameters: [
        'reason',
        'threadTitle',
        'threadURL',
        'threadID',
        'editPostURL',
        'deadline',
      ],
      content:
        '您在文章标题为[url=threadURL(threadTitle)]下的回复由于[text=reason]等原因，已被退回，目前只有您自己可以查看。请您在 72 小时之内（[text=deadline]）修改回复内容，消除存在的问题，并确保符合规章。点击[url=editPostURL(这里)]进行修改。逾期未修改，回复将被彻底屏蔽，不可恢复，届时不再另行通知。',
      type: 'postWasReturned',
    },
    {
      parameters: ['reason', 'threadTitle', 'threadURL', 'threadID'],
      content:
        '您的标题为[url=threadURL(threadTitle)]的文章由于[text=reason]等原因，已被屏蔽。该操作不可恢复，也不接受申诉。请您在下次发表时，认真对照国家法律法规、社区规章，确保标题和内容清晰详细，品质优良。请勿发表常识性问题。',
      type: 'bannedThread',
    },
    {
      parameters: ['reason', 'threadTitle', 'threadURL', 'threadID'],
      content:
        '您在文章标题为[url=threadURL(threadTitle)]下的回复由于[text=reason]等原因，已被屏蔽。该操作不可恢复，也不接受申诉。请您在下次发表时，认真对照国家法律法规、论坛规章，确保标题和内容清晰详细，品质优良。请勿发表没有营养的内容。',
      type: 'bannedPost',
    },
    {
      parameters: ['username', 'userID', 'userAuthApplyURL'],
      content: '有新的身份认证申请待审核，[url=userAuthApplyURL(查看)]。',
      type: 'userAuthApply',
    },
    {
      parameters: ['sellerOrderListURL', 'orderID'],
      content: '您有新的订单，[url=sellerOrderListURL(立即查看)]。',
      type: 'shopSellerNewOrder',
    },
    {
      parameters: ['orderID', 'buyerOrderURL'],
      content: '您的订单状态已更新，[url=buyerOrderURL(立即查看)]。',
      type: 'shopBuyerOrderChange',
    },
    {
      parameters: ['orderID', 'sellerOrderURL'],
      content: '订单[text=orderID]买家已付款，[url=sellerOrderURL(立即查看)]。',
      type: 'shopBuyerPay',
    },
    {
      parameters: ['orderID', 'sellerOrderURL'],
      content:
        '订单[text=orderID]买家已确认收货，[url=sellerOrderURL(立即查看)]。',
      type: 'shopBuyerConfirmReceipt',
    },
    {
      parameters: ['orderID', 'buyerOrderURL'],
      content: '订单[text=orderID]卖家已发货，[url=buyerOrderURL(立即查看)]。',
      type: 'shopSellerShip',
    },
    {
      parameters: ['orderID', 'buyerOrderURL'],
      content:
        '订单[text=orderID]已被卖家取消，[url=buyerOrderURL(立即查看)]。如有疑问请与卖家友好协商。',
      type: 'shopSellerCancelOrder',
    },
    {
      parameters: ['orderID', 'sellerOrderRefundURL'],
      content:
        '订单[text=orderID]买家申请退款，[url=sellerOrderRefundURL(立即查看)]。',
      type: 'shopBuyerApplyRefund',
    },
    {
      parameters: ['orderID', 'buyerOrderRefundURL'],
      content:
        '订单[text=orderID]的退款状态有更新，[url=buyerOrderRefundURL(立即查看)]。',
      type: 'shopBuyerRefundChange',
    },
    {
      parameters: ['orderID', 'sellerOrderRefundURL'],
      content:
        '订单[text=orderID]的退款状态有更新，[url=sellerOrderRefundURL(立即查看)]。',
      type: 'shopSellerRefundChange',
    },
    {
      type: 'warningPost',
      parameters: [
        'postURL',
        'postID',
        'threadID',
        'threadURL',
        'threadTitle',
        'editPostURL',
        'reason',
      ],
      content:
        '基于您在文章[url=threadURL(threadTitle)]下发表的回复，管理员做出如下提醒：[text=reason]。如需修改内容请点击[url=editPostURL(这里)]。',
    },
    {
      type: 'warningThread',
      parameters: [
        'threadID',
        'threadURL',
        'threadTitle',
        'reason',
        'editThreadURL',
      ],
      content:
        '基于您发表的文章[url=threadURL(threadTitle)]，管理员做出如下提醒：[text=reason]。如需修改内容请点击[url=editThreadURL(这里)]。',
    },
    {
      parameters: ['reviewLink'],
      content:
        '有待审核的内容，请及时处理。[url=reviewLink(立即查看)] 本消息为群发消息，审核事项可能已被其他工作人员处理。',
      type: 'newReview',
    },
    {
      parameters: ['reviewLink'],
      content: '您发表的内容已通过审核，[url=reviewLink(立即查看)]。',
      type: 'passReview',
    },
    {
      parameters: ['reviewLink', 'title'],
      content:
        '您发布的内容[url=reviewLink(title)]已通过审核，[url=reviewLink(立即查看)]。',
      type: 'documentPassReview',
    },
    {
      parameters: ['reviewLink', 'title', 'reason'],
      content:
        '您发布的内容[url=reviewLink(title)]由于[text=reason]等原因已被退回，目前只有您自己可以查看。请您在72小时之内修改恢复内容，消除存在的问题，并确保符合规章，点击 [url=reviewLink(这里)] 查看。逾期未修改，内容将被彻底屏蔽，不可恢复，届时不再另行通知。',
      type: 'documentFaulty',
    },
    {
      parameters: ['reviewLink', 'title', 'reason'],
      content:
        '您发布的内容[text=reviewLink(title)]由于[text=reason]等原因已被屏蔽，不可恢复。请您发布内容时确保符合规章，消除存在的问题，否则下次将您的内容标记违规。',
      type: 'documentDisabled',
    },
    {
      parameters: ['reviewLink', 'reason', 'content'],
      content:
        '您发布的动态:[text=content]由于[text=reason]等原因已被删除。不可恢复，请您发布内容时确保符合规章，消除存在的问题，否则下次将您的内容标记为违规。',
      type: 'momentDelete',
    },
    {
      parameters: ['reviewLink', 'content'],
      content:
        '您发布的动态[text=content]已通过审核， 点击[url=reviewLink(这里)] 查看',
      type: 'momentPass',
    },
    {
      parameters: ['reviewLink', 'title', 'content'],
      content:
        '您在文章[url=reviewLink(title)]下发表的回复[text=content]已通过审核，[url=reviewLink(立即查看)]。',
      type: 'commentPassReview',
    },
    {
      parameters: ['reviewLink', 'title', 'reason', 'content'],
      content:
        '您在文章[url=reviewLink(title)]下发表的评论[text=content]由于[text=reason]等原因已被退回，目前只有您自己可以查看。请您在72小时之内修改恢复内容，消除存在的问题，并确保符合规章，点击 [url=reviewLink(这里)] 查看。逾期未修改，内容将被彻底屏蔽，不可恢复，届时不再另行通知。',
      type: 'commentFaulty',
    },
    {
      parameters: ['reviewLink', 'title', 'reason'],
      content:
        '您在文章[url=reviewLink(title)]下发表的评论[text=content]由于[text=reason]等原因已被屏蔽，不可恢复。请您发布内容时确保符合规章，消除存在的问题，否则下次将您的内容标记违规',
      type: 'commentDisabled',
    },
    {
      parameters: [
        'applicationFormURL',
        'applicationFormID',
        'applicationFormCode',
      ],
      content:
        '【科创基金】你的申报项目[text=applicationFormCode]状态有更新，请及时处理。[url=applicationFormURL(立即查看)]',
      type: 'fundApplicant',
    },
    {
      parameters: [
        'applicationFormURL',
        'applicationFormID',
        'applicationFormCode',
      ],
      content:
        '【科创基金】申报项目[text=applicationFormCode]需要审核，请及时处理（处理入口在页面右侧，手机版在右侧工具栏，可能因其他工作人员已经审核/屏蔽而没有入口/无法查看），[url=applicationFormURL(立即查看)]',
      type: 'fundAdmin',
    },
    {
      parameters: [
        'applicationFormURL',
        'applicationFormID',
        'username',
        'userURL',
      ],
      content:
        '【科创基金】用户[url=userURL(username)]邀请你一起申报科创基金，请及时处理。[url=applicationFormURL(立即查看)]',
      type: 'fundMember',
    },
    {
      parameters: ['postURL', 'xsfCount'],
      content:
        '为了表彰您发言的学术交流贡献，特颁发[text=xsfCount]学术分。[url=postURL(立即查看)]（如果分数为负，则系违规处罚）',
      type: 'xsf',
    },
    {
      type: 'comment',
      parameters: ['postURL', 'postContent', 'userURL', 'username', 'userID'],
      content:
        '用户[url=userURL(username)]在您的回复/评论下发表了评论，[url=postURL(立即查看)]（可能因为审核等原因延期显示）。\n以下是评论内容：[text=postContent]',
    },
    {
      content:
        '您的专栏 [url=columnURL(columnName)] 有新的投稿申请，[url=columnContributeURL(立即查看)]',
      type: 'newColumnContribute',
      parameters: ['columnContributeURL', 'columnURL', 'columnName'],
    },
    {
      content:
        '您的专栏 [url=columnURL(columnName)] 有新的撤稿申请，[url=columnContributeURL(立即查看)]',
      type: 'newColumnDisContribute',
      parameters: ['columnContributeURL', 'columnURL', 'columnName'],
    },
    {
      content:
        '您在专栏 [url=columnURL(columnName)] 的投稿状态已更新，[url=userContributeURL(立即查看)]',
      type: 'columnContributeChange',
      parameters: ['userContributeURL', 'columnURL', 'columnName'],
    },
    {
      content:
        '您在专栏 [url=columnURL(columnName)] 的撤稿状态已更新，[url=userContributeURL(立即查看)]',
      type: 'columnDisContributeChange',
      parameters: ['userContributeURL', 'columnURL', 'columnName'],
    },
    {
      type: 'disabledColumn',
      parameters: ['columnName', 'columnURL', 'reason'],
      content:
        '由于违反相关法律法规和政策，您的专栏 [text=columnName] 已被屏蔽。可能包括但不限于下列原因：[text=reason]',
    },
    {
      type: 'disabledColumnInfo',
      parameters: ['columnName', 'columnURL', 'reason', 'columnInfoType'],
      content:
        '由于违反相关法律法规和政策，您的专栏 [url=columnURL(columnName)] 中的 [text=columnInfoType] 已被屏蔽。可能包括但不限于下列原因：[text=reason]   建议您自查整改，整改完成后经管理员审核，方可恢复。',
    },
    {
      type: 'columnContactAdmin',
      parameters: ['columnName', 'columnURL'],
      content:
        '专栏 [url=columnURL(columnName)] 中违规的信息已经修改，请及时处理。',
    },
    {
      parameters: ['activityUrl', 'activityTitle', 'noticeContent', 'cTitle'],
      type: 'activityChangeNotice',
      content:
        '[text=cTitle] 你报名参加的[url=activityUrl(activityTitle)]活动，有新的通知，敬请留意。通知内容：[text=noticeContent]',
    },
    {
      type: 'problemFixed',
      parameters: ['problemTitle', 'restorerURL', 'restorerName', 'problemURL'],
      content:
        '你上报的问题[text=problemTitle]已被修复，[url=problemURL(立即查看)]。',
    },
    {
      parameters: [
        'username',
        'postURL',
        'scoreNumber',
        'scoreName',
        'threadTitle',
      ],
      content:
        '[text=username]在文章[text=threadTitle]向你转账[text=scoreNumber][text=scoreName]以资鼓励[url=postURL(立即查看)]。',
      type: 'scoreTransfer',
    },
    {
      parameters: ['LVUsernames', 'LVTotal', 'LVTarget', 'LVTargetDesc'],
      content:
        '[text=LVUsernames]等[text=LVTotal]人赞了你的[url=LVTarget(LVTargetDesc)]👍！',
      type: 'latestVotes',
    },
    {
      parameters: [
        'CRReason',
        'CRResult',
        'CRType',
        'CRTarget',
        'CRTargetDesc',
      ],
      type: 'complaintsResolve',
      content:
        '你投诉的[text=CRType][url=CRTarget(CRTargetDesc)]已经被处理。\n投诉理由：[text=CRReason]\n处理说明：[text=CRResult]',
    },
    {
      parameters: ['NFRUserProfile', 'NFRUserName', 'NFRName', 'NFRReview'],
      type: 'newForumReview',
      content:
        '用户[url=NFRUserProfile(NFRUserName)]申请创建专业[text=NFRName]，请及时[url=NFRReview(审核)]',
    },
    {
      parameters: ['IFUserProfile', 'IFUserName', 'IFName', 'IFAcceptPageUrl'],
      type: 'inviteFounder',
      content:
        '用户[url=IFUserProfile(IFUserName)]邀请你成为新专业[text=IFName]的创始人 [url=IFAcceptPageUrl(处理邀请)]',
    },
    {
      parameters: ['NFRSName', 'NFRSUrl', 'NFRSExpired'],
      type: 'newForumReviewResolve',
      content:
        '你申请创建的新专业[url=NFRSUrl(NFRSName)]已经通过了审核，进入筹备阶段。截止[text=NFRSExpired]，若专业内文章大于50篇，则本专业将自动转为正式专业，否则专业将会被删除（不会删除专业内的文章）。',
    },
    {
      parameters: ['NFRJName'],
      type: 'newForumReviewReject',
      content: '你申请创建的新专业[text=NFRJName]未能通过审核',
    },
    {
      parameters: ['BFFName', 'BFFMessage'],
      type: 'becomeFormalForum',
      content: '你的筹备专业[text=BFFName][text=BFFMessage]',
    },
    {
      parameters: [],
      type: 'securityApplicationResolved',
      content: '手机号申诉已通过审核。',
    },
    {
      parameters: ['reason'],
      type: 'securityApplicationRejected',
      content: '手机号申诉未通过审核，理由：[text=reason]',
    },
    {
      parameters: ['reason', 'threadTitle', 'threadUrl'],
      type: 'violation',
      content:
        '你的文章[url=threadUrl(threadTitle)]由于[text=reason]的原因违规。',
    },
    {
      parameters: ['applicationFormURL', 'applicationFormCode'],
      type: 'fundFinishProject',
      content:
        '【科创基金】你的申报项目[text=applicationFormCode]研究已超时，请及时处理。[url=applicationFormURL(立即查看)]',
    },
    {
      parameters: [
        'reason',
        'threadTitle',
        'threadURL',
        'forumsName',
        'threadCategoriesName',
      ],
      content:
        '您的标题为[url=threadURL(threadTitle)]的文章由于[text=reason]等原因，已被移动到[text=forumsName]。',
      type: 'moveThread',
    },
    {
      parameters: ['reviewLink', 'name', 'username', 'userURL'],
      content:
        '用户[url=userURL(username)]邀请您一起创作图书[text=name], 点击[url=reviewLink(这里)]前往查看邀请。',
      type: 'bookInvitation',
    },
    {
      parameters: ['userHomeUrl', 'username', 'momentUrl'],
      content:
        '用户[url=userHomeUrl(username)]转发了你的电文，[url=momentUrl(点击查看)]。',
      type: 'momentRepost',
    },
    {
      parameters: ['userHomeUrl', 'username', 'momentUrl', 'content'],
      content:
        '收到来自[url=userHomeUrl(username)]的电文回复，[url=momentUrl(点击查看)]。\n以下是回复内容：[text=content]',
      type: 'momentComment',
    },
    {
      parameters: ['userUrl', 'username', 'momentUrl'],
      content:
        '用户[url=userUrl(username)]在电文中@了你，[url=momentUrl(查看)]。',
      type: 'momentAt',
    },
    {
      parameters: ['reason', 'content'],
      content:
        '您发布的笔记[text=content]由于[text=reason]等原因已被屏蔽，内容仅自己可见，该操作不可恢复。请您发布内容时确保符合规章，消除存在的问题，否则下次将您的内容标记为违规。',
      type: 'noteDisabled',
    },
    {
      parameters: ['reason'],
      content:
        '您提交的基本资料由于[text=reason]等原因未通过审核。请您提交内容时确保符合规章，消除存在的问题，否则下次将您的提交内容标记为违规。',
      type: 'userAuditRejected',
    },
    {
      parameters: ['link'],
      content: '您提交的基本资料已通过审核。[url=link(立即查看)]',
      type: 'userAuditApproved',
    },
    {
      parameters: ['momentUrl', 'reason', 'content'],
      content:
        '您发布的电文[text=content]由于[text=reason]等原因，已被屏蔽，[url=momentUrl(点击查看)]。该操作不可恢复，也不接受申诉。请您在下次发表时，认真对照国家法律法规、社区规章，确保标题和内容清晰详细，品质优良。',
      type: 'momentWasReturned',
    },
    {
      parameters: ['momentUrl', 'reason', 'content'],
      content:
        '您发布的电文评论[text=content]由于[text=reason]等原因，已被屏蔽，[url=momentUrl(点击查看)]。该操作不可恢复，也不接受申诉。请您在下次发表时，认真对照国家法律法规、社区规章，确保标题和内容清晰详细，品质优良。',
      type: 'momentCommentWasReturned',
    },
  ],
};
