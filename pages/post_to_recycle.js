// 选择退回回收站方式
// toRecycle 删除
// toDraft 退回

function clickMethod1(para){
  $(para).addClass("active1")
  $("#toRecycle").removeClass("active1")
  document.getElementById("passMessage").style.display = "none"
  $("#postNoticeType").prop("checked","checked")
  $("#ssubmit").removeAttr("disabled")
}


function clickMethod2(para){
  $(para).addClass("active1")
  $("#toDraft").removeClass("active1")
  document.getElementById("passMessage").style.display = "block"
  $("#postNoticeType").prop("checked","checked")
  $("#ssubmit").removeAttr("disabled")
}

function postRecycleMethodsChoice(){
  if($(".choose-content-div1.active1").html() === "退回修改"){
    return "toDraft";
  }
  if($(".choose-content-div1.active1").html() === "删除"){
    return "toRecycle"
  }
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
    setTimeout(function(){turnTest(id)},1800)
    // window.location.href = "/t/" + id;
  }else if(method === "toDraft"){
    disablePost(pid,parames)
    setTimeout(function(){turnTest(id)},1800)
    // window.location.href = "/t/" + id;
  }
}

function turnTest(id){
  window.location.href = "/t/" + id;
}

// // 将帖子退回
// function moveThreadToRedit(id,para){
//   return nkcAPI('/t/'+id+'/moveDraft','PATCH',{
//     tid: id,
//     para: para
//   })
//     .then(function(){
//       screenTopAlert("已将帖子退回")
//     })
//     .catch(function(data){
//       screenTopAlert("无法退回")
//     })
// }