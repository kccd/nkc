<template lang="pug">
  .row
    .col-xs-12.col-md-12
      h2 添加文档
      a(@click="back")
        .fa.fa-arrow-left &nbsp;
        | 返回上一层
      .form-group
        input.form-control.form-title(type="text" maxlength="20" v-model="document.name" placeholder="请输入素材名")
      document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1.m-b-3
        button.btn.btn-block.btn-primary(@click="add") 提交
</template>

<style lang="less" scoped>
a {
  &:hover {
    text-decoration: none;
    background-color: #2b90d9;
    color: #fff;
  }
  &:focus {
    text-decoration: none;
    background-color: #2b90d9;
    color: #fff;
  }
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  user-select: none;
  display: inline-block;
  height: 2rem;
  cursor: pointer;
  color: #777;
  line-height: 2rem;
  text-align: center;
  min-width: 2rem;
  margin-right: 0.3rem;
  padding: 0 0.8rem;
  font-size: 1.2rem;
  background-color: #f4f4f4;
  border-radius: 3px;
  transition: background-color 200ms, color 200ms;
  margin-bottom: 0.5rem;
  .fa {
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
  }
}
.form-title{
  height: 5rem;
  padding: 0;
  font-size: 2rem;
  box-shadow: none;
  border: none;
  border-bottom: 1px solid #f4f4f4;
  &:focus{
    outline: none;
  }
}
</style>

<script>
import DocumentEditor from '../../../../lib/vue/DocumentEditor';
import {nkcAPI} from '../../../../lib/js/netAPI'
export default {
  data: function (){
    return {
      formConfigs: {
      },
      documentId: '',
      mid: '',
      materialId: '',
      document: {
        name: '',
        content: '',
      },
      ready: false,
    }
  },
  mounted() {
    this.initId();
    this.initData();
  },
  components: {
    'document-editor': DocumentEditor,
  },
  computed: {
    type() {
      return this.documentId? 'modify': 'create'
    },
  },
  watch: {
    'document.name'() {
      if(!this.ready) return;
      this.$refs.documentEditor.watchContentChange();
    }
  },
  methods: {
    //获取ID
    initId() {
      const {mid, documentId, name, _id} = this.$route.query;
      this.mid = mid?mid:'';
      if(name) {
        this.document.name = name;
      }
      this.materialId = _id;
      this.documentId = documentId?documentId:'';
    },
    //插入编辑数据
    initData() {
      const self = this;
      if(!self.documentId) return;
      nkcAPI(`/creation/materials/document?documentId=${self.documentId}`, 'GET', {})
      .then(res => {
        const {content} = res.document;
        self.document.content = content;
        self.initDocumentForm();
      })
      .then(() => {
        self.ready = true;
      })
      .catch(err => {
        console.log(err);
        sweetError(err);
      })
    },
    initDocumentForm() {
      const {content} = this.document;
      this.$refs.documentEditor.initDocumentForm({
        content,
      });
    },
    //提交表单
    add() {
      this.post('publish');
    },
    //提交表单或自动保存表单
    post(type){
      const self = this;
      const {documentId, mid, materialId} = this;
      const {name = '', content = ''} = this.document;
      nkcAPI('/creation/materials/material', 'POST', {
        name,
        content,
        documentId,
        mid,
        type,
        materialId,
      })
      .then(res => {
        self.materialId = res.materialId;
        self.documentId = res.documentId;
      })
      .then(() => {
        if(type === 'publish') {
          sweetSuccess('提交成功');
          //提交成功后移除编辑器事件
          self.$refs.documentEditor.removeNoticeEvent();
          let path = '/creation/materials';
          if(mid) path = `/creation/material/${mid}`;
          self.$router.push({
            path,
          });
        }
      })
      .catch(err => {
        console.log(err);
        sweetError(err);
      })
    },
    saveDocument() {
      this.post(this.type);
    },
    watchContentChange(data) {
      const  {content} = data;
      this.document.content = content;
      this.saveDocument();
    },
    //返回上一层
    back() {
      let path = '/creation/materials';
      if(this.mid) path = `/creation/material/${this.mid}`;
      this.$router.push({
        path: path,
      });
    }
  }
}
</script>
