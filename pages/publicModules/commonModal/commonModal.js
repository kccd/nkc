
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
      data: {},
      link: false,
    },
    watch: {
      "data.5": {
        deep: true,
        handler(n) {
          if(n.value) {
            this.link = true;
          }else{
            this.link = false;
          }
        },

      }
    },
    methods: {
      submit: function() {
        if(this.link){
          console.log(this.data[6],'this.data[6]')
          const reg = /^http(s)?:\/\/.+/;
          if(!reg.test(this.data[6].value)){
            throw "不是一个正确的网址"
          }
        }
        this_.callback(this.data);
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
