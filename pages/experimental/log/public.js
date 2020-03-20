function delLogs(){
  var sTime = $("#startTime").val().trim();
  var eTime = $("#endTime").val().trim();
  var uid = $("#userId").val().trim();
  var ip = $("#ipAdress").val().trim();
  if(sTime === "" ||eTime === ""){
    screenTopWarning("请输入完整的时间区间")
    return
  }
  var st = new Date(sTime)
  var et = new Date(eTime)
  if(st.getTime() > et.getTime()){
    screenTopWarning("结束时间不能早于开始时间")
    return
  }
  var del = confirm("确定删除该条件下的日志？");
  if(del === false){
    return
  }
  var url = '/e/log/public?' + "sTime="+sTime+"&" + "eTime="+eTime+"&" + "uid="+uid+"&" + "ip="+ip;
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


// 获取查询表单数据
function checkFormData() {
  var sTime = $("#startTime").val().trim();
  var eTime = $("#endTime").val().trim();
  var uid = $("#userId").val().trim();
  var ip = $("#ipAdress").val().trim();
  var operationId = $("#operationId").val().trim();
  var st = (new Date(sTime)).getTime();
  var et = (new Date(eTime)).getTime();
  if(st && et && st > et){
    sweetError("结束时间不能早于开始时间");
    return null;
  }
  return {
    sTime: sTime,
    eTime: eTime,
    uid: uid,
    operationId: operationId,
    ip: ip
  };
}



function searchLogs(){
  var c = checkFormData();
  if(!c) return;
  var t = $("#dataT").attr("data-t");
  t = t || "";
  var url = '/e/log/public?c=' + NKC.methods.strToBase64(JSON.stringify(c));
  if(t) {
    url += '&t='+ t;
  }
  NKC.methods.visitUrl(url);
}



// 删除查询出来的所有记录
function deleteCurrentRecord() {
  var c = checkFormData();
  var url = '/e/log/public';
  return sweetQuestion("确认删除当前查询结果中的所有日志吗？")
    .then(function() {
       return nkcAPI(url + '?del=' +  NKC.methods.strToBase64(JSON.stringify(c)), "DELETE")
    })
    .then(function() {location.reload()})
    .catch(sweetError);
    
}