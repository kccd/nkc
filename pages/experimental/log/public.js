function delLogs(){
  let startTime = $("#startTime").val().trim();
  let endTime = $("#endTime").val().trim();
  let uid = $("#userId").val().trim();
  let ip = $("#ipAdress").val().trim();
  if(startTime === "" ||endTime === ""){
    screenTopWarning("请输入完整的时间区间")
    return
  }
  let st = new Date(startTime)
  let et = new Date(endTime)
  if(st.getTime() > et.getTime()){
    screenTopWarning("结束时间不能早于开始时间")
    return
  }
  let del = confirm("确定删除该条件下的日志？");
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
