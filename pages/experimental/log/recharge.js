import {objToStr} from "../../lib/js/tools";
var app = new Vue({
  el: "#app",
  data: {
    records: [],
    t: "",
    content: ""
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.records = data.records;
    this.t = data.t || "username";
    this.content = data.content;
    /*setTimeout(function() {
      floatUserPanel.initPanel();
    }, 500);*/
  },
  methods: {
    objToStr: objToStr,
    format: NKC.methods.format,
    search: function() {
      // window.location.href = "/e/log/recharge?t=" + app.t + "&content=" + app.content;
      openToNewLocation("/e/log/recharge?t=" + app.t + "&content=" + app.content);
    }
  },
});
