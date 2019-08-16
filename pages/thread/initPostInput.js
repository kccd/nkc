// 根据不同页面传递不同参数
var pathName = window.location.pathname;
var initialFrameHeight = 200;
var topOffset = 0;
if(pathName.indexOf("editor") > -1) {
  initialFrameHeight = 500
  topOffset = 50;
}
// 获取header高度
var ue = UE.getEditor('container', {
  toolbars: [
    [
      'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor',  '|', 'indent', '|','link', 'unlink', '|', 'emotion', 'inserttable', '|' ,'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright','|', 'insertcode'
    ]
  ],
  maximumWords: 100000, // 最大字符数
  initialFrameHeight: 200, // 编辑器高度
  autoHeightEnabled:false, // 编辑器是否随着行数增加而自动长高
  scaleEnabled: true, // 是否允许拉长
  topOffset: 47, // toolbar工具栏在滚动时的固定位置
  //- imagePopup: false, // 是否开启图片调整浮层
  //- enableContextMenu: false, // 是否开启右键菜单
  enableAutoSave: false, // 是否启动自动保存
  elementPathEnabled: false, // 是否显示元素路径
  imageScaleEnabled: false, // 启用图片拉伸缩放
  zIndex : 499
});