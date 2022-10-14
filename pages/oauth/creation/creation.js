import {HttpMethods, nkcUploadFile} from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";

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
  }),
  computed: {
    iconUrl() {
      return this.iconFile? window.URL.createObjectURL(this.iconFile): ''
    }
  },
  methods: {
    selectFile() {
      this.$refs.iconInput.click();
    },
    onSelectedFile(e) {
      this.iconFile = e.target.files[0];
    },
    submit() {
      const {name, desc, iconFile, home, callback} = this;
      this.submitting = true;
      return Promise.resolve()
        .then(() => {
          if(!name) throw new Error(`应用名称不能为空`);
          if(!desc) throw new Error('应用简介不能为空');
          if(!iconFile) throw new Error('应用图标不能为空')
          if(!home) throw new Error('应用主页不能为空');
          if(!callback) throw new Error('应用回调链接不能为空');
          const formData = new FormData();
          formData.append('name', name);
          formData.append('desc', desc);
          formData.append('home', home);
          formData.append('callback', callback);
          formData.append('icon', iconFile);
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
    }
  }
})
