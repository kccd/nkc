/*
  @author Kris 2019/2/20
*/

var testTh;
if(NKC.modules.MoveThread) {
  testTh = new NKC.modules.MoveThread();
}
function testThOpen() {
  var selectedForumsId = [], selectedCategoriesId = [];
  $(".chooseForum").each(function() {
    var fid = $(this).attr("fid");
    if(fid && fid !== "undefined") selectedForumsId.push(fid);
  });
  $(".chooseCate").each(function() {
    var cid = $(this).attr("cid");
    if(cid && cid !== "undefined") selectedCategoriesId.push(cid);
  });
  testTh.open(function(data) {
    var shuchuDemo = "";
    var forumsArr = data.forums;
    for(var i=0;i < forumsArr.length;i++) {
      shuchuDemo += '<div class="move-thread-forum-name" style="background-color:'+forumsArr[i].color+' "><span class="chooseForum" fid="'+forumsArr[i].fid+'">'+forumsArr[i].fName+' <span class="chooseCate" cid="'+forumsArr[i].cid+'"> '+forumsArr[i].cName+'</span></span></div>';
    }
    $("#newPanelForum").html(shuchuDemo);
    testTh.close();
  }, {
    "hideMoveType":true,
    selectedForumsId: selectedForumsId,
    selectedCategoriesId: selectedCategoriesId,
    forumCountLimit: 1
  });
}

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

