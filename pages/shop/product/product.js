/**
 * 选择商品规格
 */
function choiceProductParams(para) {
  // 先判断是否含有class
  var isActive = $(para).hasClass("activeIndex");
  if(isActive){
    return; 
  }else{
    // 先使用消除其他class
    $(".activeIndex").removeClass("activeIndex");
    // 再给自己添加class
    $(para).addClass("activeIndex");
  }
}

/**
 * 获取该规格商品信息
 */
function getParamsInfo(index) {
  
}
