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
    watch: {

    },
    methods: {
      open: function(option) {
        var self = this;
        self.list = [];
        $dom.modal("show");
        self.loadding = true;
        nkcAPI("/u/" + option.uid + "/violationRecord", "GET")
          .then(res => {
            self.loadding = false;
            self.list = res.record;
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
