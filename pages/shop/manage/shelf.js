/*
  @author Kris 2019/2/20
*/
function initTime() {
	if(!$('.time').length){
		return;
  }
	$('.time').datetimepicker({
		language:  'zh-CN',
		format: 'yyyy-mm-dd hh:ii',
		autoclose: true,
		todayHighlight: 1,
		startView: 2,
		minView: 0,
		forceParse: 0
	});
}
initTime();

var productImageDomId;
var skip = 0;
$(function () { $("[data-toggle='popover']").popover(); });

function ceshi() {
  console.log($("#test").val())
}

$(document).ready(function() {
  $("#test").tagsinput({
    // maxChars: 3, // 单个标记最大字符数
    // maxTags: 3, // 标记的最大个数
    // trimValue: true, // 默认删除编辑周围的空格
    // typeahead: {
    //   source: ['Amsterdam', 'Washington', 'Sydney', 'Beijing', 'Cairo']
    // }
  })
  //编辑器缩放
  $(".w-e-text-container").resizable({
    containment: '#body',
    minHeight: 100,
    minWidth: 100,
    maxWidth: 1400
  });
  // 编辑器上传粘贴图片
  $("#ReplyContent").on("paste", function(){
    function test(){
      $("#text-elem img").each(function(){
        if(!$(this).attr("srcs")){
          return true
        }
        var newSrc = $(this).attr("srcs")
        var ownImage = "<img src='" + newSrc + "' style='max-width: 100%'>";
        var isOwnImg = newSrc.indexOf("kechuang");
        if(isOwnImg !== -1){
          $(this).replaceWith(ownImage)
          return true;
        }
        var sysimg = new RegExp("file:").test(newSrc)
        if(sysimg == true){
          var elemImg = "<img src='/resources/site_specific/picdefault.png'>"
          $(this).replaceWith(elemImg)
          return true
        }
        if(newSrc.length > 10){
          var data = {
            loadsrc : newSrc
          }
          var newimgstr = $(this)
          
          nkcAPI("/download", "POST", data)
          .then( function(data){
            newimgstr.attr("src","")
            newimgstr.attr("srcs","")
            var newImg = "<img src='" + "/r/" + data.r.rid + "' style='max-width: 100%'>"
            newimgstr.replaceWith(newImg)
            if(list)list.refresh()
          })
          .catch( function(err){
            newimgstr.attr("src","")
            newimgstr.attr("srcs","")
            newimgstr.replaceWith("<img src='/resources/site_specific/picdefault.png'>")
          })
        }
      })
    }
    setTimeout(function(){test()},5000)
    
  })
  $('input[type=radio][name=shelfMethod]').change(function() {
    if(this.value == 'insale') {
      $("#saleTimeDom").css("display", "none")
    }else if(this.value == 'notonshelf'){
      $("#saleTimeDom").css("display", "none")
    }else if(this.value == 'insaletime'){
      $("#saleTimeDom").css("display", "")
    }
  });
  $('#useparams').change(function() {
    if($("#useparams").prop("checked")){
      $("#nouseParamsDom").css("display", "none");
      $("#useParamsDom").css("display", "");
    }else{
      $("#nouseParamsDom").css("display", "");
      $("#useParamsDom").css("display", "none");
    }
  })
  $('#usedis').change(function() {
    if($("#usedis").prop("checked")){
      $("#disCostDom").css("display", "");
    }else{
      $("#disCostDom").css("display", "none");
    }
  })
  $("#isPurchaseLimit").change(function() {
    if($("#isPurchaseLimit").prop("checked")) {
      $("#purchaseLimitDom").css("display", "");
    }else{
      $("#purchaseLimitDom").css("display", "none");
    }
  })  
  $("#isUploadCert").change(function() {
    if($("#isUploadCert").prop("checked")) {
      $("#uploadCertDom").css("display", "");
    }else{
      $("#uploadCertDom").css("display", "none");
    }
  })
  $("input[type=radio][name=freightMethod]").change(function() {
    if(this.value == 'payPost') {
      $("#freightPriceDom").css("display", "block");
    }else{
      $("#freightPriceDom").css("display", "none")
    }
  })
  $("#productDescription").on("input propertychange" ,function() {
    $("#productDescriptionNum").text($("#productDescription").val().length)
  })
})

