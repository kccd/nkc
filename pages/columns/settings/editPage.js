var data;
var ue;
$(function() {
  data = getDataById("data");

  ue = UE.getEditor("pageContent", {
    toolbars: [
      [
        'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor',  '|', 'indent', '|','link', 'unlink', '|', 'emotion', 'inserttable', '|' ,'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|'
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 400, // 编辑器高度
    autoHeightEnabled:false, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    topOffset: 48, // toolbar工具栏在滚动时的固定位置
    //- imagePopup: false, // 是否开启图片调整浮层
    //- enableContextMenu: false, // 是否开启右键菜单
    enableAutoSave: false, // 是否启动自动保存
    elementPathEnabled: false, // 是否显示元素路径
    imageScaleEnabled: false, // 启用图片拉伸缩放
  });

  if(data.page) {
    $("#title").val(data.page.t);
    ue.ready(function() {
      ue.setContent(data.page.c);
    });
  }
});

function save() {
  var title = $("#title").val();
  var content = ue.getContent();
  if(!content) return sweetError("请输入页面内容");
  var method, url;
  var body = {
    title: title,
    content: content
  };
  if(data.page) {
    method = "PATCH";
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