$(document).ready(function() {
  var data = document.getElementById('data');
  if(data) {
    data = JSON.parse(data.innerHTML);
    var product = data.product;
    // 拓展商品属性列表
    var params = product.params;
    if(params.length > 0) {
      for(var i in params) {
        var paramDom = '<tr><td style="width:5%"><a class="btn btn-danger btn-sm padding-0 margin-right-10" onclick="delParamTable(this)">删除</a></td><td style="width:10%"><input type="text" class="pname pnameCla" data-role="tagsinput" value="'+params[i].name+'"></td><td><input type="text" class="pvalue" data-role="tagsinput" style="width:100%" value="'+params[i].values+'"></td>><td style="width:5%"><a class="btn btn-info btn-sm padding-0 margin-right-10" onclick="saveNewParam(this)">保存</a></td></tr>';
        $("#paramsTable").find("tbody").append(paramDom)
        $(".pvalue").tagsinput({
          maxChars: 8, // 单个标记最大字符数 
          maxTags: 20, // 最大标签数
        })
      }
    }
    // 拓展商品详细规格
    var productParams = product.productParams;
    if(params.length > 0) {
      var trDom = "";
      var trDomSingle = "";
      for(var a in productParams) {
        if(productParams[a].type == "common"){
          var checkDom;
          if(productParams[a].useDiscount) {
            checkDom = '<input type="checkbox" class="usedis" checked>';
          }else{
            checkDom = '<input type="checkbox" class="usedis">'
          }
          if(!productParams[a].isEnable) {
            trDom += '<tr style="background-color:#ddd"><td contenteditable="false" sid="'+productParams[a].index+'" class="paraid">'+productParams[a].name+'</td><td style="width:15%"><button class="ban" onclick="banParam(this)" style="display:none">禁用</button><button class="enable" onclick="enableParam(this)">启用</button><span class="text-danger bantext" style="font-size:10px;margin-left:5px">禁用中</span></td><td><input type="text" class="oprice" style="width:100%;background-color:#ddd" value="'+numToFloatTwo(productParams[a].originPrice)+'" readonly></td><td><input type="text" class="count" style="width:100%;background-color:#ddd" value="'+productParams[a].stocksSurplus+'" readonly></td><td contenteditable="false">'+checkDom+'</td><td><input type="text" class="dprice" style="width:100%;background-color:#ddd" value="'+numToFloatTwo(productParams[a].price)+'" readonly></td></tr>';
          }else{
            trDom += '<tr><td contenteditable="false" sid="'+productParams[a].index+'" class="paraid">'+productParams[a].name+'</td><td style="width:15%"><button class="ban" onclick="banParam(this)">禁用</button><button class="enable" onclick="enableParam(this)" style="display:none">启用</button><span class="text-danger bantext" style="font-size:10px;margin-left:5px;display:none">禁用中</span></td><td><input type="text" class="oprice" style="width:100%" value="'+numToFloatTwo(productParams[a].originPrice)+'"></td><td><input type="text" class="count" style="width:100%" value="'+productParams[a].stocksSurplus+'"></td><td contenteditable="false">'+checkDom+'</td><td><input type="text" class="dprice" style="width:100%" value="'+numToFloatTwo(productParams[a].price)+'"></td></tr>';
          }
        }else{
          var checkDom;
          if(productParams[a].useDiscount) {
            checkDom = '<input type="checkbox" class="singleUseDiscount" checked>';
          }else{
            checkDom = '<input type="checkbox" class="singleUseDiscount">'
          }
          trDomSingle += '<tr><td><input type="text" class="singleName" value="'+productParams[a].name+'"></td><td><input type="text" class="singleOriginPrice" value="'+numToFloatTwo(productParams[a].originPrice)+'"></td><td><input type="text" class="singleCount" value="'+productParams[a].stocksSurplus+'"></td><td>'+checkDom+'</td><td><input type="text" class="singlePrice" value="'+numToFloatTwo(productParams[a].price)+'"></td><td><button onclick="delSingleParam(this)" class="btn btn-danger btn-sm padding-0 margin-right-10">删除</button></td></tr>';
        }
      }
      $("#arrayTable").find("tbody").html(trDom)
      $("#singleParams").find("tbody").html(trDomSingle)
    }
  }
  $("#test").tagsinput({
    maxChars: 8, // 单个标记最大字符数 
    maxTags: 20, // 最大标签数
    trimValue: true, // 默认删除编辑周围的空格
    // typeahead: {
    //   source: ['Amsterdam', 'Washington', 'Sydney', 'Beijing', 'Cairo']
    // }
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
  // $('input[type=radio][name=useparams]').change(function() {
  //   if(this.value == "yes") {
  //     $("#nouseParamsDom").css("display", "none");
  //     $("#useParamsDom").css("display", "");
  //   }
  //   if(this.value == "no") {
  //     $("#nouseParamsDom").css("display", "");
  //     $("#useParamsDom").css("display", "none");
  //   }
  // })
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
  $("#vipDiscount").change(function() {
    if($("#vipDiscount").prop("checked")) {
      $("#vipDisDom").css("display", "");
    }else{
      $("#vipDisDom").css("display", "none");
    }
  })
  // $('input[type=radio][name=vipDiscount]').change(function() {
  //   if(this.value == "yes") {
  //     $("#vipDisDom").css("display", "");
  //   }
  //   if(this.value == "no") {
  //     $("#vipDisDom").css("display", "none");
  //   }
  // })
  $("#isPurchaseLimit").change(function() {
    if($("#isPurchaseLimit").prop("checked")) {
      $("#purchaseLimitDom").css("display", "");
    }else{
      $("#purchaseLimitDom").css("display", "none");
    }
  })  
  // $('input[type=radio][name=isPurchaseLimit]').change(function() {
  //   if(this.value == "yes") {
  //     $("#purchaseLimitDom").css("display", "");
  //   }
  //   if(this.value == "no") {
  //     $("#purchaseLimitDom").css("display", "none");
  //   }
  // })
  $("#isUploadCert").change(function() {
    if($("#isUploadCert").prop("checked")) {
      $("#uploadCertDom").css("display", "");
    }else{
      $("#uploadCertDom").css("display", "none");
    }
  })
  // $('input[type=radio][name=isUploadCert]').change(function() {
  //   if(this.value == "yes") {
  //     $("#uploadCertDom").css("display", "");
  //   }
  //   if(this.value == "no") {
  //     $("#uploadCertDom").css("display", "none");
  //   }
  // })
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
  var attention = $(".attention").val();
  if(attention.length > 200) {
    throw("关键词不能超过200字");
  }
  productDescription = productDescription.trim();
  if(!productDescription) throw("请输入商品描述");
  var productOriginalPrice = $("#originalPrice").val(); // 商品原始价格
  // var useRebate = geid("useRebate").checked; // 是否使用折扣
  var productFinalPrice = $("#afterRebatePrice").text(); // 商品折后价格
  var stockTotalCount = $("#stockQuantity").val(); // 商品库存数量
  var stockCostMethod = $("input[name='stockCostMethod']:checked").val(); // 商品减库存方式

  // 是否使用会员折扣价
  var vipDiscount = $("#vipDiscount").prop("checked");
  var vipDisGroup = [];
  $(".viptr").each(function() {
    var vipLevel = Number($(this).find(".viplevel").attr("vid"));
    var vipNum = Number($(this).find(".vipnum").val());
    if(!vipNum || isNaN(vipNum) || vipNum > 100) {
      vipNum = 100;
    }
    var vipobj = {
      vipLevel: vipLevel,
      vipNum: vipNum
    }
    vipDisGroup.push(vipobj);
  })
  // 获取商品显示设置
  var priceShowToVisit = $("#priceShowToVisit").prop("checked");
  var priceShowAfterStop = $("#priceShowAfterStop").prop("checked");
  var productSettings = {
    priceShowToVisit: priceShowToVisit,
    priceShowAfterStop: priceShowAfterStop,
  }
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
  var productDetails = ue.getContent();
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
  var singleParams = getSingleParams();
  // 获取物流价格
  var freightTemplates = [];
  var isFreePost = true; 
  var freightPrice = {
    firstFreightPrice: null,
    addFreightPrice: null
  }; 
  var freightMethod = $("input[name='freightMethod']:checked").val();
  if(freightMethod !== "freePost") {
    isFreePost = false;
    $("#templateTable").find("tbody tr").each(function() {
      if($(this).find(".tempCheck").prop("checked")) {
        var option = {
          name: $(this).find(".tempName").text(),
          firstPrice: Number($(this).find(".firstFreightPrice").val())*100,
          addPrice: Number($(this).find(".addFreightPrice").val())*100
        };
        freightTemplates.push(option)
      }
    });
    if(freightTemplates.length === 0) {
      throw("不免邮费时请至少选择一个运费模板");
    }
    freightPrice.firstFreightPrice = freightTemplates[0].firstPrice;
    freightPrice.addFreightPrice = freightTemplates[0].addPrice;;
  }

  var mainForumsId = []
  var shopForum = getShopForum();
  if(!shopForum){
    throw("商品分类为必选，请务必选一个");
  }
  $("#newPanelForum").find(".chooseForum").each(function() {
    var fid = $(this).attr("fid");
    if(fid && fid !== "undefined") {
      mainForumsId.push(fid)
    }
  })
  // mainForumsId.push(shopForum);
  // var mergeForumId = getResultHaveForumId();
  // if(mergeForumId){
  //   mainForumsId.push(mergeForumId)
  // }
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
    freightTemplates: freightTemplates,
    productStatus: productStatus,
    shelfTime: shelfTime,
    params: params,
    mainForumsId: mainForumsId,
    productParams: productParams,
    singleParams: singleParams,
    attention: attention,
    purchaseLimitCount:purchaseLimitCount,
    vipDiscount:vipDiscount,
    vipDisGroup: vipDisGroup,
    productSettings: productSettings
  }
  return post;
}

/**
 * 商品上架
 */
function productToShelf(uid) {
  $("#saveProduct").attr("disabled",true);
  try{
    var productInfo = submitToShelf();
  }catch(err) {
    $("#saveProduct").removeAttr("disabled");
    return screenTopWarning(err);
  }
  nkcAPI('/shop/manage/'+uid+'/shelf', "POST" ,{post:productInfo})
  .then(function(data) {
    screenTopAlert("上架成功");
    var targetUrl = '/shop/manage/' + uid + '/goodslist';
    // window.location.href = targetUrl;
    openToNewLocation(targetUrl);
  })
  .catch(function(data){
    screenTopWarning(data.error || data);
    $("#saveProduct").removeAttr("disabled");
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
  var q = 20;
  if(!IsPC()) q = 8;
  var type = "picture";
  var imageArray = [];

  nkcAPI('/me/media?quota='+q+'&skip='+skip+'&type='+type, 'get',{})
  .then(function(data) {
    for(var i in data.resources){
      var imgDom = "<div class='col-sm-3 col-xs-6' style='margin-bottom:20px;cursor: pointer;' onclick='insertImageToProduct("+data.resources[i].rid+")'><img class='img-thumbnail' style='width:100%;height:100px' src='/r/"+data.resources[i].rid+"'></div>";
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
 * 新增一条自定义属性
 */
function addNewParam() {
  if($("#paramsTable tbody tr").length == 5) {
    return screenTopAlert("属性种类最大数量为5")
  }
  var newParamDom = '<tr><td style="width:5%"><a class="btn btn-danger btn-sm padding-0 margin-right-10" onclick="delParamTable(this)">删除</a></td><td style="width:10%"><input type="text" class="pname pnameCla" data-role="tagsinput"></td><td><input type="text" class="pvalue" data-role="tagsinput" style="width:100%"></td><td style="width:5%"><a class="btn btn-info btn-sm padding-0 margin-right-10" onclick="saveNewParam(this)">保存</a></td></tr>';
  $("#paramsTable").find("tbody").append(newParamDom)
  $(".pvalue").tagsinput({
    maxChars: 8, // 单个标记最大字符数 
    maxTags: 20, // 最大标签数
  })
}

/**
 * 新增一条独立规格
 */
function addSingleParam() {
  var singleParam = '<tr><td><input type="text" class="singleName"></td><td><input type="text" class="singleOriginPrice"></td><td><input type="text" class="singleCount"></td><td><input type="checkbox" class="singleUseDiscount"></td><td><input type="text" class="singlePrice"></td><td><button onclick="delSingleParam(this)" class="btn btn-danger btn-sm padding-0 margin-right-10">删除</button></td></tr>';
  $("#singleParams").find("tbody").append(singleParam);
}

/**
 * 删除当前的独立规格
 */
function delSingleParam(para) {
  $(para).parents("tr").remove();
}

/**
 * 获取独立规格全部条目
 */
function getSingleParams() {
  var singleParams = [];
  // var isUseParams = $("#useparams").prop("checked");
  var isUseParams =  $("input[type=radio][name='useparams']:checked").val();
  if(isUseParams == "yes") {
    $("#singleParams tbody tr").each(function(index, ele) {
      var obj = {};
      var singleName = $(ele).find(".singleName").val();
      if(!singleName) throw("独立规格名称不能为空");
      var singleOriginPrice = Number($(ele).find(".singleOriginPrice").val());
      if(!singleOriginPrice || isNaN(singleOriginPrice)) throw("请输入正确的独立规格价格");
      var singleCount = Number($(ele).find(".singleCount").val());
      if(!singleCount || isNaN(singleCount)) singleCount = 0;
      var singlePrice = Number($(ele).find(".singlePrice").val());
      if(!singlePrice || isNaN(singlePrice)) throw("独立规格优惠价格有误")
      if(singlePrice > singleOriginPrice) throw("独立规格中优惠价格不得大于原价格");
      var singleUseDiscount = $(ele).find(".singleUseDiscount").prop("checked");
      obj.name = singleName;
      obj.originPrice = singleOriginPrice*100;
      obj.stocksSurplus = singleCount;
      obj.stocksTotal = singleCount;
      obj.price = singlePrice*100;
      obj.useDiscount = singleUseDiscount;
      singleParams.push(obj)
    })
    if(singleParams.length == 0){
      singleParams = []
    }
  }else{
    singleParams = [];
  }
  return singleParams;
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
  var sureDel = confirm("确定要删除当前属性吗？");
  if(sureDel) {
    $(para).parents("tr").remove();
    mulArrTurnTable();
  }
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
      obj.name = $(ele).find(".pname").val();
      var valueStr = $(ele).find(".pvalue").val();
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
 * 取出商品属性组
 */
function getParaGroup() {
  var paraArr = [];
  $(".pname").each(function() {
    paraArr.push($(this).val())
  });
  $("#paraGroup").text(paraArr)
}

/**
 * 将多维数组生成表格
 */
function mulArrTurnTable() {
  var rArr = tableTurnMulArray();
  var result = mulArrExchangeArr(rArr);
  var strs = mulArrExchangeStr(rArr);
  var trDom = "";
  var hisDom = $("#arrayTable").find("tbody");
  if(rArr.length !== 0) {
    for(var i=0;i < result.length;i++) {
      var useHis = false;
      var hisPriceO;
      var hisCount;
      var hisUsedis;
      var hisPriceD;
      var hisBan;
      hisDom.find("tr").each(function() {
        if(result[i] == $(this).find(".paraid").text()) {
          hisPriceO = $(this).find(".oprice").val();
          hisCount = $(this).find(".count").val();
          hisUsedis = $(this).find(".usedis").prop("checked");
          hisPriceD = $(this).find(".dprice").val();
          hisBan = $(this).find(".ban").css("display");
          useHis = true;
        }
      })
      if(!useHis) {
        trDom += '<tr><td contenteditable="false" sid="'+strs[i]+'" class="paraid">'+result[i]+'</td><td style="width:15%"><button class="ban" onclick="banParam(this)">禁用</button><button class="enable" onclick="enableParam(this)" style="display:none">启用</button><span class="text-danger bantext" style="font-size:10px;margin-left:5px;display:none">禁用中</span></td><td><input type="text" class="oprice" style="width:100%"></td><td><input type="text" class="count" style="width:100%"></td><td contenteditable="false"><input type="checkbox" class="usedis"></td><td><input type="text" class="dprice" style="width:100%"></td></tr>';
      }else{
        var checkDom;
        if(hisUsedis) {
          checkDom = '<input type="checkbox" class="usedis" checked>';
        }else{
          checkDom = '<input type="checkbox" class="usedis">'
        }
        if(hisBan == "none") {
          trDom += '<tr style="background-color:#ddd"><td contenteditable="false" sid="'+strs[i]+'" class="paraid">'+result[i]+'</td><td style="width:15%"><button class="ban" onclick="banParam(this)" style="display:none">禁用</button><button class="enable" onclick="enableParam(this)">启用</button><span class="text-danger bantext" style="font-size:10px;margin-left:5px;">禁用中</span></td><td><input type="text" class="oprice" style="width:100%;background-color:#ddd" value="'+hisPriceO+'" readonly></td><td><input type="text" class="count" style="width:100%;background-color:#ddd" value="'+hisCount+'" readonly></td><td contenteditable="false">'+checkDom+'</td><td><input type="text" class="dprice" style="width:100%;background-color:#ddd" value="'+hisPriceD+'" readonly></td></tr>';
        }else{
          trDom += '<tr><td contenteditable="false" sid="'+strs[i]+'" class="paraid">'+result[i]+'</td><td style="width:15%"><button class="ban" onclick="banParam(this)">禁用</button><button class="enable" onclick="enableParam(this)" style="display:none">启用</button><span class="text-danger bantext" style="font-size:10px;margin-left:5px;display:none">禁用中</span></td><td><input type="text" class="oprice" style="width:100%" value="'+hisPriceO+'"></td><td><input type="text" class="count" style="width:100%" value="'+hisCount+'"></td><td contenteditable="false">'+checkDom+'</td><td><input type="text" class="dprice" style="width:100%" value="'+hisPriceD+'"></td></tr>';
        }
      }
    }
  }
  $("#arrayTable").find("tbody").html(trDom);
  getParaGroup();
}

/**
 * 禁用当前规格
 */
function banParam(para) {
  $(para).parents("tr").css("background-color","#ddd");
  $(para).parents("tr").find(".oprice").attr("readonly","true");
  $(para).parents("tr").find(".oprice").css("background-color","#ddd");
  $(para).parents("tr").find(".count").attr("readonly","true");
  $(para).parents("tr").find(".count").css("background-color","#ddd");
  $(para).parents("tr").find(".dprice").attr("readonly","true");
  $(para).parents("tr").find(".dprice").css("background-color","#ddd");
  $(para).parents("tr").find(".ban").css("display", "none");
  $(para).parents("tr").find(".enable").css("display", "");
  $(para).parents("tr").find(".bantext").css("display", "");
}

/**
 * 启用当前规格
 */
function enableParam(para) {
  $(para).parents("tr").css("background-color", "");
  $(para).parents("tr").find(".oprice").removeAttr("readonly");
  $(para).parents("tr").find(".oprice").css("background-color","");
  $(para).parents("tr").find(".count").removeAttr("readonly");
  $(para).parents("tr").find(".count").css("background-color","");
  $(para).parents("tr").find(".dprice").removeAttr("readonly");
  $(para).parents("tr").find(".dprice").css("background-color","");
  $(para).parents("tr").find(".ban").css("display", "");
  $(para).parents("tr").find(".enable").css("display", "none");
  $(para).parents("tr").find(".bantext").css("display", "none");
}


/**
 * 获取商品价格、库存、优惠价格
 */
function obtainProductPrice() {
  var name = "默认"; // 规格名称
  var isEnable = true; // 禁用按钮状态
  var params; // 规格信息
  var productParams = []; // 具体规格组合
  var originalPrice; // 商品原价
  var paraCount = 0;
  // 是否使用自定义规格
  var isUseParams = $("#useparams").prop("checked");
  if(isUseParams) {
    // 如果使用自定义多规格
    $("#arrayTable").find("tbody tr").each(function(index, ele) {
      isEnable = true;
      var index = $(ele).find(".paraid").attr("sid");
      var name = $(ele).find(".paraid").text();
      var banStatus = $(ele).find(".ban").css("display");
      // var price = $(ele).find(".oprice").text();
      var price = $(ele).find(".oprice").val();
      if((!price || price == "") && banStatus !== "none") throw("未禁用的规格必须输入价格");
      var stocksTotal = $(ele).find(".count").val();
      // var stocksTotal = $(ele).find(".count").text();
      var useDiscount = $(ele).find(".usedis").prop("checked");
      // var dprice = $(ele).find(".dprice").text();
      var dprice = $(ele).find(".dprice").val();
      if(isNaN(Number(price))){
        throw("价格不可以输入除数字以外的字符")
      }
      if(banStatus == "none") {
        isEnable = false;
        paraCount ++;
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
        name: name,
        isEnable: isEnable,
        originPrice: price,
        stocksTotal: stocksTotal,
        useDiscount: useDiscount,
        price: dprice
      }
      productParams.push(para);
    })
    if(productParams.length == 0) throw("多规格不可为空");
    if(productParams.length == paraCount) throw("至少启用一个规格")
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
      name: name,
      isEnable: isEnable,
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

/**
 * 
 */
function editProductShelf(uid, productId) {
  $("#resaveBtn").attr("disabled", true)
  var stockCostMethod = $("input[name='stockCostMethod']:checked").val(); // 商品减库存方式
  // 是否使用限购
  var isPurchaseLimit = $("#isPurchaseLimit").prop("checked");
  var purchaseLimitCount;
  if(isPurchaseLimit) {
    purchaseLimitCount = $("#purchaseLimitCount").val();
    purchaseLimitCount = Number(purchaseLimitCount);
    if(!purchaseLimitCount || isNaN(purchaseLimitCount) || purchaseLimitCount < 0){
      return screenTopWarning("限购数量应该是正整数且不大于商品的库存数量");
      $("#resaveBtn").removeAttr("disabled");
    }
  }else{
    purchaseLimitCount = -1;
  }
  // 是否使用会员折扣价
  var vipDiscount = $("#vipDiscount").prop("checked");
  var vipDisGroup = [];
  $(".viptr").each(function() {
    var vipLevel = Number($(this).find(".viplevel").attr("vid"));
    var vipNum = Number($(this).find(".vipnum").val());
    if(!vipNum || isNaN(vipNum) || vipNum > 100) {
      vipNum = 100;
    }
    var vipobj = {
      vipLevel: vipLevel,
      vipNum: vipNum
    }
    vipDisGroup.push(vipobj);
  })
  // 获取商品显示设置
  var priceShowToVisit = $("#priceShowToVisit").prop("checked");
  var priceShowAfterStop = $("#priceShowAfterStop").prop("checked");
  var productSettings = {
    priceShowToVisit: priceShowToVisit,
    priceShowAfterStop: priceShowAfterStop,
  }
  // 是否需要上传购买凭证
  var isUploadCert = $("#isUploadCert").prop("checked");
  var uploadCertDescription;
  var uploadCert = false;
  if(isUploadCert){
    uploadCert = true;
    uploadCertDescription = $("#uploadCertDescription").val();
  }
  // 获取物流价格
  var freightTemplates = [];
  var isFreePost = true; 
  var freightPrice = {
    firstFreightPrice: null,
    addFreightPrice: null
  }; 
  var freightMethod = $("input[name='freightMethod']:checked").val();
  if(freightMethod !== "freePost") {
    isFreePost = false;
    $("#templateTable").find("tbody tr").each(function() {
      if($(this).find(".tempCheck").prop("checked")) {
        var option = {
          name: $(this).find(".tempName").text(),
          firstPrice: Number($(this).find(".firstFreightPrice").val())*100,
          addPrice: Number($(this).find(".addFreightPrice").val())*100
        };
        freightTemplates.push(option)
      }
    });
    if(freightTemplates.length === 0) {
      throw("不免邮费时请至少选择一个运费模板");
    }
    freightPrice.firstFreightPrice = freightTemplates[0].firstPrice;
    freightPrice.addFreightPrice = freightTemplates[0].addPrice;;
  }
  // 获取全部商品图的id，存入一个数组
  var imgIntroductions = [];
  $("#productImages").find('img.picShow').each(function(){
    imgIntroductions.push($(this).attr("imageId"));
  })
  if(imgIntroductions.length == 0){
    return screenTopWarning("至少上传一张商品图");
    $("#resaveBtn").removeAttr("disabled");
  }
  var imgMaster = imgIntroductions[0];
  var params = tableTurnParams();
  var productParams = obtainProductPrice();
  var singleParams = getSingleParams();
  // 组装修改数据
  var post = {
    stockCostMethod: stockCostMethod,
    purchaseLimitCount:purchaseLimitCount,
    uploadCert: uploadCert,
    uploadCertDescription: uploadCertDescription,
    isFreePost: isFreePost,
    freightPrice: freightPrice,
    freightTemplates: freightTemplates,
    productId:productId,
    params: params,
    productParams: productParams,
    singleParams: singleParams,
    vipDiscount:vipDiscount,
    vipDisGroup: vipDisGroup,
    productSettings: productSettings,
    imgIntroductions: imgIntroductions,
    imgMaster: imgMaster,
  }
  nkcAPI('/shop/manage/'+uid+'/goodslist/editProduct', "PATCH", post)
  .then(function(data) {
    screenTopAlert("修改成功");
    // window.location.href = "/shop/manage/"+uid+"/goodslist";
    openToNewLocation("/shop/manage/"+uid+"/goodslist");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
    $("#resaveBtn").removeAttr("disabled");
  })
}

/**
 * 附件模块的隐藏与展开
 */
function appAttachHideOrShow() {
  loadMediaRe();
  var attactStatus = $("#attach").css("display");
  if(attactStatus === "block") {
    $("#showOrHideAttach").text("插入图片、媒体、文件")
    $("#attach").css("display", "none")
  }else{
    $("#showOrHideAttach").text("收起附件管理器")
    $("#attach").css("display", "block")
  }
}