/**
 * 获取商品信息
 */
function submitToShelf() {
  var productName = $("#productName").val(); // 商品名称
  productName = productName.trim();
  // if(!productName) throw("请输入商品标题");
  var productDescription = $("#productDescription").val(); //商品描述
  // 获取商品的特殊说明
  var attentions = [];
  $(".attention").each(function() {
    var attStr = $(this).val().trim();
    if(attStr.length > 0){
      attentions.push(attStr)
    }
  })
  productDescription = productDescription.trim();
  if(!productDescription) throw("请输入商品描述");
  var productOriginalPrice = $("#originalPrice").val(); // 商品原始价格
  // var useRebate = geid("useRebate").checked; // 是否使用折扣
  var productFinalPrice = $("#afterRebatePrice").text(); // 商品折后价格
  var stockTotalCount = $("#stockQuantity").val(); // 商品库存数量
  var stockCostMethod = $("input[name='stockCostMethod']:checked").val(); // 商品减库存方式
  // 是否使用限购
  var isPurchaseLimit = $("#isPurchaseLimit").prop("checked");
  var purchaseLimitCount;
  if(isPurchaseLimit) {
    purchaseLimitCount = $("#purchaseLimitCount").val();
    purchaseLimitCount = Number(purchaseLimitCount);
    if(!purchaseLimitCount || isNaN(purchaseLimitCount) || purchaseLimitCount < 0){
      throw("限购数量应该是正整数且不大于商品的库存数量");
    }
  }else{
    purchaseLimitCount = -1;
  }
  // 是否需要上传购买凭证
  var isUploadCert = $("#isUploadCert").prop("checked");
  var uploadCertDescription;
  var uploadCert = false;
  if(isUploadCert){
    uploadCert = true;
    uploadCertDescription = $("#uploadCertDescription").val();
  }
  // 获取需要支付的KCB和RMB各是多少
  var payUseKcb = 0; // 需要支付的KCB
  var payUseRmb = 0; // 需要支付的RMB
  // 获取全部商品图的id，存入一个数组
  var imgIntroductions = [];
  $("#productImages").find('img.picShow').each(function(){
    imgIntroductions.push($(this).attr("imageId"));
  })
  if(imgIntroductions.length == 0){
    throw("至少上传一张商品图")
  }
  var imgMaster = imgIntroductions[0];
  // 获取商品详细介绍
  var productDetails = document.getElementById('text-elem').innerHTML;
  productDetails = common.URLifyHTML(productDetails);
  // 产品状态
  var productStatus;
  var shelfTime = "";
  var proSta = $("input[name='shelfMethod']:checked").val();
  if(proSta == "insale") {
    productStatus = "insale";
  }else if(proSta == "notonshelf") { 
    productStatus = "notonshelf"
  }else if(proSta == "insaletime") {
    productStatus = "notonshelf";
    shelfTime = $("#saleTime").val();
  }

  var params = tableTurnParams();
  var productParams = obtainProductPrice();
  // 获取物流价格
  var isFreePost = true; // 是否免邮
  var freightPrice = {
    firstFreightPrice: null,
    addFreightPrice: null
  }; // 运费模板
  var freightMethod = $("input[name='freightMethod']:checked").val();
  var firstFreightPrice = Number($("#firstFreightPrice").val())*100;
  var addFreightPrice = Number($("#addFreightPrice").val())*100;
  if(freightMethod !== "freePost") {
    isFreePost = false;
    if(isNaN(firstFreightPrice) || firstFreightPrice <= 0 || isNaN(addFreightPrice) || addFreightPrice < 0) {
      throw("请正确设置运费模板");
    }
    freightPrice.firstFreightPrice = firstFreightPrice;
    freightPrice.addFreightPrice = addFreightPrice;
  }
  var mainForumsId = []
  var shopForum = getShopForum();
  if(!shopForum){
    throw("商品分类为必选，请务必选一个");
  }
  mainForumsId.push(shopForum);
  var mergeForumId = getResultHaveForumId();
  if(mergeForumId){
    mainForumsId.push(mergeForumId)
  }
  // 组装上传数据
  var post = {
    productName: productName,
    productDescription: productDescription,
    productDetails: productDetails,
    imgIntroductions: imgIntroductions,
    imgMaster: imgMaster,
    uploadCert: uploadCert,
    uploadCertDescription: uploadCertDescription,
    stockCostMethod: stockCostMethod,
    isFreePost: isFreePost,
    freightPrice: freightPrice,
    productStatus: productStatus,
    shelfTime: shelfTime,
    params: params,
    mainForumsId: mainForumsId,
    productParams: productParams,
    attentions: attentions,
    purchaseLimitCount:purchaseLimitCount
  }
  return post;
}

