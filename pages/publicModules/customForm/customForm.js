NKC.modules.customForm = function() {
  var this_ = this;
  this_.config = {
    
  },
  this_.open = function(option) {

  },
  // 初始化结果组件
  this_.initResult = function(option) {
    this_.openFormResult();
    var previewFormDom = buildUpFormList(option)
    // 将创建好的表单列表放入预览页中
    $("#formResult").html(previewFormDom)
  },
  // 输出结果JSON（检测）
  this_.outputResultJSON = function() {
    var resultJSON = [];
    $("#formResult").find(".preview-form-item").each(function() {
      var key = $(this).find(".custom-title").text();
      var isCheckDom = $(this).find(".custom-require");
      var isCheck = false;
      if(isCheckDom.length > 0) {
        isCheck = true;
      }
      var formType = $(this).attr("data-formType");
      var value;
      if(["text", "textarea", "number"].includes(formType)) {
        value = $(this).find(".custom-input").val() || "";
      }else if(formType === "radio"){
        value = $(this).find("input[type=radio][name='"+key+"']:checked").val() || "";
      }else if(formType === "checkbox") {
        value = [];
        var checkDomList = $(this).find("input:checkbox");
        for(var c=0;c < checkDomList.length;c++) {
          if($(checkDomList[c]).prop("checked")) {
            value.push($(checkDomList[c]).val())
          }
        }
      }else if(formType === "select") {
        value = $(this).find("#"+key).val() || "";
      }
      var option = {
        key: key,
        value: value
      }
      if(isCheck && value.length === 0) {
        resultJSON = [];
        return false;
      }else{
        resultJSON.push(option)
      }
    })
    return resultJSON;
  },
  // 输出JSON
  this_.outputJSON = function() {
    var outputJSON = outputFormListJSON();
    return outputJSON;
  },
  // 打开预览
  this_.openFormInit = function() {
    $("#formInit").css("display", "");
  },
  // 关闭预览
  // 打开结果
  this_.openFormResult = function() {
    $("#formResult").css("display", "");
  },
  // 关闭结果
  // 初始化预览组件
  this_.init = function(option) {
    this_.openFormInit();
    if(option) {
      var initFormDom = "";
      for(var i=0;i < option.length;i++) {
        if(["姓名","手机","邮箱"].includes(option[i].infoName)) {
          continue;
        }else{
          initFormDom += this_.initSingle(option[i])
        }
      }
      $("#customFormArea").html(initFormDom)
    }
  },
  this_.initSingle = function(para) {
    var reDom = this_.initFormListObj[para.formType];
    // 替换表单名称
    if(para.infoName && para.infoName.length > 0) {
      reDom = reDom.replace(/\[infoName\]/igm, para.infoName)
    }else{
      reDom = reDom.replace(/\[infoName\]/igm, "")
    }
    // 替换表单是否未必选
    if(para.isCheck) {
      reDom = reDom.replace(/\[isCheck\]/igm, "checked=checked")
    }else{
      reDom = reDom.replace(/\[isCheck\]/igm, "")
    }
    // 替换表单描述
    if(para.infoDesc && para.infoDesc.length > 0) {
      reDom = reDom.replace(/\[infoDesc\]/igm, para.infoDesc)
    }else{
      reDom = reDom.replace(/\[infoDesc\]/igm, "")
    }
    // 根据表单类型，替换表单类型选项
    if(["radio", "checkbox", "select"].includes(para.formType)) {
      var paraOption = "";
      for(var i=0;i < para.infoPara.length;i++) {
        paraOption += "<div class='custom-form-sub-item'><input type='text' value='"+para.infoPara[i]+"' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>";
      }
      reDom = reDom.replace(/\[infoPara\]/igm, paraOption);
    }else{
      reDom = reDom.replace(/\[infoPara\]/igm, "")
    }
    return reDom;
  },
  this_.initFormListObj = {
    "text": "<div class='custom-form-item' data-formType='text'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text' value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>",
    "textarea": "<div class='custom-form-item' data-formType='textarea'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text'value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>",
    "number": "<div class='custom-form-item' data-formType='number'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text' value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>",
    "radio": "<div class='custom-form-item' data-formType='radio'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text' value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'>[infoPara]<div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>",
    "checkbox": "<div class='custom-form-item' data-formType='checkbox'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text'value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'>[infoPara]<div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>",
    "select": "<div class='custom-form-item' data-formType='select'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input' [isCheck]> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='[infoName]' title='' class='custom-input' id='infoName'> <input type='text' value='[infoDesc]' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'>[infoPara]<div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>"
  }
}

