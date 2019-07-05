var app = new Vue({
  el: "#app",
  data: {
    t: "username",
    content: ""
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.t = data.t || "username";
    this.content = data.content || "";
  },
  methods: {
    search: function() {
      if(!this.content) return screenTopWarning('输入不能为空');
      // window.location.href = '/e/log/exam?t=' + this.t + '&content=' + this.content;
      openToNewLocation('/e/log/exam?t=' + this.t + '&content=' + this.content);
    }
  }
});