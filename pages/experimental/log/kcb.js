var app = new Vue({
  el: '#app',
  data: {
    kcbsRecords: [],
    searchType: 'username',
    searchText: ''
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    searchUser: function() {
      if(!this.searchText) return screenTopWarning('输入不能为空');
      // window.location.href = '/e/log/kcb?t=' + this.searchType + '&content=' + this.searchText;
      openToNewLocation('/e/log/kcb?t=' + this.searchType + '&content=' + this.searchText);
    }
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    this.kcbsRecords = data.kcbsRecords;
    console.log(data);
    if(data.t && data.content) {
      this.searchText = data.content;
      this.searchType = data.t;
    }
  }
});