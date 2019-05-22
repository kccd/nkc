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
  init: function(para) {
    if($("#targetPost").length > 0) {
      var targetPost = para;
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
      if(abstractDom) {
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
    }
  },
  // 初始化关键词
  initKeywords: function() {
    if(paperProto.config.enableKeyWords) {
      var keyWordsDom = paperProto.get("keyWords");
      if(keyWordsDom) {
        keyWordsDom.style.display = "";
        // 初始化中英文关键词
        var keySpan = "";
        for(var i=0;i < paperProto.config.keyWordsCn.length;i++) {
          keySpan += '<span class="keyTags"><span class="keyCn" kValue="'+paperProto.config.keyWordsCn[i]+'">'+paperProto.config.keyWordsCn[i]+'</span><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>'; 
        }
        for(var c=0;c < paperProto.config.keyWordsEn.length;c++) {
          keySpan += '<span class="keyTags"><span class="keyEn" kValue="'+paperProto.config.keyWordsEn[c]+'">'+paperProto.config.keyWordsEn[c]+'</span><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>'; 
        }
        if(keySpan.length > 0) {
          $("#keyWordsTags").html(keySpan)
        }
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
    keyWordsPanelHeader.innerHTML = "添加关键词(每次添加一个)";
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
    keyWordsPanelCnDiv.style.marginBottom = "5px";
    var keyWordsPanelCnDom = "<span style='font-weight: bold;'>中文: </span>"+"<input type='text' id='keyWordsPanelCnInput' placeholder='只接受中文字符'>";
    keyWordsPanelCnDiv.innerHTML = keyWordsPanelCnDom;
    var keyWordsPanelEnDiv = document.createElement("div");
    keyWordsPanelEnDiv.setAttribute("id", "keyWordsPanelEnDiv");
    var keyWordsPanelEnDom = "<span style='font-weight: bold;'>英文: </span>"+"<input type='text' id='keyWordsPanelEnInput' placeholder='只接受英文字符'>";
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
    if(!keyWordsPanelCnText && !keyWordsPanelEnText) {
      paperProto.keyWordsPanelClose();
      return;
    }
    if(keyWordsPanelCnText.length > 50 || keyWordsPanelEnText.length > 50) {
      return screenTopWarning("关键词字数不得超过50");
    }
    // 检测中文
    if(keyWordsPanelCnText) {
      var existEn = /.*[\u4e00-\u9fa5]+.*$/.test(keyWordsPanelCnText);
      // if(!keyWordsPanelCnText) {
      //   return screenTopWarning("未输入中文关键词")
      // }
      if(!existEn) {
        return screenTopWarning("中文关键词中至少包含一个中文字符");
      }
    }
    // 检测英文
    if(keyWordsPanelEnText) {
      var existCn = /[a-zA-Z]+/.test(keyWordsPanelEnText);
      // if(!keyWordsPanelEnText) {
      //   return screenTopWarning("未输入英文关键词")
      // }
      if(!existCn) {
        return screenTopWarning("英文关键词中至少包含一个英文字符")
      }
    }
    if(keyWordsPanelCnText) {
      var keyTagDom = '<span class="keyTags"><span class="keyCn" kValue="'+keyWordsPanelCnText+'">'+keyWordsPanelCnText+'</span><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>';
      $("#keyWordsTags").append(keyTagDom);
    }
    if(keyWordsPanelEnText) {
      var keyTagDom = '<span class="keyTags"><span class="keyEn" kValue="'+keyWordsPanelEnText+'">'+keyWordsPanelEnText+'</span><span class="fa fa-remove" style="margin-left:5px;cursor:pointer" onclick="removeOneKeyWords(this)"></span></span>';
      $("#keyWordsTags").append(keyTagDom);
    }
    paperProto.keyWordsPanelClose();
    $("#keyWordsPanelCnInput").val("");
    $("#keyWordsPanelEnInput").val("");
  },
  // 初始化作者信息
  initAuthorInfos: function() {
    if(paperProto.config.enableAuthorInfos) {
      var authorInfosDom = paperProto.get("authorInfos");
      if(authorInfosDom) {
        authorInfosDom.style.display = "";
        var selectDom = getCountryList();
        var authorTrs = "";
        if(paperProto.config.authorInfos.length > 0) {
          for(var i=0;i < paperProto.config.authorInfos.length;i++) {
            selectDom = getCountryList(paperProto.config.authorInfos[i].agencyCountry)
            var disStyle = "display:";
            if(!paperProto.config.authorInfos[i].agencyCountry || paperProto.config.authorInfos[i].agencyCountry !== "中国") {
              disStyle = "display:none"
            }
            if(paperProto.config.authorInfos[i].isContract) {
              authorTrs += '<tr class="authorClass"><td><input class="authorName" type="text" value="'+paperProto.config.authorInfos[i].name+'" placeholder="完全公开"/></td><td><input class="authorKcid" type="text" value="'+paperProto.config.authorInfos[i].kcid+'"/></td><td><input class="authorAgency" type="text" value="'+paperProto.config.authorInfos[i].agency+'"/></td><td>'+selectDom+'<input class="authorAgencyAdd" type="text" style='+disStyle+' onclick="SetAgencyCity(this)" value="'+paperProto.config.authorInfos[i].agencyAdd+'"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" checked/></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
              authorTrs += '<tr class="warning"><td colspan="6"><span style="margin-right:1rem;">Email(必填):<input type="text" name="" placeholder="邮箱(登录用户可见)" class="contractEmail" value="'+paperProto.config.authorInfos[i].contractObj.contractEmail+'"/></span><span style="margin-right:1rem;">Tel(选填):<input type="text" name="" placeholder="电话号码(登录用户可见)" class="contractTel" value="'+paperProto.config.authorInfos[i].contractObj.contractTel+'"/></span><span style="margin-right:1rem;">Address(选填):<input type="text" name="" placeholder="地址(登录用户可见)" style="width:300px" class="contractAdd" value="'+paperProto.config.authorInfos[i].contractObj.contractAdd+'"/></span><span>ZipCode(选填):<input type="text" name="" placeholder="邮政编码" style="width:100px" class="contractCode" value="'+paperProto.config.authorInfos[i].contractObj.contractCode+'"/></span></td></tr>';
            }else{
              authorTrs += '<tr class="authorClass"><td><input class="authorName" type="text" value="'+paperProto.config.authorInfos[i].name+'" placeholder="完全公开"/></td><td><input class="authorKcid" type="text" value="'+paperProto.config.authorInfos[i].kcid+'" placeholder="KCID为纯数字组成"/></td><td><input class="authorAgency" type="text" value="'+paperProto.config.authorInfos[i].agency+'"/></td><td>'+selectDom+'<input class="authorAgencyAdd" type="text" style='+disStyle+' onclick="SetAgencyCity(this)" value="'+paperProto.config.authorInfos[i].agencyAdd+'"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)"/></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
            }
          }
        }else{
          authorTrs = '<tr class="authorClass"><td><input class="authorName" type="text" placeholder="完全公开"/></td><td><input class="authorKcid" type="text" placeholder="KCID为纯数字组成"/></td><td><input class="authorAgency" type="text" /></td><td>'+selectDom+'<input class="authorAgencyAdd" type="text" onclick="SetAgencyCity(this)" /></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" /></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
        }
        $("#authInfoList").find("tbody").html(authorTrs);
      }
      }
  },
  // 输出作者信息
  outputAuthorInfosList: function() {
    var authorInfos = [];
    // try{
      $(".authorClass").each(function(index, ele) {
        var name = $(ele).find(".authorName").val();
        var kcid = $(ele).find(".authorKcid").val();
        var agency = $(ele).find(".authorAgency").val();
        var agencyCountry = $(ele).find(".authorCountry").val();
        var agencyAdd = $(ele).find(".authorAgencyAdd").val();
  
        if(name.length > 30 || kcid.length > 30 || agencyAdd.length > 30) throw("姓名、kcid、机构地址字数不得大于30");
        if(agency.length > 100) throw("机构名称字数不得大于100"); 
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
          var isEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(contractObj.contractEmail);
          if(!contractObj.contractEmail) throw("通信Email必须填写");
          if(contractObj.contractEmail.length > 50) throw("Email字数不得大于50")
          if(!isEmail) throw("请输入正确格式的邮箱");
          contractObj.contractTel = contractTr.find(".contractTel").val();
          if(contractObj.contractTel.length > 0) {
            var isTelCn = /.*[\u4e00-\u9fa5]+.*$/.test(contractObj.contractTel);
            var isTelEn = /.*[\u4e00-\u9fa5]+.*$/.test(contractObj.contractTel);
            if(isTelCn || isTelEn) throw("请输入正确的电话号码");
          }
          if(contractObj.contractTel.length > 30) throw("电话号码不得超过30字");
          contractObj.contractAdd = contractTr.find(".contractAdd").val();
          if(contractObj.contractAdd.length > 100) throw("通信地址不得超过100字");
          contractObj.contractCode = contractTr.find(".contractCode").val();
          if(contractObj.contractCode.length > 0) {
            var isCode =  /^[0-9]*$/.test(contractObj.contractCode);
            if(!isCode) throw("请输入正确的邮政编码"); 
          }
          if(contractObj.contractCode.length > 15){
            throw("邮政编码不得超过15个字")
          }
        }
        var infoObj = {
          name: name,
          kcid: kcid,
          agency: agency,
          agencyCountry: agencyCountry,
          agencyAdd: agencyAdd,
          isContract: isContract,
          contractObj: contractObj,
        }
        if(name.length > 0 || kcid.length > 0) {
          authorInfos.push(infoObj)
        }
      })
    // }catch(e){
    //   return screenTopWarning(e)
    // }
    return authorInfos;
  },
  // 初始化原创声明
  initOriginState: function() {
    if(paperProto.config.enableOriginState) {
      var originStateDom = paperProto.get("originState");
      if(originStateDom) {
        originStateDom.style.display = "";
        if(paperProto.config.originState) {
          $("#originStateText").val(paperProto.config.originState)
        }
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
      if(abstractCn) {
        obj.abstractCn = abstractCn;
      }else{
        obj.abstractCn = "";
      }
      if(abstractEn) {
        obj.abstractEn = abstractEn;
      }else{
        obj.abstractEn = "";
      }
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
      if((keyWordsCn.length + keyWordsEn.length) > 50) {
        throw("关键词数量不得超过50个")
      }
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
      if(originState){
        obj.originState = originState;      
      }else{
        obj.originState = "0";
      }
    }
    return obj;
  }
}


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
  var selectDom = getCountryList();
  var authorAom = '<tr class="authorClass"><td><input class="authorName" type="text" placeholder="完全公开"/></td><td><input class="authorKcid" type="text" placeholder="KCID为纯数字组成"/></td><td><input class="authorAgency" type="text" /></td><td>'+selectDom+'<input class="authorAgencyAdd" style="height:22px" type="text" onclick="SetAgencyCity(this)"/></td><td><input class="isContract" type="checkbox" onchange="useContractAuthor(this)" /></td><td><a class="editorBtn btn btn-primary btn-sm" onclick="delOneAuthorInfo(this)">删除</a></td></tr>';
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
    var nextContractTr = '<tr class="warning"><td colspan="6"><span style="margin-right:1rem;">Email(必填):<input type="text" name="" placeholder="邮箱(登录用户可见)" class="contractEmail"/></span><span style="margin-right:1rem;">Tel(选填):<input type="text" name="" placeholder="电话号码(登录用户可见)" class="contractTel"/></span><span style="margin-right:1rem;">Address(选填):<input type="text" name="" placeholder="地址(登录用户可见)" class="contractAdd" style="width:300px"/></span><span>ZipCode(选填):<input type="text" name="" placeholder="邮政编码" class="contractCode" style="width:100px"/></span></td></tr>';
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

var countryArr = ["中国","阿尔巴尼亚","阿尔及利亚","阿富汗","阿根廷","阿拉伯联合酋长国","阿鲁巴","阿曼","阿塞拜疆","阿森松岛","埃及","埃塞俄比亚","爱尔兰","爱沙尼亚","安道尔","安哥拉","安圭拉","安提瓜岛和巴布达","澳大利亚","奥地利","奥兰群岛","巴巴多斯岛","巴布亚新几内亚","巴哈马","巴基斯坦","巴拉圭","巴勒斯坦","巴林","巴拿马","巴西","白俄罗斯","百慕大","保加利亚","北马里亚纳群岛","贝宁","比利时","冰岛","波多黎各","波兰","玻利维亚","波斯尼亚和黑塞哥维那","博茨瓦纳","伯利兹","不丹","布基纳法索","布隆迪","布韦岛","朝鲜","丹麦","德国","东帝汶","多哥","多米尼加","多米尼加共和国","俄罗斯","厄瓜多尔","厄立特里亚","法国","法罗群岛","法属波利尼西亚","法属圭亚那","法属南部领地","梵蒂冈","菲律宾","斐济","芬兰","佛得角","弗兰克群岛","冈比亚","刚果","刚果民主共和国","哥伦比亚","哥斯达黎加","格恩西岛","格林纳达","格陵兰","古巴","瓜德罗普","关岛","圭亚那","哈萨克斯坦","海地","韩国","荷兰","荷属安地列斯","赫德和麦克唐纳群岛","洪都拉斯","基里巴斯","吉布提","吉尔吉斯斯坦","几内亚","几内亚比绍","加拿大","加纳","加蓬","柬埔寨","捷克共和国","津巴布韦","喀麦隆","卡塔尔","开曼群岛","科科斯群岛","科摩罗","科特迪瓦","科威特","克罗地亚","肯尼亚","库克群岛","拉脱维亚","莱索托","老挝","黎巴嫩","利比里亚","利比亚","立陶宛","列支敦士登","留尼旺岛","卢森堡","卢旺达","罗马尼亚","马达加斯加","马尔代夫","马耳他","马拉维","马来西亚","马里","马其顿","马绍尔群岛","马提尼克","马约特岛","曼岛","毛里求斯","毛里塔尼亚","美国","美属萨摩亚","美属外岛","蒙古","蒙特塞拉特","孟加拉","密克罗尼西亚","秘鲁","缅甸","摩尔多瓦","摩洛哥","摩纳哥","莫桑比克","墨西哥","纳米比亚","南非","南极洲","南乔治亚和南桑德威奇群岛","瑙鲁","尼泊尔","尼加拉瓜","尼日尔","尼日利亚","纽埃","挪威","诺福克","帕劳群岛","皮特凯恩","葡萄牙","乔治亚","日本","瑞典","瑞士","萨尔瓦多","萨摩亚","塞拉利昂","塞内加尔","塞浦路斯","塞舌尔","沙特阿拉伯","圣诞岛","圣多美和普林西比","圣赫勒拿","圣基茨和尼维斯","圣卢西亚","圣马力诺","圣皮埃尔和米克隆群岛","圣文森特和格林纳丁斯","斯里兰卡","斯洛伐克","斯洛文尼亚","斯瓦尔巴和扬马廷","斯威士兰","苏丹","苏里南","所罗门群岛","索马里","塔吉克斯坦","泰国","坦桑尼亚","汤加","特克斯和凯克特斯群岛","特里斯坦达昆哈","特立尼达和多巴哥","突尼斯","图瓦卢","土耳其","土库曼斯坦","托克劳","瓦利斯和福图纳","瓦努阿图","危地马拉","维尔京群岛，美属","维尔京群岛，英属","委内瑞拉","文莱","乌干达","乌克兰","乌拉圭","乌兹别克斯坦","西班牙","希腊","新加坡","新喀里多尼亚","新西兰","匈牙利","叙利亚","牙买加","亚美尼亚","也门","伊拉克","伊朗","以色列","意大利","印度","印度尼西亚","英国","英属印度洋领地","约旦","越南","赞比亚","泽西岛","乍得","直布罗陀","智利","中非共和国"
]

/**
 * 获取国家列表
 */

function getCountryList(country) {
  var selectDom = "";
  var optionDom = ""
  for(var c=0;c<countryArr.length;c++) {
    if(country && country == countryArr[c]) {
      optionDom += "<option selected>"+countryArr[c]+"</option>";
    }else{
      optionDom += "<option>"+countryArr[c]+"</option>";
    }
  }
  selectDom = "<select id='selectList' class='authorCountry' style='vertical-align:bottom;height:22px' onchange='changeCountry(this)'>"+optionDom+"</select>"
  return selectDom;
}

function changeCountry(para) {
  var country = $(para).val();
  if(country == "中国") {
    $(para).next().css("display", "")
  }else{
    $(para).next().css("display", "none")
  }
}