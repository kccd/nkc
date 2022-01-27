import {getState} from './state';
const {isApp} = getState();
let topOffset = 50;
if(isApp) {
  topOffset = 0;
}
//发表文章编辑器
export function getEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
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
};


//基金配置
export function getFundDescriptionEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};

//商品配置
export function getShopDescriptionEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
//协议配置
export function getExperimentalProtocolEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
//活动配置
export function getActiveDescriptionEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
//专栏类型编辑器
export function getColumnCategoryEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 200, // 编辑器高度
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
//文章回复编辑器
export  function getPostEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 200, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};
//文章页评论编辑器
export function getCommentEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        //'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', "|"
      ]
    ],
    maximumWords: 200, // 最大字符数
    initialFrameHeight: 100, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};

//图书页评论编辑器
export function getBookCommentEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        //'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', "|"
      ]
    ],
    maximumWords: 200, // 最大字符数
    initialFrameHeight: 100, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};

//专栏自定义页编辑器
export function getColumnPageConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};

//专业基本信息配置
export function getForumEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 200, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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
};

//文档中心编辑器
export function getDocumentEditorConfigs() {
  return {
    toolbars: [
      [
        //'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode'
        'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'indent', '|', 'link', 'unlink', '|', 'inserttable', '|', 'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'insertcode', "|"
      ]
    ],
    maximumWords: 100000, // 最大字符数
    initialFrameHeight: 500, // 编辑器高度
    autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    autoFloatEnabled: true,
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

