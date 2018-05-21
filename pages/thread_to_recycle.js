// 选择退回回收站方式
// toRecycle 删除
// toDraft 退回
function recycleMethodsChoice(){
  return $("#recycleMethod").val()
}


// 送回回收站
function moveToRecycleBin(id){
  var reason = $("#recycleReason").val().trim();
  var method = recycleMethodsChoice();
  var noticeType = $("#noticeType").is(":checked")
  // 构造数据，发送到服务器
  var parames = {
    reason: reason,
    delType: method,
    postType: "thread",
    threadId: id,
    postId: '',
    noticeType: noticeType
  }
  if(reason.length === 0){
    return screenTopWarning('未填写原因')
  }
  if(method === "toRecycle"){
    moveThreadToRecycle(id,parames)
    window.location.href = "/t/" + id;
  }else if(method === "toDraft"){
    moveThreadToRedit(id,parames)
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