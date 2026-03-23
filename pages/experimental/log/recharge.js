import { objToStr } from '../../lib/js/tools';
import { sweetError, sweetSuccess } from '../../lib/js/sweetAlert';
import { nkcAPI } from '../../lib/js/netAPI';

var app = new Vue({
  el: '#app',
  data: {
    records: [],
    t: '',
    content: '',
  },
  mounted: function () {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.records = data.records;
    this.t = data.t || 'username';
    this.content = data.content;
    /*setTimeout(function() {
      floatUserPanel.initPanel();
    }, 500);*/
  },
  methods: {
    objToStr: objToStr,
    format: NKC.methods.format,
    search: function () {
      // window.location.href = "/e/log/recharge?t=" + app.t + "&content=" + app.content;
      openToNewLocation(
        '/e/log/recharge?t=' + app.t + '&content=' + app.content,
      );
    },
    syncRecordStatus(record) {
      nkcAPI(`/e/log/recharge/sync`, 'POST', {
        recordId: record._id,
      })
        .then((res) => {
          record.verify = res.data.record.verify;
          sweetSuccess('同步成功');
        })
        .catch(sweetError);
    },
  },
});
