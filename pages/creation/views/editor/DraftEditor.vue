<template lang="pug">
  .container-fluid
    .m-b-1
      info-block(:mode="'info'")
        span 片段内容编辑器提示
    .m-b-1
      document-editor(
        ref="documentEditor"
        :configs="formConfigs"
        @content-change="watchContentChange"
        @ready="editorReady"
        )
    .m-b-1
      button.btn.btn-primary.m-r-05(@click="submit") 提交
      button.btn.btn-default(@click="manuallySaveAsHistory" :disabled="!draftId") 保存
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
  watch: {
    draftId() {
      this.$router.replace({
        name: this.$route.name,
        query: {
          id: this.draftId,
        }
      })
    }
  },
  computed: {
    type() {
      return this.draftId? 'modify': 'create'
    },
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
          self.draftId = res.draftId;
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
    initAuthSave() {

    },
    // 手动保存成历史版
    manuallySaveAsHistory() {
      this
        .saveAsHistory()
        .then(() => {
          sweetSuccess('快照保存成功');
        })
        .catch(sweetError);
    },
    // 自动定时保存成历史版
    authSaveAsHistory() {
      this
        .saveAsHistory()
        .catch(err => {
          screenTopWarning(`快照自动保存失败 error: ${err.error || err.message}`);
        });
    },
    // 保存编辑版内容，并根据编辑版内容生成历史版
    saveAsHistory() {
      const {draftId} = this;
      if(!draftId) return;
      return this
        .post('save')
    },
    // 输入框内容变动自动保存，覆盖编辑版内容
    saveChangedDraftContent() {
      const self = this;
      return Promise.resolve()
        .then(() => {
          self.setSavedStatus('saving');
          return self.post(self.type);
        })
        .then(() => {
          self.setSavedStatus('succeeded');
        })
        .catch(err => {
          self.setSavedStatus('failed');
          screenTopWarning(err.error || err.message);
        });
    },
    // 检测到编辑器内容改变后触发
    watchContentChange(data) {
      const  {content, title} = data;
      this.document.title = title;
      this.document.content = content;
      this.saveChangedDraftContent();
    },
    // 调用编辑器显示保存状态信息 succeeded, failed, saving
    setSavedStatus(status) {
      this.$refs.documentEditor.setSavedStatus(status);
    }
  }
}
</script>
