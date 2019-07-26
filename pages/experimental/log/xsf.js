var app = new Vue({
  el: '#app',
  data: {
    searchType: 'username',
    searchText: '',
    xsfsRecords: []
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    searchUser: function() {
      if(!this.searchText) return screenTopWarning('输入不能为空');
      // window.location.href = '/e/log/xsf?t=' + this.searchType + '&content=' + this.searchText;
      openToNewLocation('/e/log/xsf?t=' + this.searchType + '&content=' + this.searchText);
    }
  },
  mounted: function() {

    var data = JSON.parse(document.getElementById('data').innerText);
    // var data = JSON.parse(this.$refs.data.innerText);
    this.xsfsRecords = data.xsfsRecords;
    if(data.t && data.content) {
      this.searchText = data.content;
      this.searchType = data.t;
    }
  }
});