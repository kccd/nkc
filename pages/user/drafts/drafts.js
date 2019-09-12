function removeDraft(did) {
  sweetQuestion("确定要删除当前草稿？")
    .then(function() {
      nkcAPI('/u/' + NKC.configs.uid + "/drafts/" + did, "DELETE")
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data);
        })
    })
    .catch(function() {})
}

function removeAll() {
  sweetQuestion("确定要删除全部草稿？删除后不可恢复。")
    .then(function() {
      nkcAPI("/u/" + NKC.configs.uid + "/drafts/all", "DELETE")
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data);
        })
    })
    .catch(function(){})
}