/**
 * 新增一条常用表单
 * @param {String} formtype 
 */
function addCommonFormOption(formtype) {
  $("#customFormArea").append(commonFormListObj[formtype].dom)
}

var commonFormListObj = {
  "company": {
    "name": "公司单位",
    "dom": "<div class='custom-form-item' data-formType='text'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='公司单位' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "department": {
    "name": "部门",
    "dom": "<div class='custom-form-item' data-formType='text'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='部门' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "position": {
    "name": "职位",
    "dom": "<div class='custom-form-item' data-formType='text'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' value='职位' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "gender": {
    "name": "性别",
    "dom":  "<div class='custom-form-item' data-formType='radio'> "+
            " <label class='custom-checkbox'>"+
            "   <input type='checkbox' class='custom-input-checkbox must-input'>"+
            "   <span class='custom-checkbox-text'>必填</span>"+
            " </label>"+
            " <div class='custom-form-box'>"+
            "   <div class='custom-form-box-line'>"+
            "     <input type='text' value='性别' title='' class='custom-input' id='infoName'>"+
            "     <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'>"+
            "     <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span>"+
            "   </div>"+
            "   <div class='custom-form-sub'>"+
            "     <h1 class='custom-form-sub-title'>选项列表</h1>"+
            "     <div class='custom-form-sub-list'>"+
            "       <div class='custom-form-sub-item'><input type='text' value='男' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='女' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div>"+
            "     </div>"+
            "   </div>"+
            " </div>"+
            "</div>"
  },
  "age": {
    "name": "年龄",
    "dom":  "<div class='custom-form-item' data-formType='radio'> "+
            " <label class='custom-checkbox'>"+
            "   <input type='checkbox' class='custom-input-checkbox must-input'>"+
            "   <span class='custom-checkbox-text'>必填</span>"+
            " </label>"+
            " <div class='custom-form-box'>"+
            "   <div class='custom-form-box-line'>"+
            "     <input type='text' value='年龄' title='' class='custom-input' id='infoName'>"+
            "     <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'>"+
            "     <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span>"+
            "   </div>"+
            "   <div class='custom-form-sub'>"+
            "     <h1 class='custom-form-sub-title'>选项列表</h1>"+
            "     <div class='custom-form-sub-list'>"+
            "       <div class='custom-form-sub-item'><input type='text' value='15岁以下' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='16~20岁' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='21~25岁' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='26~30岁' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='31~40岁' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='40岁以上' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div>"+
            "     </div>"+
            "   </div>"+
            " </div>"+
            "</div>"
  },
  "education": {
    "name": "学历",
    "dom":  "<div class='custom-form-item' data-formType='radio'> "+
            " <label class='custom-checkbox'>"+
            "   <input type='checkbox' class='custom-input-checkbox must-input'>"+
            "   <span class='custom-checkbox-text'>必填</span>"+
            " </label>"+
            " <div class='custom-form-box'>"+
            "   <div class='custom-form-box-line'>"+
            "     <input type='text' value='学历' title='' class='custom-input' id='infoName'>"+
            "     <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'>"+
            "     <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span>"+
            "   </div>"+
            "   <div class='custom-form-sub'>"+
            "     <h1 class='custom-form-sub-title'>选项列表</h1>"+
            "     <div class='custom-form-sub-list'>"+
            "       <div class='custom-form-sub-item'><input type='text' value='中学' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='大专' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='本科' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='硕士' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='博士' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='其他' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div>"+
            "     </div>"+
            "   </div>"+
            " </div>"+
            "</div>"
  },
  "income": {
    "name": "月收入",
    "dom":  "<div class='custom-form-item' data-formType='radio'> "+
            " <label class='custom-checkbox'>"+
            "   <input type='checkbox' class='custom-input-checkbox must-input'>"+
            "   <span class='custom-checkbox-text'>必填</span>"+
            " </label>"+
            " <div class='custom-form-box'>"+
            "   <div class='custom-form-box-line'>"+
            "     <input type='text' value='月收入' title='' class='custom-input' id='infoName'>"+
            "     <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'>"+
            "     <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span>"+
            "   </div>"+
            "   <div class='custom-form-sub'>"+
            "     <h1 class='custom-form-sub-title'>选项列表</h1>"+
            "     <div class='custom-form-sub-list'>"+
            "       <div class='custom-form-sub-item'><input type='text' value='1k以下' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='1k~3.5k' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='3.5k~6k' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='6k~10k' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-item'><input type='text' value='10k以上' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>"+
            "       <div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div>"+
            "     </div>"+
            "   </div>"+
            " </div>"+
            "</div>"
  }
}

