/**
 * 论文相关组件
 */
var paperProto = {
  config: {
    enableAbstract: true, // 是否启用摘要
    enableKeyWords: true, // 是否启用关键词
    enableAuthorInfos: true, // 是否启用作者信息
    enableOriginState: true, // 是否启用原创声明

    abstractCn: "", // 默认中文摘要
    abstractEn: "", // 默认英文摘要
    keyWordsCn: [], // 默认中文关键词
    keyWordsEn: [], // 默认英文关键词
    authorInfos: [], // 默认作者信息
    originState: "", // 默认原创声明

    keyWordsPanelExist:false, // 关键词panel是否已存在
    useOriginState: false, // 是否使用原创声明
  },
  // 初始化论文相关组件
  init: function() {
    if($("#targetPost").length > 0) {
      var targetPost = JSON.parse($("#targetPost").text());
      if(targetPost){
        for(var i in targetPost) {
          for(var c in paperProto.config) {
            if(i == c) {
              paperProto.config[c] = targetPost[i]
            }
          }
        }
      }
    }
    paperProto.initAbstract();
    paperProto.initKeywords();
    paperProto.initAuthorInfos();
    paperProto.initOriginState();
  },
  // 根据id获取dom
  get: function(id) {
    var demoDom = document.getElementById(id);
    return demoDom;
  },
  // 初始化摘要
  initAbstract: function() {
    if(paperProto.config.enableAbstract) {
      var abstractDom = paperProto.get("abstract");
      abstractDom.style.display = "";
      // 初始化摘要文本
      var abstractCnDom = paperProto.get("abstractCn");
      abstractCnDom.value = paperProto.config.abstractCn;
      var abstractEnDom = paperProto.get("abstractEn");
      abstractEnDom.value = paperProto.config.abstractEn;
      // 初始化摘要字数
      $("#abstractCnNum").text(paperProto.config.abstractCn.length)
      $("#abstractEnNum").text(paperProto.config.abstractEn.length)
      // 监听摘要字数
      $("#abstractCn").on("input propertychange" ,function() {
        $("#abstractCnNum").text($("#abstractCn").val().length)
      })
      $("#abstractEn").on("input propertychange" ,function() {
        $("#abstractEnNum").text($("#abstractEn").val().length)
      })
    }
  },
  // 初始化关键词
  initKeywords: function() {
    if(paperProto.config.enableKeyWords) {
      var keyWordsDom = paperProto.get("keyWords");
      keyWordsDom.style.display = "";
      // 初始化中英文关键词
      var keySpan = "";
      for(var i=0;i < paperProto.config.keyWordsCn.length;i++) {
        keySpan += '<span class="keyTags"><span class="keyCn" kValue="'+paperProto.config.keyWordsCn[i]+'">'+paperProto.config.keyWordsCn[i]+'</span><b> [</b><span class="keyEn" kValue="'+paperProto.config.keyWordsEn[i]+'">'+paperProto.config.keyWordsEn[i]+'</span><b>]</b><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>'; 
      }
      if(keySpan.length > 0) {
        $("#keyWordsTags").html(keySpan)
      }
    }
  },
  // 创建关键词panel
  createKeyWordsPanel: function(para) {
    var parentDivDom = $(para).parent("div");
    var paraRect = para.getBoundingClientRect();
    // 创建一个panel外壳
    var keyWordsPanelShell = document.createElement("div");
    keyWordsPanelShell.setAttribute("id", "keyWordsPanelShell");
    // 给外壳添加样式
    keyWordsPanelShell.style.display = "none";
    keyWordsPanelShell.style.position = "absolute";
    keyWordsPanelShell.style.background = 'transparent';
    keyWordsPanelShell.style.zIndex = "20000";
    keyWordsPanelShell.style.width = paraRect.width + "px";
    
    // 将外壳放入所在位置
    $(parentDivDom).css("position", "relative");
    $(parentDivDom).append(keyWordsPanelShell);
    paperProto.keyWordsPanelShow();
    // 创建内壁
    var keyWordsPanelWall = document.createElement("div");
    keyWordsPanelWall.setAttribute("id", "keyWordsPanelWall");
    keyWordsPanelWall.className = "keyWordsPanelWall";
    keyWordsPanelShell.appendChild(keyWordsPanelWall)
    // 创建header
    var keyWordsPanelHeader = document.createElement("div");
    keyWordsPanelHeader.innerHTML = "请填写关键词";
    keyWordsPanelHeader.setAttribute("id", "keyWordsPanelHeader");
    keyWordsPanelHeader.className = "keyWordsPanelHeader";
    keyWordsPanelWall.appendChild(keyWordsPanelHeader)
    // 创建关闭按钮
    var keyWordsPanelClose = document.createElement("span");
    keyWordsPanelClose.setAttribute('id', "keyWordsPanelClose")
    keyWordsPanelClose.className = "keyWordsPanelClose";
    keyWordsPanelClose.className += " fa fa-remove";
    keyWordsPanelWall.appendChild(keyWordsPanelClose);
    // 给关闭按钮添加点击关闭事件
    keyWordsPanelClose.addEventListener("click", function() {
      paperProto.keyWordsPanelClose();
    })
    // 创建中英文关键词输入框
    var keyWordsPanelCnDiv = document.createElement("div");
    keyWordsPanelCnDiv.setAttribute("id", "keyWordsPanelCnDiv");
    var keyWordsPanelCnDom = "<span style='font-weight: bold;'>中文: </span>"+"<input type='text' id='keyWordsPanelCnInput'>";
    keyWordsPanelCnDiv.innerHTML = keyWordsPanelCnDom;
    var keyWordsPanelEnDiv = document.createElement("div");
    keyWordsPanelEnDiv.setAttribute("id", "keyWordsPanelEnDiv");
    var keyWordsPanelEnDom = "<span style='font-weight: bold;'>英文: </span>"+"<input type='text' id='keyWordsPanelEnInput'>";
    keyWordsPanelEnDiv.innerHTML = keyWordsPanelEnDom;
    keyWordsPanelWall.appendChild(keyWordsPanelCnDiv)
    keyWordsPanelWall.appendChild(keyWordsPanelEnDiv)
    // 创建确定按钮
    var keyWordsPanelSureDiv = document.createElement("div");
    keyWordsPanelSureDiv.style.textAlign = "end";
    var keyWordsPanelSureBtn = document.createElement("a");
    keyWordsPanelSureBtn.innerHTML = "确定";
    keyWordsPanelSureBtn.setAttribute("id", "keyWordsPanelSureBtn");
    keyWordsPanelSureBtn.className += "btn btn-primary btn-sm keyWordsPanelSureBtn";
    keyWordsPanelSureDiv.appendChild(keyWordsPanelSureBtn)
    keyWordsPanelWall.appendChild(keyWordsPanelSureDiv)
    keyWordsPanelSureBtn.addEventListener("click", function() {
      paperProto.outputKeyWords();
    })
    // 将关键词panel存在状态置为true
    paperProto.config.keyWordsPanelExist = true;
  },
  // 打开一个关键词panel
  keyWordsPanelOpen: function(para) {
    if(paperProto.config.keyWordsPanelExist) {
      paperProto.keyWordsPanelShow()
    }else{
      paperProto.createKeyWordsPanel(para)
    }
  },
  // 关闭keyWordsPanel
  keyWordsPanelClose: function() {
    var keyWordsPanelShell = paperProto.get("keyWordsPanelShell");
    keyWordsPanelShell.style.display = "none";
  },
  // 显示keyWordsPanel
  keyWordsPanelShow: function() {
    var keyWordsPanelShell = paperProto.get("keyWordsPanelShell");
    keyWordsPanelShell.style.display = "block";
  },
  // 输出关键词
  outputKeyWords: function() {
    var keyWordsPanelCnText = $("#keyWordsPanelCnInput").val();
    var keyWordsPanelEnText = $("#keyWordsPanelEnInput").val();
    // 检测中文
    if(!keyWordsPanelCnText) {
      return screenTopWarning("未输入中文关键词")
    }
    // 检测英文
    if(!keyWordsPanelEnText) {
      return screenTopWarning("未输入英文关键词")
    }
    var keyTagDom = '<span class="keyTags"><span class="keyCn" kValue="'+keyWordsPanelCnText+'">'+keyWordsPanelCnText+'</span><b> [</b><span class="keyEn" kValue="'+keyWordsPanelEnText+'">'+keyWordsPanelEnText+'</span><b>]</b><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>';
    $("#keyWordsTags").append(keyTagDom);
    paperProto.keyWordsPanelClose();
    $("#keyWordsPanelCnInput").val("");
    $("#keyWordsPanelEnInput").val("");
  },
  // 初始化作者信息
  initAuthorInfos: function() {
    if(paperProto.config.enableAuthorInfos) {
      var authorInfosDom = paperProto.get("authorInfos");
      authorInfosDom.style.display = "";
      var authorTrs = "";
      if(paperProto.config.authorInfos.length > 0) {
        for(var i=0;i < paperProto.config.authorInfos.length;i++) {
          if(paperProto.config.authorInfos[i].isContract) {
            authorTrs += '<tr class="authorClass"><td><input class="authorName" type="text" value="'+paperProto.config.authorInfos[i].name+'"/></td><td><input class="authorKcid" type="number" value="'+paperProto.config.authorInfos[i].kcid+'"/></td><td><input class="authorAgency" type="text" value="'+paperProto.config.authorInfos[i].agency+'"/></td><td><input class="authorAgencyAdd" type="text" onclick="SelCity(this)" value="'+paperProto.config.authorInfos[i].agencyAdd+'"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" checked/></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
            authorTrs += '<tr class="warning"><td colspan="6"><span style="margin-right:1rem;">Email(必填):<input type="text" name="" placeholder="邮箱(登陆用户可见)" class="contractEmail" value="'+paperProto.config.authorInfos[i].contractObj.contractEmail+'"/></span><span style="margin-right:1rem;">Tel(选填):<input type="text" name="" placeholder="电话号码" class="contractTel" value="'+paperProto.config.authorInfos[i].contractObj.contractTel+'"/></span><span style="margin-right:1rem;">Address(选填):<input type="text" name="" placeholder="地址" class="contractAdd" value="'+paperProto.config.authorInfos[i].contractObj.contractAdd+'"/></span><span>ZipCode(选填):<input type="text" name="" placeholder="邮政编码" class="contractCode" value="'+paperProto.config.authorInfos[i].contractObj.contractCode+'"/></span></td></tr>';
          }else{
            authorTrs += '<tr class="authorClass"><td><input class="authorName" type="text" value="'+paperProto.config.authorInfos[i].name+'"/></td><td><input class="authorKcid" type="number" value="'+paperProto.config.authorInfos[i].kcid+'"/></td><td><input class="authorAgency" type="text" value="'+paperProto.config.authorInfos[i].agency+'"/></td><td><input class="authorAgencyAdd" type="text" onclick="SelCity(this)" value="'+paperProto.config.authorInfos[i].agencyAdd+'"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)"/></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
          }
        }
      }else{
        authorTrs = '<tr class="authorClass"><td><input class="authorName" type="text" /></td><td><input class="authorKcid" type="number" /></td><td><input class="authorAgency" type="text" /></td><td><input class="authorAgencyAdd" type="text" onclick="SelCity(this)" /></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" /></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
      }
      $("#authInfoList").find("tbody").html(authorTrs);
    }
  },
  // 输出作者信息
  outputAuthorInfosList: function() {
    var authorInfos = [];
    try{
      $(".authorClass").each(function(index, ele) {
        var name = $(ele).find(".authorName").val();
        if(!name) throw("有未填写完成的作者项");
        var kcid = $(ele).find(".authorKcid").val();
        var agency = $(ele).find(".authorAgency").val();
        var agencyAdd = $(ele).find(".authorAgencyAdd").val();
  
        var contractObj = {
          contractEmail:"",
          contractTel: "",
          contractAdd: "",
          contractCode:"",
        };
        var isContract=  $(ele).find(".isContract").prop("checked");
        if(isContract) {
          var contractTr = $(ele).next();
          contractObj.contractEmail = contractTr.find(".contractEmail").val();
          if(!contractObj.contractEmail) throw("通信Email必须填写");
          contractObj.contractTel = contractTr.find(".contractTel").val();
          contractObj.contractAdd = contractTr.find(".contractAdd").val();
          contractObj.contractCode = contractTr.find(".contractCode").val();
        }
        var infoObj = {
          name: name,
          kcid: kcid,
          agency: agency,
          agencyAdd: agencyAdd,
          isContract: isContract,
          contractObj: contractObj,
        }
        authorInfos.push(infoObj)
      })
    }catch(e){
      return screenTopWarning(e)
    }
    return authorInfos;
  },
  // 初始化原创声明
  initOriginState: function() {
    if(paperProto.config.enableOriginState) {
      var originStateDom = paperProto.get("originState");
      originStateDom.style.display = "";
      if(paperProto.config.originState) {
        $("#originStateText").val(paperProto.config.originState)
      }
    }
  },
  // 点击声明原创
  clickOriginState: function() {
    if(paperProto.config.useOriginState) {
      var originSpan = "<span>声明原创</span>"
      $("#originBtn").removeClass("originBtnActive");
      $("#originBtn").html(originSpan);
      $("#originStateTextDiv").css("display", "none");
      paperProto.config.useOriginState = false;
    }else{
      var originSpan = "<span>声明原创</span><span class='fa fa-check'></span>"
      $("#originBtn").addClass("originBtnActive");
      $("#originBtn").html(originSpan);
      $("#originStateTextDiv").css("display", "")
      paperProto.config.useOriginState = true;
    }
  },
  paperExport: function() {
    var obj = {};
    // 输出摘要
    if(paperProto.config.enableAbstract) {
      var abstractCn = $("#abstractCn").val();
      var abstractEn = $("#abstractEn").val();
      // 检测摘要填写

      obj.abstractCn = abstractCn;
      obj.abstractEn = abstractEn;
    }
    // 输出关键词
    if(paperProto.config.enableKeyWords) {
      var keyWordsCn = [];
      var keyWordsEn = [];
      $(".keyCn").each(function() {
        keyWordsCn.push($(this).attr("kValue"))
      })
      $(".keyEn").each(function() {
        keyWordsEn.push($(this).attr("kValue"))
      })
      // 检测关键词填写

      obj.keyWordsCn = keyWordsCn;
      obj.keyWordsEn = keyWordsEn;
    }
    // 输出作者信息
    if(paperProto.config.enableAuthorInfos) {
      obj.authorInfos = paperProto.outputAuthorInfosList();
    }
    // 输出原创声明
    if(paperProto.config.enableOriginState) {
      var agreeOrigin = $("#agreeOrigin").prop("checked");
      var originState = $("#originStateText").val();
      if(originState !== "0" && agreeOrigin == false) {
        throw("声明原创需仔细阅读并同意相关协议")
      }
      // 检测原创声明
      obj.originState = originState;
    }
    return obj;
  }
}

