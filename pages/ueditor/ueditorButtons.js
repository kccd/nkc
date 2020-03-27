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
            // var dom = NKC.methods.resourceToHtml(res.data, res.type);
            if(res.type === "emoji") {
              editor.execCommand('inserthtml', 
              "<nkcsource data-type='twemoji' data-id='"+ res.data +"' contenteditable='false'><img src=\""+ NKC.methods.tools.getUrl(res.type, res.data) +"\"></nkcsource>");
            }else if(res.type === "sticker") {
              editor.execCommand('inserthtml', 
              "<nkcsource data-type='sticker' data-id='"+ res.data.rid +"' contenteditable='false'><img src=\""+ NKC.methods.tools.getUrl(res.type, res.data.rid) +"\"></nkcsource>");
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
              // var dom = NKC.methods.resourceToHtml(data[i]);
              editor.execCommand('inserthtml', resourceToHtml(type, source.rid, source.oname));
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
              // var dom = NKC.methods.resourceToHtml(data[i]);
              editor.execCommand('inserthtml', resourceToHtml(type, source.rid, source.oname));
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
      editDoc.addEventListener("dblclick", function(e) {
         var target = e.target;
         if(target.tagName.toLowerCase() !== "nkcsource") return;
         var type = target.dataset.type;
         var score = target.dataset.id;
         if(type !== "xsf") return;
         window.insertHideContent.open(function(newscore) {
          target.dataset.id = newscore;
          target.dataset.message = "学术分"+newscore+"分以上可见";
        }, parseFloat(score));
      })
    })
    
    return new UE.ui.Button({
      name:'hideContent',
      title:'插入隐藏内容',
      className: 'edui-default edui-for-hide-content edui-icon',
      onclick:function () {
        if(window.insertHideContent) {
          window.insertHideContent.open(function(score) {
            editor.execCommand("inserthtml", resourceToHtml("xsf", score))
          });
        } else {
          return sweetError("未初始化资源选择模块");
        }
      }
    })
  });
  
  
  
  // 转换成nkcsource标签的html文本
  function resourceToHtml(type, rid, name) {
    var nkcsource = document.createElement("nkcsource");
    var newline = false;
    var handles = {
      "picture": function() {
        nkcsource.style.display = "inline-block";
        return "<img src=\"/r/"+ rid +"\">";
      },
      "sticker": function() {
        nkcsource.setAttribute("contenteditable", "false");
        nkcsource.style.display = "inline-block";
        return "<img src=\"/r/"+ rid +"\">";
      },
      "video": function() {
        newline = true;
        nkcsource.setAttribute("contenteditable", "false");
        return "<video src=\"/r/"+ rid +"\" controls><video>";
      },
      "audio": function() {
        newline = true;
        nkcsource.setAttribute("contenteditable", "false");
        return "<audio src=\"/r/"+ rid +"\" controls></audio>";
      },
      "attachment": function() {
        newline = true;
        nkcsource.setAttribute("contenteditable", "false");
        return "<img src=\"/ueditor/themes/default/images/attachment.png\"><a href='/r/"+ rid +"' target='_blank'>"+ name +"</a>"
      },
      "pre": function() {},
      "xsf": function() {
        newline = true;
        nkcsource.setAttribute("data-message", "学术分"+rid+"分以上可见");
        return "<strong style='font-weight:normal;'><br></strong>";
      },
      "twemoji": function() {
        nkcsource.setAttribute("contenteditable", "false");
        nkcsource.style.display = "inline-block";
        return "<img src=\"/r/"+ rid +"\">";
      },
      "formula": function() {}
    }
    var hit = handles[type];
    if(hit) {
      nkcsource.setAttribute("data-type", type);
      nkcsource.setAttribute("data-id", rid);
    }
    nkcsource.innerHTML = hit();
    return nkcsource.outerHTML + (newline? "<span>"+ decodeURI("%E2%80%8E") +"<span>": "");
  }
}());