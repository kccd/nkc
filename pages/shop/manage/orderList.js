$(document).ready(function() {
  var html = "<html><head><meta charset='utf-8' /></head><body>" + document.getElementById("texttable").outerHTML + "</body></html>";
  // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
  var blob = new Blob([html], { type: "application/vnd.ms-excel" });
  var a = document.getElementById("text");
  // 利用URL.createObjectURL()方法为a元素生成blob URL
  a.href = URL.createObjectURL(blob);
  // 设置文件名
  a.download = "订单.xls";
})

/**
 * 订单查询
 */
function orderSearch(uid) {
  // 获取开始与结束时间
  var orderStartTime = $("#orderStartTime").val()
  var orderEndTime = $("#orderEndTime").val()
  if(!orderStartTime || !orderEndTime) return screenTopWarning("订单导出时间不可为空");
  var orderStartStamp = new Date(orderStartTime).getTime();
  var orderEndStamp = new Date(orderEndTime).getTime();
  if(parseInt(orderStartStamp) > parseInt(orderEndStamp)) return screenTopWarning("订单导出开始时间不得晚于结束时间");

  // window.location.href = "/shop/manage/" + uid + "/order/orderListToExcel?orderStartStamp=" + orderStartStamp + "&orderEndStamp=" + orderEndStamp;
  openToNewLocation("/shop/manage/" + uid + "/order/orderListToExcel?orderStartStamp=" + orderStartStamp + "&orderEndStamp=" + orderEndStamp);
}

window.orderSearch = orderSearch;