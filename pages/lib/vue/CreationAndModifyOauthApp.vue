<template lang="pug">
  .oauth-modal(v-show="show")
    .modal-dialog
      .modal-content
        .modal-header
          button(type="button" class="close" @click="close")
            span &times;
          h5.modal-title {{type === 'create' ? '创建第三方应用' : '修改第三方应用'}}
        .modal-body
          .form
            .form-group
              label.control-label 名称
              div
                input.form-control(type="text" v-model="name")
            .form-group
              label.control-label 简介
              textarea.form-control(v-model="desc")
            .form-group
              label.control-label 图标
              .icon-container.m-b-05(v-if="iconUrl")
                img(:src="iconUrl")
              div
                input.hidden(
                  type="file"
                  accept="image/jpeg,image/png"
                  ref="iconInput"
                )
                button.btn.btn-default.btn-sm(@click="selectFile") 选择图片
            .form-group
              label.control-label 操作
              .checkbox.m-t-0
                label.m-r-1(v-for="operation in operations" )
                  input(type="checkbox" :checked="checkOperations.includes(operation)" name="checkOperation" :value="operation")
                  span {{oauthOperations[operation]}}

            .form-group
              label.control-label IP白名单（添加IP后自动启用IP白名单功能）
              div
                .row.m-b-05(v-for="(item, index) in ips" :key="index")
                  .col-xs-10
                    input.form-control(type='text' v-model="item.ip")
                  .col-xs-2
                    button.btn.btn-danger.btn-sm(@click="removeFromArray(ips, index)") 删除
                button.btn.btn-default.btn-sm(@click="addIp") 添加
            .form-group
              label.control-label 主页链接
              textarea.form-control(v-model="home")
            .form-group
              button.btn.btn-primary.btn-block(@click="submit") 提交
        image-selector(ref="imageSelector")

</template>
<script>
import {nkcAPI, nkcUploadFile} from "../js/netAPI";
import {getUrl} from "../js/tools";
import ImageSelector from "./ImageSelector";
import {blobToFile, fileToBase64} from "../js/file";

export default {
  components: {
    'image-selector': ImageSelector
  },
  data() {
    return {
      type: 'create',
      show: false,
      loading: true,
      id: '',
      name: '',
      desc: '',
      home: '',
      ips: [],
      ipsArr: [''],
      iconFile: null,
      iconData: null,
      icon: '',
      checkOperations: [],
      submitting: false,
      operations: [],
      oauthOperations: {},
      checkOperation: [],
    }
  },
  computed: {
    iconUrl() {
      let url = '';
      if(this.type === 'modify'){
        url = getUrl('oauthAppIcon', this.icon);
      }
      return this.iconFile ? window.URL.createObjectURL(this.iconFile) : url
    }
  },
  methods: {
    removeFromArray(arr, index) {
      arr.splice(index, 1);
    },
    open(oauth, type){
      this.loading = true;
      this.show = true;
      this.type = type
      if(type === 'create'){
        this.getCreation()
      }else {
        this.getOauthInfo(oauth);
      }
    },
    close(){
      this.name = "";
      this.desc = "";
      this.home = "";
      this.iconFile = "";
      this.ips = [];
      this.operations = [];
      this.checkOperations = [];
      this.show = false;
    },
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
          sweetError(err);
        });
      // this.$refs.iconInput.click();
    },
    // onSelectedFile(e) {
    //   this.iconFile = e.target.files[0];
    // },
    submit() {
      let {name, desc, iconFile, home, id, ips} = this;
      const checkOperation = [];
      const checkOperationObj = document.getElementsByName("checkOperation");
      for (let _operation in checkOperationObj) {
        //判断复选框是否被选中
        if (checkOperationObj[_operation].checked){
          //获取被选中的复选框的值
          checkOperation.push(checkOperationObj[_operation].value);
        }
      }
      const _ipsArr = ips.map(item => {
        return item.ip.trim()
      });
      const ipsArr = _ipsArr.filter(Boolean);
      this.submitting = true;
      return Promise.resolve()
        .then(() => {
          const formData = new FormData();
          if (!name) throw new Error(`应用名称不能为空`);
          if (!desc) throw new Error('应用简介不能为空');
          if (!home) throw new Error('应用主页不能为空');
          if (!ipsArr) throw new Error('IP名单不能为空');
          if (_ipsArr.length !== ipsArr.length) throw new Error('添加的IP不能为空');
          if (iconFile){
            formData.append('icon', iconFile, 'icon.png');
          }else {
            if(this.type === 'create'){
              throw new Error('应用图标不能为空')
            }
          }
          formData.append('name', name);
          formData.append('desc', desc);
          formData.append('home', home);
          formData.append('ips', JSON.stringify(ipsArr));
          formData.append('operations', JSON.stringify(checkOperation));
          let url;
          if(this.type === 'create'){
            url = "/e/settings/oauth/creation"
          }else {
            url = "/e/settings/oauth/manage/" + id + "/settings";
          }
          return nkcUploadFile(
            url,
            this.type === 'create' ? 'POST' : 'PUT',
            formData,
          );
        })
        .then(() => {
          sweetSuccess('提交成功');
          this.close()
          location.reload();
        })
        .catch(sweetError)
    },
    addIp(){
      this.ips.push({ ip: '' });
    },
    getOauthInfo: function(oauth) {
      let _this = this;
      nkcAPI("/e/settings/oauth/manage/" + oauth._id + "/settings", "GET")
        .then(function(data) {
          _this.id = data.oauthInfo._id;
          _this.name = data.oauthInfo.name;
          _this.desc = data.oauthInfo.desc;
          _this.home = data.oauthInfo.home;
          _this.icon = data.oauthInfo.icon;
          _this.ips = data.oauthInfo.ips.map(item => {
            return {ip: item}
          })
          _this.checkOperations = data.oauthInfo.operations;
          _this.oauthOperations = data.oauthOperations;
          for (const dataKey in data.oauthOperations) {
            _this.operations.push(dataKey)
          }
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    getCreation: function() {
      let _this = this;
      nkcAPI("/e/settings/oauth/creation", "GET")
        .then(function(data) {
          _this.oauthOperations = data.oauthOperations;
          for (const dataKey in data.oauthOperations) {
            _this.operations.push(dataKey)
          }
        })
        .catch(function(data) {
          sweetError(data);
        })
    },

  }
}
</script>
<style lang="less" scoped>
.oauth-modal {
  overflow-x: scroll;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1050;
  .icon-container {
    width: 10rem;
    img {
      max-width: 100%;
    }
  }
  .check-operations {
    margin-right: 0.5rem;
  }
}
</style>
