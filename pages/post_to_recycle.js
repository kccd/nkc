// 选择退回回收站方式
// toRecycle 删除
// toDraft 退回
function postRecycleMethodsChoice(){
  return $("#postRecycleMethod").val()
}


// 送回回收站
function postMoveToRecycleBin(id){
  var reason = $("#postRecycleReason").val().trim();
  var method = postRecycleMethodsChoice();
  var noticeType = $("#postNoticeType").is(":checked")
  var pid = window.localStorage.pid
  // 构造数据，发送到服务器
  var parames = {
    reason: reason,
    delType: method,
    postType: "post",
    threadId: id,
    postId: pid,
    noticeType: noticeType
  }
  if(reason.length === 0){
    return screenTopWarning('未填写原因')
  }
  if(method === "toRecycle"){
    disablePost(pid,parames)
    window.location.href = "/t/" + id;
  }else if(method === "toDraft"){
    disablePost(pid,parames)
    window.location.href = "/t/" + id;
  }
}

// 将帖子退回
function moveThreadToRedit(id,para){
  return nkcAPI('/t/'+id+'/moveDraft','PATCH',{
    tid: id,
    para: para
  })
    .then(function(){
      screenTopAlert("已将帖子退回")
    })
    .catch(function(data){
      screenTopAlert("无法退回")
    })
}