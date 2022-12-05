import {HttpMethods, nkcUploadFile} from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";
import {blobToFile, fileToBase64} from "../../lib/js/file";
import ImageSelector from "../../lib/vue/ImageSelector";
const data = NKC.methods.getDataById('data');
const operations = [];
for (let oauthOperationsKey in data.oauthOperations) {
  operations.push(oauthOperationsKey)
}
const app = new Vue({
  el: '#app',
  data: () => ({
    name: '',
    desc: '',
    home: '',
    callback: '',
    iconFile: null,
    url: '',
    submitting: false,
    oauthOperations: data.oauthOperations,
    operations,
    checkOperation: [],
    ips: [{ip: ''}]
  }),
  components: {
    'image-selector': ImageSelector
  },
  computed: {
    iconUrl() {
      return this.iconFile? window.URL.createObjectURL(this.iconFile): ''
    }
  },
  methods: {
    selectFile() {
      const self = this;
      self.$refs.imageSelector.open({
        aspectRatio: 1
      })
        .then(res => {
          const file = blobToFile(res);
          fileToBase64(file)
            .then(res => {
              self.iconData = res;
            });
          self.iconFile = res;
          self.$refs.imageSelector.close();
        })
        .catch(err => {
          console.log(err);
          sweetError(err);
        });
      // this.$refs.iconInput.click();
    },
    onSelectedFile(e) {
      this.iconFile = e.target.files[0];
    },
    submit() {
      const {name, desc, iconFile, home, checkOperation, ips} = this;
      const checkOperationObj = document.getElementsByName("checkOperation");
      for (let _operation in checkOperationObj) {
        //判断复选框是否被选中
        if (checkOperationObj[_operation].checked)
          //获取被选中的复选框的值
          checkOperation.push(checkOperationObj[_operation].value);
      }
      const ipsArr = ips.map(item => item.ip.trim()).filter(Boolean)
      this.submitting = true;
      return Promise.resolve()
        .then(() => {
          if(!name) throw new Error(`应用名称不能为空`);
          if(!desc) throw new Error('应用简介不能为空');
          if(!iconFile) throw new Error('应用图标不能为空')
          if(!home) throw new Error('应用主页不能为空');
          if(!ipsArr) throw new Error('IP名单不能为空');
          const formData = new FormData();
          formData.append('name', name);
          formData.append('desc', desc);
          formData.append('home', home);
          formData.append('ips', JSON.stringify(ipsArr));
          formData.append('icon', iconFile, 'icon.png');
          formData.append('operations', checkOperation);
          return nkcUploadFile(
            `/oauth/creation`,
            HttpMethods.POST,
            formData,
          );
        })
        .then(() => {
          sweetSuccess('提交成功');
        })
        .catch(sweetError)
        .finally(() => {
          this.submitting = false;
        })
    },
    addIp(){
      this.ips.push({ ip: '' });
    }
  }
})
