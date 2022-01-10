<template lang="pug">
  .row
    .col-xs-12.col-md-12
      h2 添加草稿
      a(@click="back")
        .fa.fa-arrow-left &nbsp;
        | 返回上一层
      document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1.m-b-3
        button.btn.btn-block.btn-primary(@click="submit") 提交
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
import DocumentEditor from '../../../lib/vue/DocumentEditor';
import {nkcAPI} from '../../../lib/js/netAPI'
export default {
  data: function (){
    return {
      formConfigs: {
        title: true,
      },
      documentDid: '',
      draftId: '',
      ready: false,
      document: {
        title: '',
        content: ''
      }
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
      return this.documentDid? 'modify': 'create'
    },
  },
  methods: {
    back() {
      this.$router.push({
        name: 'drafts'
      });
    },
    //获取ID
    initId() {
      const {draftId, documentDid} = this.$route.query;
      this.draftId = draftId;
      this.documentDid = documentDid;
    },
    //插入编辑数据
    initData() {
      const self = this;
      if(!self.documentDid) return;
      nkcAPI(`/creation/drafts/draftEdit?documentDid=${self.documentDid}`, 'GET', {})
        .then(res => {
          const {content, title} = res.document;
          self.document.content = content;
          self.document.title = title;
          self.initDocumentForm();
        })
        .then(() => {
          self.ready = true;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    initDocumentForm() {
      const {content, title} = this.document;
      this.$refs.documentEditor.initDocumentForm({
        content,
        title
      });
    },
    //提交表单或自动保存表单
    post(type){
      const self = this;
      const {draftId, documentDid} = this;
      const {title = '', content = ''} = this.document;
      nkcAPI('/creation/drafts/draftEdit', 'POST', {
        title,
        content,
        type,
        draftId,
        documentDid,
      })
        .then(res => {
          self.draftId = res.draftId
          self.documentDid = res.documentDid;
          if(type === 'save') {
            sweetSuccess('提交成功');
            self.$router.push({
              name: 'drafts'
            });
          }
        })
        .catch(err => {
          sweetError(err);
        })
    },
    submit() {
      this.post('save');
    },
    saveDraft() {
      this.post(this.type);
    },
    watchContentChange(data) {
      const  {content, title} = data;
      this.document.title = title;
      this.document.content = content;
      this.saveDraft();
    },
  }
}
</script>
