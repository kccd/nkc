var MoveThread;

$(function() {
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
  dom.html(leftDom.html());

  MoveThread = new NKC.modules.MoveThread();
});


function showSameForums() {
  $(".sameForums").slideToggle();

}

function getSelectedThreadsId() {
  var dom = $(".thread-checkbox input");
  var threadsId = [];
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) {
      threadsId.push(d.attr("data-thread-tid"));
    }
  }
  return threadsId;
}

function disabledSelectedThreads() {

}

function moveSelectedThreads() {
  var threadsId = getSelectedThreadsId();
  if(threadsId.length === 0) return screenTopWarning("请至少勾选一篇文章");
  MoveThread.open(function(data) {
    var forums = data.forums;
    var moveType = data.moveType;
    MoveThread.lock();
    nkcAPI("/threads/move", "POST", {
      forums: forums,
      moveType: moveType,
      threadsId: threadsId
    })
      .then(function() {
        screenTopAlert("操作成功");
        MoveThread.close();
      })
      .catch(function(data) {
        screenTopWarning(data);
        MoveThread.unlock();
      })

  })
}

function managementThreads() {
  $(".thread-checkbox label").toggle();
}

function selectAll() {
  var dom = $(".thread-checkbox input");
  var total = dom.length;
  var selected = 0;
  for(var i = 0; i < total; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) selected ++;
  }
  if(total === selected) {
    dom.prop("checked", false);
  } else {
    dom.prop("checked", true);
  }
}