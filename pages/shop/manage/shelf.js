/* 
  @author Kris 2019/2/20
*/

$(function () { $("[data-toggle='popover']").popover(); });

$(document).ready(function() {

})

// 提交上架
function submitToShelf() {
  var productName = $("#productName").val();
  var productDescription = $("#productDescription").val();
  console.log(productName)
}

/*
  自动计算商品最终价格(保留一位小数)
  @param para {dom} 传入的dom
  @param maxlength {number} 最大限制长度
  @param outDomId {string} 统计字数输出dom的id
  @return void
*/
function autoCalcuPrice() {
  var useRebate = geid("useRebate").checked; // 是否使用折扣
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
  var finalPrice = (originalPrice*rebate)/100;
  console.log(finalPrice)
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