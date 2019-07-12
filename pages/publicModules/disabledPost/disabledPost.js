NKC.modules.DisabledPost = function() {
  var this_ = this;
  this_.dom = $("#moduleDisabledPost");
  this_.dom.modal({
    show: false
  });
  this_.app = new Vue({
    el: "#moduleDisabledPostApp",
    data: {
      submitting: false,
      type: "toDraft", // toDraft, toRecycle
      reason: "",
      remindUser: [true],
      violation: [true]
    },
    watch: {
      type: function() {
        if(this.type === "toDraft") {
          this.remindUser = [true];
        }
      }
    },
    methods: {
      submit: function() {
        if(!this.reason) return screenTopWarning("请输入原因");
        this_.callback({
          type: this.type,
          reason: this.reason,
          remindUser: this.remindUser.length > 0,
          violation: this.violation.length > 0
        });
      }
    }
  });
  this_.open = function(callback) {
    this_.callback = callback;
    this_.dom.modal("show");
  };
  this_.close = function() {
    this_.dom.modal("hide");
    this_.unlock();
  };
  this_.lock = function() {
    this_.app.submitting = true;
  };
  this_.unlock = function() {
    this_.app.submitting = false;
  }
};