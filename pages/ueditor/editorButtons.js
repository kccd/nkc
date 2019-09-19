UE.registerUI('imageSelector',function(editor,uiName){
  if(NKC.modules.SelectResource && !window.SelectResource) {
    window.SelectResource = new NKC.modules.SelectResource();
  }
  return new UE.ui.Button({
    name:'imageSelector',
    title:'插入图片',
    // 需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
    // cssRules :'.edui-default  .edui-for-mathformula .edui-icon',
    className: 'edui-default edui-for-image-selector edui-icon',
    onclick:function () {
      if(window.SelectResource) {
        window.SelectResource.open(function(data) {
          if(data.resources) {
            data = data.resources;
          } else {
            data = [data];
          }
          for(var i = 0; i < data.length; i++) {
            var dom = NKC.methods.resourceToHtml(data[i]);
            editor.execCommand('inserthtml', dom);
          }
        }, {
          allowedExt: ["picture"],
          fastSelect: false
        });
      } else {
        return sweetError("未初始化资源选择模块");
      }
    }
  })
});

UE.registerUI('resourceSelector',function(editor,uiName){
  // return sweetError("未引入资源选择模块");
  if(NKC.modules.SelectResource && !window.SelectResource) {
    window.SelectResource = new NKC.modules.SelectResource();
  }
  return new UE.ui.Button({
    name:'resourceSelector',
    title:'插入附件',
    // 需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
    // cssRules :'.edui-default  .edui-for-mathformula .edui-icon',
    className: 'edui-default edui-for-resource-selector edui-icon',
    onclick:function () {
      if(window.SelectResource) {
        window.SelectResource.open(function(data) {
          if(data.resources) {
            data = data.resources;
          } else {
            data = [data];
          }
          for(var i = 0; i < data.length; i++) {
            var dom = NKC.methods.resourceToHtml(data[i]);
            editor.execCommand('inserthtml', dom);
          }
        }, {
          fastSelect: false
        });
      } else {
        return sweetError("未初始化资源选择模块");
      }
    }
  })
});

UE.registerUI('mathFormula',function(editor,uiName){
  // 获取屏幕分辨率 根据分辨率调节公式输入框的宽度
  var wiw = window.innerWidth;
  var dialogCSS = "width:600px;height:350px;";
  if(wiw <= 743 && wiw > 640) {
    dialogCSS = "width:500px;height:350px;";
  }else if(wiw <= 640 && wiw > 480) {
    dialogCSS = "width:400px;height:350px;";
  }else if(wiw <= 480 && wiw > 360) {
    dialogCSS = "width:300px;height:350px;";
  }else if(wiw <= 360) {
    dialogCSS = "width:300px;height:350px;";
  }
  //创建mathFormulaDialog
  var mathFormulaDialog = new UE.ui.Dialog({
    //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
    iframeUrl:editor.options.UEDITOR_HOME_URL + 'dialogs/mathFormula/mathFormula.html',
    //需要指定当前的编辑器实例
    editor:editor,
    //指定dialog的名字
    name:uiName,
    //dialog的标题
    title:"插入公式",

    //指定dialog的外围样式
    cssRules: dialogCSS,

    //如果给出了buttons就代表dialog有确定和取消
    buttons:[
      {
        className:'edui-okbutton',
        label:'确定',
        onclick:function () {
          mathFormulaDialog.close(true);
        }
      },
      {
        className:'edui-cancelbutton',
        label:'取消',
        onclick:function () {
          mathFormulaDialog.close(false);
        }
      }
    ]
  });
  // 当点击编辑内容时，按钮要做的反射状态

  //参考addCustomizeButton.js
  return new UE.ui.Button({
    name:'dialogbutton',
    title:'插入公式',
    // 需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
    // cssRules :'.edui-default  .edui-for-mathformula .edui-icon',
    className: 'edui-default edui-for-mathformula edui-icon',
    onclick:function () {
      //渲染dialog
      mathFormulaDialog.render();
      mathFormulaDialog.open();
    }
  });
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);

// 判断是否为pc
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}