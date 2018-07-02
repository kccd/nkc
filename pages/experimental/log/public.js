function delLogs(){
  var startTime = $("#startTime").val().trim();
  var endTime = $("#endTime").val().trim();
  var uid = $("#userId").val().trim();
  var ip = $("#ipAdress").val().trim();
  if(startTime === "" ||endTime === ""){
    screenTopWarning("请输入完整的时间区间")
    return
  }
  var st = new Date(startTime)
  var et = new Date(endTime)
  if(st.getTime() > et.getTime()){
    screenTopWarning("结束时间不能早于开始时间")
    return
  }
  var del = confirm("确定删除该条件下的日志？");
  if(del === false){
    return
  }
  var url = '/e/log/public?' + "startTime="+startTime+"&" + "endTime="+endTime+"&" + "uid="+uid+"&" + "ip="+ip;
  var method = "DELETE";
  var alertInfo = "已删除相关条件下的日志";
  nkcAPI(url, method, {})
    .then(function(){
      screenTopAlert(alertInfo);
      setTimeout(function(){
        window.location.reload();
      }, 1000);
    })
    .catch(function(data){
      screenTopWarning(data.error)
    })
}


function searchLogs(){
  var startTime = $("#startTime").val().trim();
  var endTime = $("#endTime").val().trim();
  var uid = $("#userId").val().trim();
  var ip = $("#ipAdress").val().trim();
  if(startTime === "" ||endTime === ""){
    screenTopWarning("请输入完整的时间区间")
    return
  }
  var st = new Date(startTime)
  var et = new Date(endTime)
  if(st.getTime() > et.getTime()){
    screenTopWarning("结束时间不能早于开始时间")
    return
  }
  var url = '/e/log/public?' + "type=searchLog&" + "startTime="+startTime+"&" + "endTime="+endTime+"&" + "uid="+uid+"&" + "ip="+ip;
  window.location.href = url;
}