/**
 * 新增一条自定义表单
 * @param {String} formtype 表单类型 
 * @returns null
 */
function addCustomFormOption(formtype) {
  $("#customFormArea").append(customFormListObj[formtype].dom)
}

// 定义自定义表单组
var customFormListObj = {
  "text": {
    "name": "单行文本框",
    "dom": "<div class='custom-form-item' data-formType='text'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='单行文本框' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "textarea": {
    "name": "多行文本框",
    "dom": "<div class='custom-form-item' data-formType='textarea'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='多行文本框' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "number": {
    "name": "数字输入框",
    "dom": "<div class='custom-form-item' data-formType='number'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='数字输入框' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div></div></div>"
  },
  "radio": {
    "name": "单选按钮组",
    "dom": "<div class='custom-form-item' data-formType='radio'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='单选按钮组' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'> <div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>"
  },
  "checkbox": {
    "name": "多选按钮组",
    "dom": "<div class='custom-form-item' data-formType='checkbox'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='多选按钮组' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'><div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>"
  },
  "select": {
    "name": "下拉选择框",
    "dom": "<div class='custom-form-item' data-formType='select'> <label class='custom-checkbox'><input type='checkbox' class='custom-input-checkbox must-input'> <span class='custom-checkbox-text'>必填</span></label> <div class='custom-form-box'><div class='custom-form-box-line'><input type='text' placeholder='下拉选择框' title='' class='custom-input' id='infoName'> <input type='text' placeholder='提示信息在这里' class='custom-input' id='infoDesc'> <span class='custom-form-sub-button fa fa-trash-o' onclick='delCustomFormOption(this)'></span></div> <div class='custom-form-sub'><h1 class='custom-form-sub-title'>选项列表</h1> <div class='custom-form-sub-list'><div class='custom-form-sub-add'><span class='custom-form-sub-button fa fa-plus-square' onclick='addOptionValue(this)'></span></div></div></div></div></div>"
  }
};

/**
 * 删除当前自定义表单项
 */
function delCustomFormOption(para) {
  $(para).parents(".custom-form-item").remove();
}

/**
 * 添加一条选项类型
 */
function addOptionValue(para) {
  var optionDom = "<div class='custom-form-sub-item'><input type='text' placeholder='选项类型' title='' class='custom-input custom-form-sub-input'> <span class='custom-icon-del fa fa-times' onclick='delOptionValue(this)'></span></div>";
  $(para).parents(".custom-form-sub-add").before(optionDom);
}

/**
 * 删除当前选项类型
 */
function delOptionValue(para) {
  $(para).parents(".custom-form-sub-item").remove();
}

/**
 * 预览表单
 */
function reViewFormList() {
  // 获取表单列表
  var formList = outputFormListJSON();
  // 创建预览页的Dom
  $('#formReviewModal').modal();
  // 组装表单
  var previewFormDom = buildUpFormList(formList)
  // 将创建好的表单列表放入预览页中
  $("#reviewArea").html(previewFormDom)
}

/**
 * 组装全部预览表单
 * @param {*} para 
 */
function buildUpFormList(para) {
  var totalForm = "";
  for(var i in para) {
    var singleForm = buildUpOneForm(para[i]);
    totalForm += singleForm;
  }
  return totalForm;
}

/**
 * 组装一条预览表单
 */
