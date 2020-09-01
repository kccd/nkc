module.exports = {
  _id: 'page',
  c: {
    userCardThreadList: 30,
    userCardUserList: 50,
    homeThreadList: 30,
    forumThreadList: 30,
    forumUserList: 50,
    threadPostList: 30,
    searchThreadList: 30,
    searchPostList: 30,
    searchAllList: 30,
    searchUserList: 30,
    threadPostCommentList: 10,

    threadListStyle: {
      type: 'abstract', // 显示类型 abstract: 摘要模式, brief: 简略模式, minimalist: 极简模式
      cover: 'left', // 封面图位置 left: 左侧, right: 右侧, null: 不显示封面图
    }
  }
};
