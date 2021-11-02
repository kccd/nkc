const redis = require('./redis');
const redisClient = redis();
redisClient.on('error', err => {
  console.error(err);
});
module.exports = redisClient;
/**/

/*
* 键名 uid(用户ID)
* user:uid:subscribeForumsId array
* user:uid:subscribeUsersId array
* user:uid:subscribeThreadsId array
* user:uid:subscribeColumnsId array
* user:uid:collectionThreadsId array
*
* forums:topicsId array 话题ID
* forums:disciplinesId array 学科ID
*
* 关注分类
* 全部
* user:uid:subscribeTypesId array 所有自定义分类ID+all+other
* user:uid:subscribeType:all:column array 专栏ID
* user:uid:subscribeType:all:thread array 文章ID
* user:uid:subscribeType:all:user array 用户ID
* user:uid:subscribeType:all:topic array 话题ID
* user:uid:subscribeType:all:discipline array 学科ID
* 未分类
* user:uid:subscribeType:other:column
* user:uid:subscribeType:other:thread
* user:uid:subscribeType:other:user
* user:uid:subscribeType:other:topic
* user:uid:subscribeType:other:discipline
* 自定义分类 subscribeTypeId(自定义分类ID)
* user:uid:subscribeType:subscribeTypeId:column
* user:uid:subscribeType:subscribeTypeId:thread
* user:uid:subscribeType:subscribeTypeId:user
* user:uid:subscribeType:subscribeTypeId:topic
* user:uid:subscribeType:subscribeTypeId:discipline
*

*
*
* 设置 settingsId(设置ID)
* settings:settingsId json string
*
* 一周活跃用户
* activeUsers array [{uid: 用户ID, avatar: 头像}, {}, ...]
*
* 轮播图
* visitor:ads [{tid: 文章ID, title: 文章标题}, {}, ...]
*
* 针对游客的全局页面缓存 url: 网页链接
* page:url:toc 缓存创建的时间
* page:url:data html字符串
*
* 数据类型
* 1. string字符创  setAsync, getAsync
* 2. Set集合 saddAsync, smembersAsync
*
*
* 删除键： delAsync
*
* 用户证书
* role:${roleId} = jsonString roleObj
* role:keys = jsonString [roleId, ...]
*
* 专业分类
* forumCategories = jsonString [CategoryObj, ...]
*
* forum:${fid}:latestThreads jsonString [threadObj, ...]
*
* 专业信息
* forum:${fid} = jsonString forumObj
*
* 所有专业的ID
* forums:id = jsonString [fid, fid, ...];
*
* 权限 操作
* operation:${operationId} = jsonString operationObj
*
* 积分策略
* scoreOperation:default:${scoreOperationType} = jsonString scoreOperationObj
*
* 用户 我的主页 被阅读量、被点赞量、被回复/评论量统计
* user:${uid}:numberOfOtherUserOperation = jsonString {read: Number, voteUp: Number, post: Number}
* user:${uid}:timeToSetOtherUserOperationNumber 缓存被阅读、被回复等数量的时间
*
* 资源 视频预览token
* resource:${rid}:${token} = count（验证此token的次数）
*/
