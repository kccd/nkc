// 封禁专栏
function disabledColumn(columnId, type, index) {
  if(!confirm("确定要执行该操作？")) return;
  nkcAPI("/m/" + columnId + "/disabled", "POST", {
    type: type,
    index: index
  })
    .then(function() {
      screenTopAlert("操作成功");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
