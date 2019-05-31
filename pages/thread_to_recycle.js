// 选择退回回收站方式
// toRecycle 删除
// toDraft 退回
function clickMethod3(para){
  $(para).addClass("active2")
  $("#toRecycle2").removeClass("active2")
  document.getElementById("passMessage2").style.display = "none"
  $("#noticeType2").prop("checked","checked")
  $("#ssubmit2").removeAttr("disabled")
}


function clickMethod4(para){
  $(para).addClass("active2")
  $("#toDraft2").removeClass("active2")
  document.getElementById("passMessage2").style.display = "block"
  $("#noticeType2").prop("checked","checked")
  $("#ssubmit2").removeAttr("disabled")
}

function recycleMethodsChoice(){
  if($(".choose-content-div2.active2").html() === "退回修改"){
    return "toDraft";
  }
  if($(".choose-content-div2.active2").html() === "删除"){
    return "toRecycle"
  }
}


// 送回回收站
function moveToRecycleBin(id){
  var reason = $("#recycleReason").val().trim();
  var method = recycleMethodsChoice();
  var noticeType = $("#noticeType2").is(":checked")
  var illegalType = $("#threadIsIllegalOperation").is(":checked")
  // 构造数据，发送到服务器
  var parames = {
    reason: reason,
    delType: method,
    postType: "thread",
    threadId: id,
    postId: '',
    noticeType: noticeType,
    illegalType: illegalType
  };
  if(reason.length === 0){
    return screenTopWarning('未填写原因')
  }
  if(method === "toRecycle"){
    moveThreadToRecycle(id,parames)
    setTimeout(function(){turnTest1(id)},1800)
    // window.location.href = "/t/" + id;
  }else if(method === "toDraft"){
    moveThreadToRedit(id,parames)
    setTimeout(function(){turnTest1(id)},1800)
  }
}

function turnTest1(id){
  window.location.href = "/t/" + id;
}

// 将帖子退回
function moveThreadToRedit(id,para){
  return nkcAPI('/t/'+id+'/moveDraft','PATCH',{
    tid: id,
    para: para
  })
    .then(function(){
      screenTopAlert("已将文章退回，请等待刷新")
    })
    .catch(function(data){
      screenTopAlert(data.error)
    })
}