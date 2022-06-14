import {getDataById} from "../../lib/js/dataConversion";
import {visitUrl} from "../../lib/js/pageSwitch";

const data = getDataById('data');
let searchText = '';
let searchType = '';
if(data.t && data.content) {
  searchText = data.content;
  searchType = data.t;
}
var app = new Vue({
  el: '#app',
  data: {
    searchType: searchType || 'username',
    searchText,
    xsfsRecords: data.xsfsRecords,
  },
  methods: {
    searchUser: function() {
      if(!this.searchText) return screenTopWarning('输入不能为空');
      visitUrl('/e/log/xsf?t=' + this.searchType + '&content=' + this.searchText);
    }
  }
});
