(function() {
  // ue编辑器配置
  var topOffset = 50;
  if(NKC.configs.isApp) {
    topOffset = 0;
  }
  NKC.configs.ueditor = {
    // 编辑器页面
    editorConfigs: {
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
    },

    // 文章页回复框
    postConfigs: {
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
    },

    // 文章页评论的编辑器
    commentConfigs: {
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
    },

    // 专栏自定义页编辑器
    columnPageConfigs: {
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
    },

    // 基金项目编辑器
    fundConfigs: {
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
    },

    // 商品编辑器
    shopConfigs: {
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
    },
    // 协议
    experimentalProtocol: {
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
    },
    // 活动
    activityConfigs: {
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

})();
