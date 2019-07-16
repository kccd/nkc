function setHidden(columnId, pageId, hidden) {
  nkcAPI("/m/" + columnId + "/page/" + pageId, "PATCH", {
    hidden: !!hidden,
    type: "hide"
  })
    .then(function() {
      sweetSuccess("设置成功");
    })
    .catch(function(data) {
      sweetError(data);
    })
}

function deletePage(columnId, pageId) {
  sweetConfirm("确定要执行此操作？")
    .then(function() {
      return nkcAPI("/m/" + columnId + "/page/" + pageId, "DELETE")
    })
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })

}

function toNav(columnId, pageId) {
  nkcAPI("/m/" + columnId + "/page/" + pageId, "PATCH", {
    type: "toNav"
  })
    .then(function() {
      sweetSuccess("加入成功");
    })
    .catch(function(data) {
      sweetError(data);
    })
}