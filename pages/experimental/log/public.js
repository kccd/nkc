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

// 时间格式化
function dateFormat(fmt, date) {
  let ret;
  const opt = {
      "y+": date.getFullYear().toString(),        // 年
      "M+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "m+": date.getMinutes().toString(),         // 分
      "s+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
  };
  return fmt;
}

// 查询时间范围
var nowDate = new Date();
var $timeRange = $("#timeRange");
if($timeRange[0]) {
  var sTime = $timeRange.data("stime");
  var eTime = $timeRange.data("etime");
  var time;
  if(sTime && eTime) time = sTime + " - " + eTime;
  var timeRange = $timeRange[0];
  // 绑定layDate时间下拉
  laydate.render({
    elem: timeRange,
    format: "yyyy-M-d H:m:s",
    value: time,
    // value: (sTime? sTime:(dateFormat("yyyy-M-d", nowDate) + " 0:0:0")) + " - " + (eTime? eTime:(dateFormat("yyyy-M-d", nowDate) + " 23:59:59")),
    type: 'datetime',
    range: true,
    done: function(date) {
      $("#timeRange").val(date);
    }
  });
}


// 日期减法（一个时间减去毫秒数）
function subCalcDate(date, millisecond) {
  return new Date(date.getTime() - millisecond);
}



// 删除时间范围
var $cleanupTimeRange = $("#cleanupTimeRange");
if($cleanupTimeRange[0]) {
  var sTime = $cleanupTimeRange.data("stime");
  var eTime = $cleanupTimeRange.data("etime");
  var cleanupTimeRange = $cleanupTimeRange[0];
  var threeMonthAgo = subCalcDate(nowDate, 3 * 30 * 24 * 60 * 60 * 1000);
  var maxDate = dateFormat("yyyy-M-d", threeMonthAgo);

  // 绑定layDate时间下拉
  laydate.render({
    elem: cleanupTimeRange,
    format: "yyyy-M-d H:m:s",
    value: (sTime? sTime:dateFormat("yyyy-M-d", threeMonthAgo) + " 0:0:0") + " - " + (eTime? eTime:dateFormat("yyyy-M-d", threeMonthAgo) + " 23:59:59"),
    type: 'datetime',
    range: true,
    max: maxDate + " 23:59:59",    // 三个月前
    done: function(date) {
      $("#cleanupTimeRange").val(date);
    }
  });
}




// 获取查询表单数据
function checkFormData() {
  var timeRange
  if($timeRange.length) {
    timeRange = $timeRange.val().trim();
  }
  if($cleanupTimeRange.length) {
    timeRange = $cleanupTimeRange.val().trim();
  }
  var timePoint = timeRange.split(" - ");
  var sTime = timePoint[0];
  var eTime = timePoint[1];
  var uid, ip, operationId, logType;
  if($("#userId").length) {
    uid = $("#userId").val().trim();
  }
  if($("#ipAdress").length) {
    ip = $("#ipAdress").val().trim();
  }
  if($("#operationId").length) {
    operationId = $("#operationId").val().trim();
  }
  if($("#logType").length) {
    logType = $("#logType").val().trim();
  }
  var st = (new Date(sTime)).getTime();
  var et = (new Date(eTime)).getTime();
  if(st && et && st > et){
    sweetError("结束时间不能早于开始时间");
    return null;
  }
  return {
    sTime: sTime,
    eTime: eTime,
    uid: uid || "",
    operationId: operationId || "",
    ip: ip || "",
    logType: logType || "user"
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
    .then(function() {
      sweetSuccess("删除成功");
    })
    .catch(sweetError);
}
