window.deleteArticle = function (_id) {
  if(!window.DisabledPost) {
    window.DisabledPost = new NKC.modules.DisabledPost();
  }
  window.DisabledPost.open(function(data) {
    var body = {
      delType: data.type === 'toDraft'?'faulty':'disabled',
      docId: _id,
      type: 'document',
      reason: data.reason,
      remindUser: data.remindUser,
      violation: data.violation
    };
    DisabledPost.lock();
    nkcAPI('/review', 'PUT', body)
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

window.deleteMoment = function (momentId) {
  if(!momentId) return;
  sweetQuestion("你确定要删除吗？")
    .then(() => nkcAPI(`/moment/${momentId}`, "DELETE"))
    .then(() => {
      sweetSuccess('操作成功');
    })
    .catch(err => {
      sweetError(err);
    })
}

window.recoveryMoment = function(momentId) {
  if(!momentId) return;
  return nkcAPI(`/moment/${momentId}/recovery`, 'POST')
    .then(() => {
      sweetSuccess('操作成功');
    })
    .catch(sweetError);
}