/**
 * 商品上架
 */
function productToShelf(uid) {
  try{
    var productInfo = submitToShelf();
  }catch(err) {
    return screenTopWarning(err);
  }
  nkcAPI('/shop/manage/'+uid+'/shelf', "POST" ,{post:productInfo})
  .then(function(data) {
    screenTopAlert("上架成功");
    var targetUrl = '/shop/manage/' + uid + '/goodslist';
    window.location.href = targetUrl;
  })
  .catch(function(data){
    screenTopWarning(data.error || data);
  })
}

/**
 * 商品放入仓库
 */
function productToHouse() {

}

/*
  自动计算商品最终价格(结果保留一位小数)
  @return void
*/
function autoCalcuPrice() {
  // 是否使用折扣
  var useRebate = geid("useRebate").checked;
  var rebate = 100;
  if(useRebate){
    rebate = parseInt(geid("rebate").value);
    if(!rebate) rebate = 100;
    if(rebate == 0){
      rebate = 1;
    }
    if(rebate > 99){
      rebate = 100;
    }
  }
  // 计算折后价格
  var originalPrice = geid("originalPrice").value;
  if(!parseInt(originalPrice)) originalPrice = 0;
  var finalPrice = (originalPrice*rebate)/100;
  $("#afterRebatePrice").text(finalPrice)
}

/**
 * 打开图片管理器
 */
function openImageManage(id) {
  productImageDomId = id;
  manageImageLoader();
}

/**
 * 图片管理器加载图片
 * 
 */
function manageImageLoader(turn) {
  if(turn == "prev"){
    skip = skip - 1;
  }else if(turn == "next") {
    skip = skip + 1;
  }else if(turn == "turn") {
    skip = skip;
  }
  if(skip <= 0){
    skip = 0;
  }
  var q = 24;
  var type = "picture";
  var imageArray = [];

  nkcAPI('/me/media?quota='+q+'&skip='+skip+'&type='+type, 'get',{})
  .then(function(data) {
    for(var i in data.resources){
      var imgDom = "<div class='col-sm-2' style='margin-bottom:20px;cursor: pointer;' onclick='insertImageToProduct("+data.resources[i].rid+")'><img class='img-thumbnail' style='width:100%;height:100px' src='/r/"+data.resources[i].rid+"'></div>";
      imageArray.push(imgDom);
    }
    skip = parseInt(data.skip);
    $("#currentSkip").text(skip+1);
    $("#maxSkip").text(data.maxSkip);
    $("#imageArrayDom").html(imageArray)
  })
  .catch(function(data) {
    skip = parseInt(data.skip);
  })
}

/**
 * 向上翻页
 */
function prevPageManage() {
  manageImageLoader('prev')
}

/**
 * 向下翻页
 */
function nextPageManage() {
  manageImageLoader('next')
}

/**
 * 点击插入图片
 */
function insertImageToProduct(rid) {
  $("#"+productImageDomId).find(".upload_image_item_border").css("display","none");
  $("#"+productImageDomId).find(".upload_image_card").css("display","block");
  $("#"+productImageDomId).find(".upload_image_card").find("img").attr("src","/r/"+rid);
  $("#"+productImageDomId).find(".upload_image_card").find("img").attr("imageId",rid);
  $("#"+productImageDomId).find(".upload_image_card").find("img").addClass("picShow");
  $('#myModal').modal('hide');
}

/**
 * 删除当前图片
 */
function deleteImageInProduct(id) {
  $("#"+id).find(".upload_image_item_border").css("display","block");
  $("#"+id).find(".upload_image_card").css("display","none");
  $("#"+id).find(".upload_image_card").find("img").removeClass("picShow");
}

/**
 * 收起附件模块
 */
function hideAttachment() {
  $("#attachmentDom").css("display", "none");
  $("#hideButton").css("display", "none");
  $("#showButton").css("display", "block");
}

/**
 * 展开附件模块
 */
