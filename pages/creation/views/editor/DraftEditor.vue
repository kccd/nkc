<template lang="pug">
  .container-fluid
    .m-b-1
      info-block(:mode="'info'")
        span 如果意外丢失内容，请在草稿箱查找。

    .m-b-1
      document-editor(
        ref="documentEditor"
        :configs="formConfigs"
        @content-change="watchContentChange"
        @ready="editorReady"
        )
    .m-b-1
      button.btn.btn-primary(@click="submit") 提交
      button.btn.btn-primary(@click="save") 保存
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
import InfoBlock from '../../components/InfoBlock';

export default {
  data: function (){
    return {
      formConfigs: {
        title: true,
      },
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
  },
  components: {
    'document-editor': DocumentEditor,
    'info-block': InfoBlock,
  },
  computed: {
    type() {
      return this.draftId? 'modify': 'create'
    },
    navList() {
      const list = [
        {
          name: '图文片段',
          page: 'drafts'
        }
      ];
      if(this.draftId) {
        list.push({
          name: '修改片段',
        });
      } else {
        list.push({
          name: '新建片段',
        });
      }
      return list;
    }
  },
  methods: {
    back() {
      this.$router.push({
        name: 'drafts'
      });
    },
    editorReady() {
      this.initData();
    },
    //获取ID
    initId() {
      const {id} = this.$route.query;
      this.draftId = id;
    },
    //插入编辑数据
    initData() {
      const self = this;
      if(!self.draftId) return;
      nkcAPI(`/creation/drafts/editor?draftId=${self.draftId}`, 'GET', {})
        .then(res => {
          const {content, title} = res.draftData;
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
      const {draftId} = this;
      const {title = '', content = ''} = this.document;
      return nkcAPI('/creation/drafts/editor', 'POST', {
        title,
        content,
        type,
        draftId,
      })
        .then(res => {
          self.draftId = res.draftId
          if(type === 'save') {
            sweetSuccess('提交成功');
            self.$router.push({
              name: 'drafts'
            });
          }
        })
    },
    submit() {
      const self = this;
      this
        .post('save')
        .then(() => {
          self.$router.replace({
            name: 'drafts'
          });
        })
        .catch(sweetError);
    },
    save() {
      this
        .post('save')
        .catch(sweetError);
    },
    saveDraft() {
      this
        .post(this.type)
        .catch(sweetError);
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
