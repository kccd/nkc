var app = new Vue({
  el: '#app',
  data: {
    kcbsRecords: [],
    searchType: 'username',
    searchText: '',
    searchTextPlaceholder: '请输入用户名',
    searchOperatingId: ''
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    ipUrl: NKC.methods.ipUrl,
    searchUser: function() {
      if(!this.searchText) return screenTopWarning('输入不能为空');
      // window.location.href = '/e/log/kcb?t=' + this.searchType + '&content=' + this.searchText;
      openToNewLocation('/e/log/kcb?t=' + this.searchType + '&content=' + this.searchText + "&operatingid=" + this.searchOperatingId);
    },
    optionChange: function() {
      let typeCn = this.$refs.selectTypeDom.selectedOptions[0].innerText;
      this.searchTextPlaceholder = '请输入' + typeCn;
      this.searchText = "";
    }
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    this.kcbsRecords = data.kcbsRecords;
    // console.log(data);
    if(data.t && data.content) {
      this.searchText = data.content;
      this.searchType = data.t;
      this.searchOperatingId = data.operatingid;
    }
  }
});