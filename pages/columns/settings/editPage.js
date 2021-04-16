var data;
var pageEditor;
$(function() {
  data = NKC.methods.getDataById("data");

  pageEditor = UE.getEditor("pageContent", NKC.configs.ueditor.columnPageConfigs);

  if(data.page) {
    $("#title").val(data.page.t);
    pageEditor.ready(function() {
      pageEditor.setContent(data.page.c);
    });
  }
});

function save() {
  var title = $("#title").val();
  var content = pageEditor.getContent();
  if(!content) return sweetError("请输入页面内容");
  var method, url;
  var body = {
    title: title,
    content: content
  };
  if(data.page) {
    method = "PUT";
    url = "/m/" + data.column._id + "/page/" + data.page._id;
    body.type = "modifyContent";
  } else {
    method = "POST";
    url = "/m/" + data.column._id + "/page";
  }
  nkcAPI(url, method, body)
    .then(function(data) {
      openToNewLocation("/m/" + data.column._id + "/settings/page");
    })
    .catch(function(data) {
      sweetError(data);
    });


}
