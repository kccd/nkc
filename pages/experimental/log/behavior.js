import { showIpInfo } from '../../lib/js/ip';
import { visitUrl } from '../../lib/js/pageSwitch';
import { objToStr, strToObj } from '../../lib/js/dataConversion';

const data = window.NKC.methods.getDataById('data');
let queryData = {};
if (data.c) {
  try {
    queryData = strToObj(data.c);
  } catch (err) {
    //
  }
}
new window.Vue({
  el: '#app',
  data: {
    userType: queryData.userType || 'username',
    userText: queryData.userText || '',
    operation: queryData.operation || 'all',
    fid: queryData.fid || '',
    tid: queryData.tid || '',
    pid: queryData.pid || '',
    uid: queryData.uid || '',
    ip: queryData.ip || '',
  },
  methods: {
    showIpInfo,
    searchUser: function () {
      const c = objToStr({
        userType: this.userType.trim(),
        userText: this.userText.trim(),
        operation: this.operation.trim(),
        fid: this.fid.trim(),
        tid: this.tid.trim(),
        pid: this.pid.trim(),
        uid: this.uid.trim(),
        ip: this.ip.trim(),
      });
      visitUrl('/e/log/behavior?c=' + c);
    },
  },
});
