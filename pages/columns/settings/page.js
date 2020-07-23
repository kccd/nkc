function setHidden(columnId, pageId, hidden) {
  nkcAPI("/m/" + columnId + "/page/" + pageId, "PUT", {
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
  sweetConfirm("确定要删除该页面？")
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
  nkcAPI("/m/" + columnId + "/page/" + pageId, "PUT", {
    type: "toNav"
  })
    .then(function() {
      sweetSuccess("加入成功");
    })
    .catch(function(data) {
      sweetError(data);
    })
}

$(function() {
  var button = $(".copy-button");
  var obj = {};
  var func = function (i) {
    var b = button.eq(i);
    var pageId = b.attr("data-page-id");
    var url = b.attr("data-page-url");
    obj[pageId] = new ClipboardJS(".copy-button-" + pageId, {
      text: function() {
        return url
      }
    });
    obj[pageId].on("success", function() {
      screenTopAlert("链接已复制到粘贴板");
    });
  };
  for(var i = 0; i < button.length; i++) {
    func(i);
  }
});
