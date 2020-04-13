;(function(){
  UE.registerUI('draftSelector',function(editor,uiName){
    if(NKC.modules.SelectDraft && !window.SelectDraft) {
      window.SelectDraft = new NKC.modules.SelectDraft();
    }
    return new UE.ui.Button({
      name:'draftSelector',
      title:'草稿箱',
      // 需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
      // cssRules :'.edui-default  .edui-for-mathformula .edui-icon',
      className: 'edui-default edui-for-draft edui-icon',
      onclick:function () {
        if(window.SelectDraft) {
          window.SelectDraft.open(function(res) {
            editor.execCommand('inserthtml', res.content || "");
            // editor.methods.selectedDraft(res);
          });
        } else {
          return sweetError("未初始化草稿选择模块");
        }
      }
    });
  });
  
  // 插入表情
  UE.registerUI('stickerSelector',function(editor,uiName){
    if(NKC.modules.SelectSticker && !window.SelectSticker) {
      window.SelectSticker = new NKC.modules.SelectSticker();
    }
    return new UE.ui.Button({
      name:'stickerSelector',
      title:'插入表情',
      // 需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
      // cssRules :'.edui-default  .edui-for-mathformula .edui-icon',
      className: 'edui-default edui-for-emotion edui-icon',
      onclick:function () {
        if(window.SelectSticker) {
          window.SelectSticker.open(function(res) {
            if(res.type === "emoji") {
              editor.execCommand('inserthtml', NKC.methods.resourceToHtml("twemoji", res.data));
            }else if(res.type === "sticker") {
              editor.execCommand('inserthtml', NKC.methods.resourceToHtml("sticker", res.data.rid));
            }
          });
        } else {
          return sweetError("未初始化表情选择模块");
        }
      }
    })
  });
  
  // 插入图片
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
              var source = data[i];
              var type = source.mediaType;
              type = type.substring(5);
              type = type[0].toLowerCase() + type.substring(1);
              // if(type === "video") {
              //   editor.execCommand("insertvideo", {
              //     //视频地址
              //     url: "/r/"+ source.rid,
              //     //视频宽高值， 单位px
              //     width: 200,
              //     height: 100
              //   });
              //   continue;
              // }
              editor.execCommand('inserthtml', NKC.methods.resourceToHtml(type, source.rid, source.oname));
            }
          }, {
            fastSelect: true
          });
        } else {
          return sweetError("未初始化资源选择模块");
        }
      }
    })
  });
  
  
  // 插入附件
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
            console.log(data);
            
            if(data.resources) {
              data = data.resources;
            } else {
              data = [data];
            }
            for(var i = 0; i < data.length; i++) {
              var source = data[i];
              var type = source.mediaType;
              type = type.substring(5);
              type = type[0].toLowerCase() + type.substring(1);
              editor.execCommand('inserthtml', NKC.methods.resourceToHtml(type, source.rid, source.oname));
            }
          }, {
            fastSelect: true,
            resourceType: "attachment"
          });
        } else {
          return sweetError("未初始化资源选择模块");
        }
      }
    })
  });
  
  // 插入公式
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
  
  
  
  
  // 注册一个隐藏区域功能
  UE.registerUI('hideContent',function(editor,uiName){
    if(NKC.modules.insertHideContent && !window.insertHideContent) {
      window.insertHideContent = new NKC.modules.insertHideContent();
    }
  
    editor.ready(function() {
      var editDoc = editor.document;
      var handle = function(e) {
        var target = e.target;
        if(target.dataset.tag !== "nkcsource") return;
        var type = target.dataset.type;
        var score = target.dataset.id;
        if(type !== "xsf") return;
        window.insertHideContent.open(function(newscore) {
         target.dataset.id = newscore;
         target.dataset.message = "浏览这段内容需要"+newscore+"学术分(双击修改)";
       }, parseFloat(score));
      };
      var count = 0;
      editDoc.addEventListener("dblclick", handle);
      editDoc.addEventListener("touchend", function(e) {   // 手机端模拟双击
        ++count;
        if(count == 2) return handle(e);
        setTimeout(function(){ count = 0; }, 700);
      });
    });

    return new UE.ui.Button({
      name:'hideContent',
      title:'学术分隐藏',
      className: 'edui-default edui-for-hide-content edui-icon',
      onclick:function () {
        if(window.insertHideContent) {
          window.insertHideContent.open(function(score) {
            editor.execCommand("inserthtml", NKC.methods.resourceToHtml("xsf", score))
          });
        } else {
          return sweetError("未初始化资源选择模块");
        }
      }
    })
  });



  // 给所有编辑器添加自动加行功能
  console.log(JSON.stringify(Object.values(UE.instants)));
  
  Object.values(UE.instants).forEach(editor => {
    editor.addListener("ready", function() {
      // 点击末行空白处插入新行
      autoAddNewline(editor);
    })
  })


  /**
   * 点击末行空白处插入新行
   * @param {Object} readyEditor - 一个已经就绪的编辑器实例 
   */
  function autoAddNewline(readyEditor) {
    var doc = readyEditor.document;
    var body = readyEditor.body;
    if(!body) return;
    var handle = function(event) {
      var lastChild = body.lastChild;
      var lastChildContent = $(lastChild).text();
      // 最后一行是否是空行
      var isEmptyLine = lastChildContent.length == 0 || lastChildContent === decodeURI("%E2%80%8B");
      // 是空行不就不插入新行
      if(isEmptyLine) return;
      var lastChildHeight = $(lastChild).height();
      var cursorOffsetPotision = { top: event.offsetY, left: event.offsetX };
      var lastLinePosition = $(lastChild).position();
      // console.log("最后一行的位置:", lastLinePosition);
      // console.log("鼠标点击的位置:", cursorOffsetPotision);
      if(cursorOffsetPotision.top > lastLinePosition.top + lastChildHeight + 6 &&     // 6 是行间距(它使检测区域相对于富文本最后一行向下移动)
        cursorOffsetPotision.top <= lastLinePosition.top + lastChildHeight + 60) {    // 60 是检测区域高度(检测区域:富文本最后一行的正下方的一个矩形区域)
          var newLine = $("<p><br></p>")[0];
          $(body).append(newLine);
          var range = new Range();
          range.setStart(newLine, 0);
          range.setEnd(newLine, 0);
          range.collapse(true);
          var selection = doc.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
    }
    body.addEventListener("click", handle);
    body.addEventListener("touchend", handle);
  }
}());