;(function(){
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

  var sTime = $("#timeRange").attr("stime");
  var eTime = $("#timeRange").attr("etime");
  laydate.render({
    elem: "#timeRange",
    format: "yyyy-M-d H:m:s",
    value: (sTime && eTime) ? (dateFormat("yyyy-M-d H:m:s", new Date(parseInt(sTime))) + " - " + dateFormat("yyyy-M-d H:m:s", new Date(parseInt(eTime)))) : "",
    type: 'datetime',
    range: true,
    done: function(date) {
      $("#timeRange").val(date);
    },
    // 适配手机端显示
    ready: function () {
      if (window.screen.width <= 480) {
        var top = '50px';
        if (window.screen.height < 600) {
          top = '-5px';
          $('.layui-laydate-content').css({ padding: '5px 10px' })
        }
        $('.layui-laydate-range').css({ left: '50%', top: top, marginLeft:'-137px',width: '274px' });
        $('.layui-laydate-main').css({ display: 'block' })
      }
    }
  });



  $("#search").on("click", function() {
    var timeRange = $("#timeRange").val() || "";
    var timePoints = timeRange.split(" - ");
    var sTime = (new Date(timePoints[0])).getTime();
    var eTime = (new Date(timePoints[1])).getTime();
    var ip = $("#ip").val() || "";
    var optype = $("#optype").val() || "";
    var userid = $("#userid").val() || "";
    var emailAddr = $("#emailAddr").val() || "";
    var c = {
      sTime: sTime,
      eTime: eTime,
      ip: ip, 
      optype: optype,
      userid: userid,
      emailAddr: emailAddr
    }
    NKC.methods.visitUrl('/e/log/emailcode?c=' + NKC.methods.strToBase64(JSON.stringify(c)));
  })

}());