function buildUpOneForm(para) {
  var reDom = reviewFormListObj[para.formType];
  // 替换表单类型
  if(para.formType && para.formType.length > 0) {
    reDom = reDom.replace(/\[formType\]/igm, "data-formType="+para.formType);
  }else{
    reDom = reDom.replace(/\[formType\]/igm, "");
  }
  // 替换表单名称
  if(para.infoName && para.infoName.length > 0) {
    reDom = reDom.replace(/\[infoName\]/igm, "<span class='custom-title'>"+para.infoName+"</span>")
  }else{
    reDom = reDom.replace(/\[infoName\]/igm, "")
  }
  // 替换表单是否未必选
  if(para.isCheck) {
    reDom = reDom.replace(/\[isCheck\]/igm, "<span class='custom-require'>*</span>")
  }else{
    reDom = reDom.replace(/\[isCheck\]/igm, "")
  }
  // 替换表单描述
  if(para.infoDesc && para.infoDesc.length > 0) {
    reDom = reDom.replace(/\[infoDesc\]/igm, para.infoDesc)
  }else{
    reDom = reDom.replace(/\[infoDesc\]/igm, "")
  }
  // 根据表单类型，替换表单类型选项
  if(["radio", "checkbox", "select"].includes(para.formType)) {
    var paraOption = "";
    for(var i=0;i < para.infoPara.length;i++) {
      if(para.formType === "radio") {
        paraOption += "<label class='m-rb-10'><input class='custom-input-radio' type='radio' value='"+para.infoPara[i]+"' name='"+para.infoName+"'/><span>"+para.infoPara[i]+"</span></label>";
      }else if(para.formType === "checkbox"){
        paraOption += "<label class='m-rb-10'><input class='custom-input-checkbox' type='checkbox' value='"+para.infoPara[i]+"' name='"+para.infoName+"'/><span>"+para.infoPara[i]+"</span></label>";
      }else if(para.formType === "select"){
        paraOption += "<option value='"+para.infoPara[i]+"'>"+para.infoPara[i]+"</option>"
      }
    }
    reDom = reDom.replace(/\[infoPara\]/igm, paraOption);
  }else{
    reDom = reDom.replace(/\[infoPara\]/igm, "")
  }
  // 如果表单类型是select，需要单独给select添加id
  if(para.formType === "select") {
    reDom = reDom.replace(/\[selectId\]/igm, para.infoName)
  }
  return reDom;
}

var reviewFormListObj = {
  "text": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><input class='custom-input' type='' placeholder='[infoDesc]'></div></div>",
  "number": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><input class='custom-input' type='number' placeholder='[infoDesc]' /></div></div>",
  "textarea": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><textarea class='custom-input custom-input-textarea' placeholder='[infoDesc]'></textarea></div></div>",
  "radio": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><p class='form-small-title'>[infoDesc]</p>[infoPara]</div></div>",
  "checkbox": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><p class='form-small-title'>[infoDesc]</p>[infoPara]</div></div>",
  "select": "<div class='preview-form-item' [formType]><div class='form-box'><p class='form-title'>[infoName][isCheck]</p><p class='form-small-title'>[infoDesc]</p><select name='' id='[selectId]'>[infoPara]</select></div></div>"
}


/**
 * 输出表单JSON
 * @returns {JSON} result
 * @argument
 * [
 *  {
 *    infoName: "表单名称(String)",
 *    infoDesc: "表单描述(String)",
 *    formtype: "表单类型(String)",
 *    infoPara: "表单类型值数组(Array)",
 *    isCheck: "是否为必填(Boolean)"
 *  }
 * ]
 */
function outputFormListJSON() {
  var result = [];
  var stableResultArr = [];
  var customResultArr = [];
  $("#stableFormArea").find(".custom-form-item").each(function() {
    var option = {
      "infoName": "",
      "infoDesc": "",
      "formType": "",
      "infoPara": [],
      "isCheck": false
    };
    var isCheck = $(this).find(".custom-input-checkbox").prop("checked");
    var infoName = $(this).find("#infoName").val();
    var infoDesc = $(this).find("#infoDesc").val();
    var formType = $(this).attr("data-formType");
    var infoPara = [];
    // 获取选项列表
    var optionListDom = $(this).find(".custom-form-sub");
    if(optionListDom.length > 0) {
      optionListDom.find(".custom-form-sub-item").each(function() {
        var paraValue = $(this).find(".custom-form-sub-input").val();
        if(paraValue.length > 0) {
          infoPara.push(paraValue)
        }
      })
    }
    var option = {
      infoName: infoName,
      infoDesc: infoDesc,
      formType: formType,
      infoPara: infoPara,
      isCheck: isCheck
    }
    stableResultArr.push(option)
  })
  $("#customFormArea").find(".custom-form-item").each(function() {
    var isCheck = $(this).find(".custom-input-checkbox").prop("checked");
    var infoName = $(this).find("#infoName").val();
    var infoDesc = $(this).find("#infoDesc").val();
    var formType = $(this).attr("data-formType");
    var infoPara = [];
    // 获取选项列表
    var optionListDom = $(this).find(".custom-form-sub");
    if(optionListDom.length > 0) {
      optionListDom.find(".custom-form-sub-item").each(function() {
        var paraValue = $(this).find(".custom-form-sub-input").val();
        if(paraValue.length > 0) {
          infoPara.push(paraValue)
        }
      })
    }
    var option = {
      infoName: infoName,
      infoDesc: infoDesc,
      formType: formType,
      infoPara: infoPara,
      isCheck: isCheck
    }
    customResultArr.push(option)
  });
  result = stableResultArr.concat(customResultArr);
  return result;
}
