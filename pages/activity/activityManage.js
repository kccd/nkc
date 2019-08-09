$(document).ready(function() {
    var html = "<html><head><meta charset='utf-8' /></head><body>" + document.getElementById("tabExc").outerHTML + "</body></html>";
  // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
  var blob = new Blob([html], { type: "application/vnd.ms-excel" });
  var a = document.getElementById("outExc");
  // 利用URL.createObjectURL()方法为a元素生成blob URL
  a.href = URL.createObjectURL(blob);
  // 设置文件名
  a.download = "活动报名表.xls";
})
