NKC.modules.violationRecord = new function violationRecord() {
  var $dom = $("#violationRecord");
  $dom.modal({ show: false});
  this.$dom = $dom;
  this.vm = new Vue({
    el: "#violationRecordApp",
    data: {
      list: [],
      loadding: true
    },
    methods: {
      open: function(option) {
        var self = this;
        self.list = [];
        $dom.modal("show");
        self.loadding = true;
        nkcAPI("/u/" + option.uid + "/violationRecord", "GET")
          .then(function(res){
            self.loadding = false;
            var record = res.record;
            self.list = record;
          })
      },
      close: function() {
        $dom.modal("hide");
      },
      // 时间格式化
      dateFormat: function(fmt, date) {
        var ret;
        var opt = {
            "y+": date.getFullYear().toString(),        // 年
            "M+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "m+": date.getMinutes().toString(),         // 分
            "s+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (var k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
      }
    }
  });
  this.open = this.vm.open;
  this.close = this.vm.close;
};