paperProto.init();

// 打开关键词panel
function openKeyWordsPanel(para) {
  paperProto.keyWordsPanelOpen(para);
}

// 删除一个关键词
function removeOneKeyWords(para) {
  $(para).parent(".keyTags").remove();
}

// 增加一条作者信息
function addOneAuthorInfo() {
  var authorAom = '<tr class="authorClass"><td><input class="authorName" type="text" /></td><td><input class="authorKcid" type="text" /></td><td><input class="authorAgency" type="text" /></td><td><input class="authorAgencyAdd" type="text" onclick="SelCity(this)"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" /></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
  $("#authInfoList").find("tbody").append(authorAom)
}

// 删除当前一条作者信息
function delOneAuthorInfo(para) {
  var sureDel = confirm("确定要删除当前条目？")
  if(sureDel) {
    // 判断是否已使用通信作者
    if($(para).parents("tr").find(".isContract").prop("checked")) {
      return screenTopWarning("删除当前条目请先关闭通信作者");
    }
    $(para).parents("tr").remove();
  }
}

// 获取全部作者信息
function outputAuthorInfosList() {
  var authorInfos = [];
  try{
    $(".authorClass").each(function(index, ele) {
      var name = $(ele).find(".authorName").val();
      if(!name) throw("有未填写完成的作者项");
      var kcid = $(ele).find(".authorKcid").val();
      var agency = $(ele).find(".authorAgency").val();
      var agencyAdd = $(ele).find(".authorAgencyAdd").val();

      var contractObj = {
        contractEmail:"",
        contractTel: "",
        contractAdd: "",
        contractCode:"",
      };
      var isContract=  $(ele).find(".isContract").prop("checked");
      if(isContract) {
        var contractTr = $(ele).next();
        contractObj.contractEmail = contractTr.find(".contractEmail").val();
        if(!contractObj.contractEmail) throw("通信Email必须填写");
        contractObj.contractTel = contractTr.find(".contractTel").val();
        contractObj.contractAdd = contractTr.find(".contractAdd").val();
        contractObj.contractCode = contractTr.find(".contractCode").val();
      }
      var infoObj = {
        name: name,
        kcid: kcid,
        agency: agency,
        agencyAdd: agencyAdd,
        isContract: isContract,
        contractObj: contractObj,
      }
      authorInfos.push(infoObj)
    })
  }catch(e){
    return screenTopWarning(e)
  }
  return authorInfos;
}

// 点击声明原创
function useOriginState() {
  paperProto.clickOriginState();
}

/**
 * 使用通信作者
 */
function useContractAuthor(para) {
  // 判断是否已使用通信作者
  var isContract = $(para).prop("checked");
  if(!isContract) {
    var nextContractTr = $(para).parents("tr").next().remove();
  }else{
    var nextContractTr = '<tr class="warning"><td colspan="6"><span style="margin-right:1rem;">Email(必填):<input type="text" name="" placeholder="邮箱(登陆用户可见)" class="contractEmail"/></span><span style="margin-right:1rem;">Tel(选填):<input type="text" name="" placeholder="电话号码" class="contractTel"/></span><span style="margin-right:1rem;">Address(选填):<input type="text" name="" placeholder="地址" class="contractAdd"/></span><span>ZipCode(选填):<input type="text" name="" placeholder="邮政编码" class="contractCode"/></span></td></tr>';
    $(para).parents("tr").after(nextContractTr)
  }
}

/**
 * 输出
 * 
 */
function testbtn() {
  paperProto.paperExport();
}