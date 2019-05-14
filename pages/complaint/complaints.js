var app = new Vue({
  el: "#app",
  data: {
    complaints: []
  },
  mounted: function() {
    var data = getDataById("data");
    for(var i = 0; i < data.complaints.length; i++) {
      data.complaints[i].open = false;
    }
    this.complaints = data.complaints;
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow
  }
});