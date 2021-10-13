var MoveThread, DisabledPost;
$(function() {
  window.MoveThread = new NKC.modules.MoveThread();
  window.DisabledPost = new NKC.modules.DisabledPost();
  MoveThread = window.MoveThread;
  DisabledPost = window.DisabledPost;
});

function getSelectedThreadsId() {
  var dom = $(".thread-checkbox input");
  var threadsId = [];
  var threads = [];
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) {
      threadsId.push(d.attr("data-thread-id"));
      var r = {
        tid: d.attr("data-thread-id")
      };
      var cids = d.attr("data-thread-cids") || '';
      var fids = d.attr("data-thread-fids") || '';
      if(cids) {
        r.cids = cids.split('-');
        r.fids = fids.split('-');
      }
      threads.push(r);
    }
  }
  return {
    threadsId: threadsId,
    threads: threads
  };
}


function getSelectedPostsId() {
  var dom = $(".thread-checkbox input");
  var postsId = [];
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) {
      postsId.push(d.attr("data-post-id"));
    }
  }
  return postsId;
}

// 屏蔽POST(包含thread的oc)
function disabledSelectedPosts() {
  var postsId = getSelectedPostsId();
  if(postsId.length === 0) return screenTopWarning("请至少勾选一篇文章");
  DisabledPost.open(function(data) {
    var type = data.type;
    var reason = data.reason;
    var remindUser = data.remindUser;
    var violation = data.violation;
    var url, method = "POST";
    var body = {
      postsId: postsId,
      reason: reason,
      remindUser: remindUser,
      violation: violation
    };
    if(type === "toDraft") {
      url = "/threads/draft";
    } else {
      url = "/threads/recycle";
    }
    DisabledPost.lock();
    nkcAPI(url, method, body)
      .then(function() {
        screenTopAlert("操作成功");
        DisabledPost.close();
        DisabledPost.unlock();
      })
      .catch(function(data) {
        screenTopWarning(data);
        DisabledPost.unlock();
      })
  });
}

// 移动文章 弹出弹窗选择专业 然后提交到服务器
function moveSelectedThreads() {
  var obj = getSelectedThreadsId();
  var threadsId = obj.threadsId;
  var options = {};
  if(threadsId.length === 0) return screenTopWarning("请至少勾选一篇文章");
  if(threadsId.length === 1) {
    var thread = obj.threads[0];
    options.selectedCategoriesId = thread.cids;
    options.selectedForumsId = thread.fids;
  }
  MoveThread.open(function(data) {
    var forums = data.forums;
    var moveType = data.moveType;
    var {
      violation,
      reason,
      remindUser,
      threadCategoriesId,
    } = data;
    MoveThread.lock();
    nkcAPI("/threads/move", "POST", {
      forums: forums,
      moveType: moveType,
      threadsId: threadsId,
      threadCategoriesId,
      violation,
      remindUser,
      reason
    })
      .then(function() {
        screenTopAlert("操作成功");
        MoveThread.close();
      })
      .catch(function(data) {
        screenTopWarning(data);
        MoveThread.unlock();
      })

  }, options);
}

// 显示或隐藏勾选框
function managementThreads() {
  var labelDom = $(".thread-checkbox label");
  labelDom.toggle();
  if(labelDom.css("display") === "none") {
    $(".thread-checkbox input").prop("checked", false);
    $(".management-thread-panel").css("display", "none");
  } else {
    $(".management-thread-panel").css("display", "inline");
  }
}

// 选择全部勾选框或取消全部勾选框
function selectAll() {
  if($(".thread-checkbox label").css("display") === "none") return;
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

Object.assign(window, {
  getSelectedThreadsId,
  getSelectedPostsId,
  disabledSelectedPosts,
  moveSelectedThreads,
  managementThreads,
  selectAll,
});
