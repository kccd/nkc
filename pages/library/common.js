function removeResourceFromLibrary(rid) {
  sweetQuestion("确定要从所有文库中删除该文件？")
    .then(function() {
      nkcAPI("/library", "POST", {
        operation: "removeResourceFromLibrary",
        rid: rid
      })
        .then(function() {
          sweetSuccess("删除成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }).catch(function(){})
}

window.removeResourceFromLibrary = removeResourceFromLibrary;