function showAttachment() {
  $("#attachmentDom").css("display", "block");
  $("#hideButton").css("display", "block");
  $("#showButton").css("display", "none");
}

/*
  字数统计，并放入显示
  @param para {dom} 传入的dom
  @param maxlength {number} 最大限制长度
  @param outDomId {string} 统计字数输出dom的id
  @return void
*/
// function wordCount(para, maxlength, outDomId) {
//   var countLength;
//   var inputWord = $(para).val();
//   countLength = inputWord.length;
//   if(countLength >= 200){
//     countLength = 200;
//   }
//   $("#"+outDomId).text(countLength);
// }

/**
 * 新增一条自定义属性
 */
function addNewParam() {
  var newParamDom = '<tr><td style="width:20%"><input type="text" class="pname" data-role="tagsinput"></td><td><input type="text" class="pvalue" data-role="tagsinput" style="width:100%"></td><td style="width:10%"><a class="btn btn-danger btn-sm padding-0 margin-right-10" onclick="delParamTable(this)">删除</a><a class="btn btn-info btn-sm padding-0 margin-right-10" onclick="saveNewParam(this)">保存</a></td></tr>';
  $("#paramsTable").find("tbody").append(newParamDom)
  $(".pvalue").tagsinput({
    maxChars: 5, // 单个标记最大字符数 
    maxTags: 5, // 最大标签数
  })
}

/**
 * 获取当前属性条目的全部属性值
 */
// function getParamTags(para) {
//   console.log($(para).parents("tr").find(".pvalue").val())
// }

/**
 * 保存当前自定义规格属性
 */
function saveNewParam(para) {
  var newParaName = $(para).parents("tr").find(".pname").val();
  // var newParaValue = $(para).parents("tr").children(".pvalue").text();
  var newParaValue = $(para).parents("tr").find(".pvalue").val();
  newParaName = newParaName.trim();
  if(!newParaName) return screenTopWarning("请输入规格名称");
  newParaValue = newParaValue.replace(/\s+/g,"");
  if(!newParaValue) return screenTopWarning("请输入规格属性");
  mulArrTurnTable();
}

// /**
//  * 添加自定义规格
//  */
// function addParamTable() {
//   var paraName = $("#paraName").val();
//   var paraValue = $("#paraValue").val();
//   paraName = paraName.trim();
//   if(!paraName) return screenTopWarning("请输入规格名称");
//   paraValue = paraValue.replace(/\s+/g,"");
//   if(!paraValue) return screenTopWarning("请输入规格属性");

//   var trDom = '<tr><td class="pname">'+paraName+'</td><td class="pvalue">'+paraValue+'</td><td><a class="btn btn-default btn-sm padding-0 margin-right-10" onclick="openEditParamTable(this)">修改</a><a class="btn btn-danger btn-sm padding-0 margin-right-10" onclick="delParamTable(this)">删除</a></td></tr>';
//   $("#paramsTable").find("tbody").append(trDom)

//   $("#paraName").val("");
//   $("#paraValue").val("");
//   mulArrTurnTable();
//   $("#addProductParams").modal('hide');
// }

/**
 * 删除自定义规格
 */
function delParamTable(para) {
  $(para).parents("tr").remove();
  mulArrTurnTable();
}

// /**
//  * 修改自定义规格
//  */
// function editParamTable() {
//   // 先获取tr的位置
//   var trIndex = $("#newIndex").val();
//   var newName = $("#newName").val();
//   var newValue = $("#newValue").val();

//   var tdDom = '<td class="pname">'+newName+'</td><td class="pvalue">'+newValue+'</td><td><a class="btn btn-default btn-sm padding-0 margin-right-10" onclick="openEditParamTable(this)">修改</a><a class="btn btn-danger btn-sm padding-0 margin-right-10" onclick="delParamTable(this)">删除</a></td>'

//   $("#paramsTable").find("tbody tr").eq(trIndex).html(tdDom);
//   $("#newName").val("");
//   $("#newValue").val("");
//   mulArrTurnTable();
//   $("#editProductParams").modal("hide");
// }

