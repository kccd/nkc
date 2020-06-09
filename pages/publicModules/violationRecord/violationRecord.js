NKC.modules.violationRecord = new function violationRecord() {
  var $dom = $("#violationRecord");
  $dom.modal({ show: false});
  this.$dom = $dom;
  this.vm = new Vue({
    el: "#violationRecordApp",
    data: {
      list: [],
      loading: true,
      blacklistCount: {},
    },
    methods: {
      open: function(option) {
        var self = this;
        self.list = [];
        $dom.modal("show");
        self.loading = true;
        nkcAPI("/u/" + option.uid + "/violationRecord", "GET")
          .then(function(res){
            self.loading = false;
            self.list = res.record;
            self.blacklistCount = res.blacklistCount;
          })
      },
      close: function() {
        $dom.modal("hide");
      },
      format: NKC.methods.format
    }
  });
  this.open = this.vm.open;
  this.close = this.vm.close;
};
