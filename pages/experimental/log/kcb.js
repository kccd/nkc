var app = new Vue({
  el: '#app',
  data: {
    kcbsRecords: [],
    searchType: 'username',
    searchText: '',
    searchTextPlaceholder: '请输入用户名',
    searchoperationId: '',
    searchScoreType: '',
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    ipUrl: NKC.methods.ipUrl,
    searchUser: function() {
      openToNewLocation('/e/log/kcb?t=' + this.searchType + '&content=' + this.searchText + "&operationId=" + this.searchoperationId + '&scoreType=' + this.searchScoreType);
    },
    optionChange: function() {
      var typeCn = this.$refs.selectTypeDom.selectedOptions[0].innerText;
      this.searchTextPlaceholder = '请输入' + typeCn;
      this.searchText = "";
    }
  },
  mounted: function() {
    var data = NKC.methods.getDataById('data');
    this.kcbsRecords = data.kcbsRecords || '';
    this.searchText = data.content || '';
    this.searchType = data.t || 'username';
    this.searchoperationId = data.operationId || '';
    this.searchScoreType = data.scoreType || '';
    setTimeout(function() {
      floatUserPanel.initPanel();
    }, 500)
  }
});