// /**
//  * 打开自定义规格修改项
//  */
// function openEditParamTable(para) {
//   var oldParaName = $(para).parents("tr").children(".pname").text();
//   var oldParaValue = $(para).parents("tr").children(".pvalue").text();
//   $("#newName").val(oldParaName);
//   $("#newValue").val(oldParaValue);
//   // 获取当前tr的位置
//   var trIndex = $(para).parents("tr").index();
//   $("#newIndex").val(trIndex)
//   $("#editProductParams").modal("show");
// }

/**
 * 生成params
 */
function tableTurnParams() {
  // 是否使用规格信息
  var params = [];
  var isUseParams = $("#useparams").prop("checked");
  if(isUseParams) {
    $("#paramsTable tbody tr").each(function(index, ele) {
      var obj = {};
      obj.name = $(ele).find(".pname").text();
      var valueStr = $(ele).find(".pvalue").text();
      var valueArr = valueStr.split(",");
      obj.values = valueArr;
      params.push(obj)
    })
    if(params.length == 0){
      params = []
    }
  }else{
    params = [];
  }
  return params;
}

/**
 * 生成多维数组
 */
function tableTurnMulArray() {
  var mulArray = [];
  $("#paramsTable tbody tr").each(function(index, ele) {
    var valueStr = $(ele).find(".pvalue").val();
    var valueArr = valueStr.split(",");
    mulArray.push(valueArr);
  })
  return mulArray;
}

/**
 * 多维数组组合排序
 */
// function mulArrayTurnObj() {
//   var rArr = tableTurnMulArray();
//   var result = mulArrExchangeArr(rArr);
// }

/**
 * 多维数组排列组合生成新数组
 */
function mulArrExchangeArr(arr){
  var len = arr.length;
  // 当数组大于等于2个的时候
  if(len == 0) {
    return arr;
  }
  if(len >= 2){
      // 第一个数组的长度
      var len1 = arr[0].length;
      // 第二个数组的长度
      var len2 = arr[1].length;
      // 2个数组产生的组合数
      var lenBoth = len1 * len2;
      //  申明一个新数组
      var items = new Array(lenBoth);
      // 申明新数组的索引
      var index = 0;
      for(var i=0; i<len1; i++){
          for(var j=0; j<len2; j++){
              if(arr[0][i] instanceof Array){
                  items[index] = arr[0][i].concat(arr[1][j]);
              }else{
                  items[index] = [arr[0][i]].concat(arr[1][j]);
              }
              index++;
          }
      }
      var newArr = new Array(len -1);
      for(var i=2;i<arr.length;i++){
          newArr[i-1] = arr[i];
      }
      newArr[0] = items;
      return mulArrExchangeArr(newArr);
  }else{
      return arr[0];
  }
}

/**
 * 多维数组排列组合生成新的字符串
 */
var useStr = false;
var firstChange = true;
function mulArrExchangeStr(arr) {
  var len = arr.length;
  // 当数组大于等于2个的时候
  if(len == 0) {
    return arr;
  }
  if(len >= 2){
      // 第一个数组的长度
      var len1 = arr[0].length;
      // 第二个数组的长度
      var len2 = arr[1].length;
      // 2个数组产生的组合数
      var lenBoth = len1 * len2;
      //  申明一个新数组
      var items = new Array(lenBoth);
      // 申明新数组的索引
      var index = 0;
      if(!useStr){
        for(var i=0; i<len1; i++){
          for(var j=0; j<len2; j++){
            // items[index] = arr[0][i] + arr[1][j];
            items[index] = i + "-" + j;
            index++;
          }
        }
      }else{
        for(var i=0; i<len1; i++){
          for(var j=0; j<len2; j++){
            items[index] = arr[0][i] + "-" +j;
            // items[index] = i + "-" + j;
            index++;
          }
        }
      }
      // 只有第一次递归使用索引+索引
      // 除了第一次全部使用str+索引
      useStr = true;
      firstChange = false;
      var newArr = new Array(len -1);
      for(var i=2;i<arr.length;i++){
          newArr[i-1] = arr[i];
      }
      newArr[0] = items;
      return mulArrExchangeStr(newArr);
  }else{
    if(firstChange){
      var firstArray = [];
      for(var a=0;a<arr[0].length;a++){
        firstArray.push(a)
      }
      useStr = false;
      firstChange = true;
      return firstArray;
    }else{
      useStr = false;
      firstChange = true;
      return arr[0];
    }
  }
}

/**
 * 将多维数组生成表格
 */
