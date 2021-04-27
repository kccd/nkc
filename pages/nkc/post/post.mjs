window.moveThread = function(pid) {
  if(!window.MoveThread) {
    window.MoveThread = new NKC.modules.MoveThread();
  }
  const postData = NKC.methods.getDataById(`data_${pid}`);
  window.MoveThread.open(function(data) {
    var forums = data.forums;
    var moveType = data.moveType;
    MoveThread.lock();
    nkcAPI("/threads/move", "POST", {
      forums: forums,
      moveType: moveType,
      threadsId: [postData.tid]
    })
      .then(function() {
        screenTopAlert("操作成功");
        MoveThread.close();
      })
      .catch(function(data) {
        sweetError(data);
        MoveThread.unlock();
      })
  }, {
    selectedCategoriesId: postData.categoriesId,
    selectedForumsId: postData.mainForumsId
  })
}


window.deleteThread = function(pid) {
  if(!window.DisabledPost) {
    window.DisabledPost = new NKC.modules.DisabledPost();
  }
  window.DisabledPost.open(function(data) {
    var type = data.type;
    var reason = data.reason;
    var remindUser = data.remindUser;
    var violation = data.violation;
    var url, method = "POST";
    var body = {
      postsId: [pid],
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
        sweetError(data);
        DisabledPost.unlock();
      })
  });

}