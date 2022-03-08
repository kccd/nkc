$(() => {

});



/*
* 获取指定的动态最外层容器
* @param {String} momentId 动态ID
* */
function getSingleCommentContainerElementByMomentId(momentId) {
  const elements = $(`.single-moment-container[data-moment-id="${momentId}"]`);
  if(elements.length === 0) {
    throw new Error(`未找到指定动态容器`);
  } else if(elements.length !== 1) {
    throw new Error(`存在多个相同的动态容器`);
  }
  return elements.eq(0);
}

/*
* 打开指定动态的评论列表
* */
function openCommentContainerByMomentId(momentId) {
  const commentContainerElement = getSingleCommentContainerElementByMomentId(momentId);
  console.log(commentContainerElement);
}