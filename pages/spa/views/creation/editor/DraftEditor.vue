<template lang="pug">
  .standard-fluid-max-container
    //-.m-b-1
      bread-crumb(:list="navList")
    div
      .m-b-1
        info-block(:mode="'info'")
          span 在编辑器中的草稿箱面板内，您可以快速将图文片段插入到正在编辑的文章内容中。
      .m-b-1
        .form
          .form-group
            input.form-control.form-title(type="text" v-model="document.title" placeholder="请输入标题" maxlength='100' @input="contentChange")
          .form-group(v-if="ready")
            editor(:configs="editorConfigs" ref="draftEditor" @content-change="watchContentChange" :plugs="editorPlugs" @ready="insertContent" :l="document.l")
      .m-b-1
        button.btn.btn-primary.m-r-05(@click="submit" :disabled="!draftId") 提交
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
.form {
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
  }
</style>

<script>
import {nkcAPI} from '../../../../lib/js/netAPI'
import { getUrl, timeFormat } from '../../../../lib/js/tools'
import InfoBlock from '../../../components/InfoBlock';
import Editor from '../../../../lib/vue/Editor.vue';
import { getDocumentEditorConfigs } from '../../../../lib/js/editor';
import { debounce } from '../../../../lib/js/execution';

export default {
  data: function (){
    return {
      editorConfigs:getDocumentEditorConfigs(),
      editorPlugs:{
        resourceSelector: true
      },
      draftId: '',
      ready: false,
      document: {
        title: '',
        content: '',
        l: ''
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
      setInterval: null,//自动保存草稿计时器
      types: {
        modify: 'modify',
        create: 'create',
        save: 'save',
        autoSave: 'autoSave'
      }
    }
  },
  mounted() {
    //如果路由有query参数，需要初始化草稿参数。 
    const {id} = this.$route.query;
    if(id){
      this.draftId = id;
      const self = this;
      nkcAPI(`/creation/drafts/editor?draftId=${id}`, 'GET', {})
        .then(res => {
          const {content, title,l} = res.draftData;
          self.document.content = content;
          self.document.title = title;
          self.document.l = l;
        })
        .catch(err => {
          sweetError(err);
        }).finally(()=>{
          self.ready = true;
        });
    }else{
      this.ready = true;
    }
  },
  destroyed() {
  },
  components: {
    'info-block': InfoBlock,
    'editor': Editor,
  },
  watch: {
  },

  computed: {
    type() {
      return this.draftId? this.types.modify: this.types.create
    },
  },
  methods: {
    preview(){
      const url = getUrl('documentPreview', "draft", this.draftId);
      window.open(url);
    },
    history(){
      // if(!this.draftId) return
      const url = getUrl('documentHistory', "draft", this.draftId);
      window.open(url);
    },
    back() {
      this.$router.push({
        name: 'drafts'
      });
    },
    insertContent(){
      // 只有路由存在query参数的情况才会进行内容的填充
      const {id} = this.$route.query;
      if(id){
        // 进行填充内容
        this.$refs?.draftEditor.setContent(this.document.content);
      }
    },
    //提交表单或自动保存表单
    post(type){
      const self = this;
      const {draftId} = this;
      const {title = '', content = '',l} = this.document;
      return nkcAPI('/creation/drafts/editor', 'POST', {
        title,
        content,
        type,
        draftId,
        l,
      })
        .then(res => {
          self.draftId = res.draftId;
        })
      .catch(err => {
        sweetError(err);
      })
    },
    submit() {
      const self = this;
      this.post(this.types.modify)
        .then(() => {
          self.$refs?.draftEditor?.removeNoticeEvent();
          self.$router.push({
            name: 'creationDrafts'
          });
        })
        .catch(sweetError);
    },
    // 手动保存成历史版
    manuallySaveAsHistory() {
      this.post(this.types.save)
        .then(() => {
          sweetSuccess('保存成功');
          this.saveToDraftSuccess();
          this.$refs?.draftEditor?.removeNoticeEvent();
        })
        .catch(sweetError);
    },
    // 检测到编辑器内容改变后触发
    watchContentChange:debounce(function(){
      this.document.content = this.$refs?.draftEditor.getContent();
      this.post(this.type)
    },1000),
    // 标题变化
    contentChange:debounce(function (){
      if(this.$refs.draftEditor.ready){
        this.document.content = this.$refs.draftEditor.getContent();
      }
      this.post(this.type);
    },1000),
    //保存草稿成功提示
    saveToDraftSuccess() {
      let time = new Date();
      this.autoSaveInfo = "草稿已保存 " + timeFormat(time);
    },
  }
}
</script>
