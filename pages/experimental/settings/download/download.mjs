const data = NKC.methods.getDataById('data');
const hours = [];
for(let i = 0; i <=24; i++) {
  hours.push(i);
}
const app = new Vue({
  el: '#app',
  data: {
    hours,
    certList: data.certList,
    settings: data.downloadSettings
  },
  methods: {
    addSpeed(arr) {
      arr.push({
        startingTime: 0,
        endTime: 24,
        speed: 0
      });
    },
    removeFromArray(arr, index) {
      arr.splice(index, 1);
    },
    addCert(arr) {
      const item = {
        type: '',
        fileCount: 0,
        data: []
      };
      this.addSpeed(item.data);
      arr.push(item);
    },
    save() {
      nkcAPI('/e/settings/download', 'PUT', {
        downloadSettings: this.settings
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError)
    }
  }
});