function mulArrTurnTable() {
  var rArr = tableTurnMulArray();
  var result = mulArrExchangeArr(rArr);
  var strs = mulArrExchangeStr(rArr);
  var trDom = "";
  if(rArr.length !== 0) {
    for(var i=0;i < result.length;i++) {
      // trDom += '<tr><td contenteditable="false" sid="'+strs[i]+'" class="paraid">'+result[i]+'</td><td class="oprice"></td><td class="count"></td><td contenteditable="false"><input type="checkbox" class="usedis"></td><td class="dprice"></td></tr>';
      trDom += '<tr><td contenteditable="false" sid="'+strs[i]+'" class="paraid">'+result[i]+'</td><td><input type="text" class="oprice" style="width:100%"></td><td><input type="text" class="count" style="width:100%"></td><td contenteditable="false"><input type="checkbox" class="usedis"></td><td><input type="text" class="dprice" style="width:100%"></td></tr>';
    }
  }
  $("#arrayTable").find("tbody").html(trDom)
}

/**
 * 获取商品价格、库存、优惠价格
 */
function obtainProductPrice() {
  var params; // 规格信息
  var productParams = []; // 具体规格组合
  var originalPrice; // 商品原价
  // 是否使用自定义规格
  var isUseParams = $("#useparams").prop("checked");
  if(isUseParams) {
    // 如果使用自定义多规格
    $("#arrayTable").find("tbody tr").each(function(index, ele) {
      var index = $(ele).find(".paraid").attr("sid");
      // var price = $(ele).find(".oprice").text();
      var price = $(ele).find(".oprice").val();
      if(!price || price == "") throw("多规格商品必须输入价格");
      var stocksTotal = $(ele).find(".count").val();
      // var stocksTotal = $(ele).find(".count").text();
      var useDiscount = $(ele).find(".usedis").prop("checked");
      // var dprice = $(ele).find(".dprice").text();
      var dprice = $(ele).find(".dprice").val();
      if(isNaN(Number(price))){
        throw("价格不可以输入除数字以外的字符")
      }
      price = price.trim();
      if(price == "" || isNaN(Number(price)) || Number(price) < 0){
        price = -1
      }else{
        price = Number(price).toFixed(2)*100;
      }

      stocksTotal = stocksTotal.trim();
      if(stocksTotal == "" || isNaN(Number(stocksTotal)) || Number(stocksTotal) < 1){
        stocksTotal = 0;
      }else{
        stocksTotal = Number(stocksTotal).toFixed(0)*1;
      }

      dprice = dprice.trim();
      if(dprice == "" || isNaN(Number(dprice)) || Number(dprice) < 0) {
        dprice = 0;
      }else{
        dprice = Number(dprice).toFixed(2)*100;
      }
      if(dprice > price){
        dprice = price;
      }
      
      var para = {
        index: index,
        originPrice: price,
        stocksTotal: stocksTotal,
        useDiscount: useDiscount,
        price: dprice
      }
      productParams.push(para);
    })
    if(productParams.length == 0) throw("多规格不可为空");
  }else{
    // 如果不使用自定义多规格
    var params = {
      name: "",
      values: []
    };
    originalPrice = $("#originalPrice").val();
    if(!originalPrice) throw("请输入商品价格");
    // 是否适用优惠
    var isDis = $("#usedis").prop("checked");
    var price = $("#afterDisCost").val(); // 最终价格
    if(!price) {
      price = originalPrice
    }
    if(Number(price) > Number(originalPrice)) {
      throw("优惠价不得高于商品原价");
    }
    var stocksTotal = $("#stockQuantity").val();
    if(!stocksTotal) throw("请输入商品数量");
    para = {
      index: "",
      stocksTotal: Number(stocksTotal).toFixed(0)*1,
      originPrice: Number(originalPrice).toFixed(2)*100,
      price: Number(price).toFixed(2)*100,
      useDiscount: isDis
    }
    productParams.push(para);
  }
  return productParams;
}

/**
 * 添加一条署名
 */
function addAttention() {
  var attDom = "<input class='attention form-control' type='text' placeholder='请用不超过15字来完成一个简短说明,不填写则无'>";
  $(".attentionList").append(attDom)
}

/**
 * 选择商品分类
 */
function getShopForum() {
  var shopForum = $("#shopForums").val();
  return shopForum;
}