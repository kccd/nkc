import {showIpInfo} from "../../lib/js/ip";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: '#app',
  data: {
    searchType: data.t || "username",
    searchText: data.c || ""
  },
  methods: {
    showIpInfo,
    searchUser: function () {
      if (!this.searchText) return screenTopWarning('输入不能为空');
      openToNewLocation('/e/log/behavior?t=' + this.searchType + '&c=' + this.searchText);
    }
  }
});
