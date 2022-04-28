<template lang="pug">
  .standard-fluid-max-container
    //-.m-b-1
      bread-crumb(:list="navList")
    div
      .m-b-1
        info-block(:mode="'info'")
          span 在编辑器中的草稿箱面板内，您可以快速将图文片段插入到正在编辑的文章内容中。
      .m-b-1
        document-editor(
          ref="documentEditor"
          :configs="formConfigs"
          @content-change="watchContentChange"
          @ready="editorReady"
          )
      .m-b-1
        button.btn.btn-primary.m-r-05(@click="submit") 提交
        button.btn.btn-default.m-r-05(@click="manuallySaveAsHistory" :disabled="!draftId") 保存
        button.btn.btn-default.m-r-05(@click="preview" :disabled="!draftId") 预览
        button.btn.btn-default.m-r-05(@click="history" :disabled="!draftId") 历史
        .checkbox
          .editor-auto-save(v-if="autoSaveInfo")
            .fa.fa-check-circle &nbsp;{{ autoSaveInfo }}
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
import { getUrl, timeFormat } from '../../../../lib/js/tools'
import InfoBlock from '../../../components/InfoBlock';

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
      },
      navList: [
        {
          name: '内容创作',
        },
        {
          name: '片段创作',
          page: 'draftEditor'
        }
      ],
      editorInitOk: false,
      autoSaveInfo: null,
      setInterval: '',//自动保存草稿计时器
    }
  },
  mounted() {
    const self = this;
    self.initId();
    self.setInterval = setInterval(function() {
      self.autoSaveToDraft()
    }, 60000);
  },
  destroyed() {
    clearInterval(this.setInterval);
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
    },
    $route(to){
      if(to.path === "/creation/drafts"){
        this.$refs.documentEditor.removeNoticeEvent()
      }else if(to.path === "/creation/editor/draft"){

        // console.log("进入编辑器")
        if(this.editorInitOk){
          this.$refs.documentEditor.initDocumentForm({
            content: '',
            title: ''
          });
          this.initId();
          this.initData()
        }
      }
    },
  },

  computed: {
    type() {
      return this.draftId? 'modify': 'create'
    },
  },
  methods: {
    preview(){
      const url = getUrl('preview', "draft", this.draftId);
      window.open(url);
    },
    history(){
      // if(!this.draftId) return
      const url = getUrl('history', "draft", this.draftId);
      window.open(url);
    },
    back() {
      this.$router.push({
        name: 'drafts'
      });
    },
    editorReady() {
      this.editorInitOk = true;
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
      this.post('save')
        .then(() => {
          self.$router.push({
            name: 'creationDrafts'
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
          sweetSuccess('保存成功');
          this.saveToDraftSuccess();
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
    },
    //保存草稿成功提示
    saveToDraftSuccess() {
      let time = new Date();
      this.autoSaveInfo = "草稿已保存 " + timeFormat(time);
    },
    //自动保存草稿
    autoSaveToDraft() {
      const self = this;
      this.post('save')
      .then(() => {
        self.saveToDraftSuccess();
      })
    }
  }
}
</script>
