/* 
  @author Kris 2019/2/20
*/
var productImageDomId;
var skip = 0;
$(function () { $("[data-toggle='popover']").popover(); });

$(document).ready(function() {
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
  $('input[type=radio][name=paymentMethod]').change(function() {
    if(this.value == 'kar') {
      $("#karMethodDom").css("display", "");
    }else if(this.value == 'rmb'){
      $("#karMethodDom").css("display", "none");
    }else if(this.value == 'kcb'){
      $("#karMethodDom").css("display", "none");
    }
  });

  // manageImageLoader();
})

/**
 * 获取商品信息
 */
function submitToShelf() {
  var productName = $("#productName").val(); // 商品名称
  var productDescription = $("#productDescription").val(); //商品描述
  var productOriginalPrice = $("#originalPrice").val(); // 商品原始价格
  var useRebate = geid("useRebate").checked; // 是否使用折扣
  var productFinalPrice = $("#afterRebatePrice").text(); // 商品折后价格
  var stockTotalCount = $("#stockQuantity").val(); // 商品库存数量
  var stockCostMethod = $("input[name='stockCostMethod']:checked").val(); // 商品减库存方式
  // 获取需要支付的KCB和RMB各是多少
  var payUseKcb = 0; // 需要支付的KCB
  var payUseRmb = 0; // 需要支付的RMB
  var paymentMethod = $("input[name='paymentMethod']:checked").val(); // 商品的支付方式
  if(paymentMethod == "kcb"){
    payUseKcb = productFinalPrice;
    payUseRmb = productFinalPrice - payUseKcb;
  }else if(paymentMethod == "rmb"){
    payUseRmb = productFinalPrice;
    payUseKcb = productFinalPrice - payUseRmb;
  }else if(paymentMethod == "kar"){
    payUseKcb = $("#costKcb").val();
    if(parseInt(payUseKcb) > productFinalPrice){
      return alert("使用混合付款，设置的科创币数额不得超过商品价格")
    }
    payUseRmb = productFinalPrice - payUseKcb;
  }
  // 获取全部商品图的id，存入一个数组
  var imgIntroductions = [];
  $("#productImages").find('img.picShow').each(function(){
    imgIntroductions.push($(this).attr("imageId"));
  })
  if(imgIntroductions.length == 0){
    return alert("至少上传一张商品图")
  }
  var imgMaster = imgIntroductions[0];
  // 获取商品详细介绍
  var productDetails = document.getElementById('text-elem').innerHTML;
  productDetails = common.URLifyHTML(productDetails);

  // 组装上传数据
  var post = {
    productName: productName,
    productDescription: productDescription,
    productDetails: productDetails,
    imgIntroductions: imgIntroductions,
    imgMaster: imgMaster,
    stockTotalCount: Number(stockTotalCount),
    stockSurplusCount: Number(stockTotalCount),
    stockCostMethod: stockCostMethod,
    paymentMethod: paymentMethod,
    productOriginalPrice: Number(productOriginalPrice),
    useRebate: useRebate,
    productFinalPrice: Number(productFinalPrice),
    payUseKcb: Number(payUseKcb),
    payUseRmb: Number(payUseRmb)
  }
  return post;
}

/**
 * 商品上架
 */
function productToShelf(storeId) {
  var productInfo = submitToShelf();
  productInfo.productStatus = "insale";
  nkcAPI('/shop/manage/'+storeId+'/shelf', "POST" ,{post:productInfo})
  .then(function(data) {
    // window.location.href = "/activity/list";
    alert("上架成功")
  })
  .catch(function(data){
    alert("上架失败")
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