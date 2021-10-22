NKC.modules.CommonModal = function() {
  var this_ = this;
  this_.dom = $("#moduleCommonModal");
  this_.dom.modal({
    show: false,
    backdrop: "static"
  });
  this_.app = new Vue({
    el: "#moduleCommonModalApp",
    data: {
      title: "",
      info: "",
      quote: "",
      data: {}
    },
    methods: {
      submit: function() {
        this_.callback(this.data);
        this_.dom.modal("hide");
      },
      pickedFile: function(index) {
        var dom = this.$refs['input'+index][0];
        this.data[index].value = dom.files[0];
      }
    }
  });
  this_.open = function(callback, options) {
    this_.callback = callback;
    this_.app.data = options.data;
    this_.app.quote = options.quote;
    this_.app.title = options.title;
    this_.app.info = options.info || "";
    this_.dom.modal("show");
  };
  this_.close = function() {
    this_.dom.modal("hide");
    setTimeout(function() {
      this_.app.data = {};
    }, 500);
  };
};