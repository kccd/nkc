import {getState} from './state';
const {isApp} = getState();
let topOffset = 50;
if(isApp) {
  topOffset = 0;
}
export function getForumDescriptionEditorConfigs() {
  return {
    toolbars: [
      [
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 800, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: false,
    topOffset: topOffset, // toolbar工具栏在滚动时的固定位置
    //- imagePopup: false, // 是否开启图片调整浮层
    //- enableContextMenu: false, // 是否开启右键菜单
    enableAutoSave: false, // 是否启动自动保存
    elementPathEnabled: false, // 是否显示元素路径
    imageScaleEnabled: false, // 启用图片拉伸缩放
    enableContextMenu: false,
    contextMenu: [],
    imgTotal: 0,
    imgCount: 0,
    zIndex: 499
  }
}


