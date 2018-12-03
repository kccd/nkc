var app = new Vue({
  el: '#app',
  data: {
    xsfsRecords: []
  },
  methods: {
    fromNow: fromNow,
    format: format,
  },
  mounted: function() {

    var data = JSON.parse(document.getElementById('data').innerText);
    // var data = JSON.parse(this.$refs.data.innerText);
    this.xsfsRecords = data.xsfsRecords;
  }
});