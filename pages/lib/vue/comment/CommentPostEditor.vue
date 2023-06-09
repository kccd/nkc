<template lang="pug">
  .comment-container(v-show="show")
    .single-comment-editor-container(v-if="loading")
      .single-comment-loading
        .fa.fa-spinner.fa-spin
        span 加载中...
    .single-comment-editor-container(v-else)
      .single-comment-prompt 200字以内，请确保您输入的内容合法。
      .single-comment-editor
        editor(:configs="editorConfigs" :ref="`commentEditor_${cid}`" @ready="removeEvent" :plugs="editorPlugs" @content-change="editorContentChange")
      .single-comment-button(:data-tyep="this.cid")
        .checkbox
          label
            input(type="checkbox" checked="checked" data-type="protocol" v-model="protocol")
            span 我已阅读并同意遵守与本次发表相关的全部协议。
            a(href="/protocol" target="_blank") 查看协议
        .btn.btn-primary.btn-sm.m-r-05(@click="publishComment" :disabled="lockPost") 提交
        .btn.btn-default.btn-sm.m-r-05(@click="saveComment" :disabled="lockPost") 存草稿
        .btn.btn-default.btn-sm(@click="close") 取消
</template>

<style lang="less" scoped>
@import '../../../publicModules/base';
.comment-container {
  text-align: left;
  .single-comment-editor-container {
    padding: 1rem 0.5rem;
    background: #fff;
    border-radius: 4px;
    .single-comment-loading {
      width: 100%;
      text-align: center;
    }

    .single-comment-prompt {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .single-comment-editor {

    }

    .single-comment-button {
      .checkbox {

      }
    }
  }
}
</style>

<script>
import {getPostEditorConfigs} from "../../js/editor";
import {nkcAPI} from "../../js/netAPI";
import {debounce} from "../../js/execution";
import Editor from "../Editor";
export default {
  props: ['cid', 'aid'],
  data: () => ({
    editorPlugs: {
      resourceSelector: true,
      draftSelector: true,
      stickerSelector: true,
      xsfSelector: true,
      mathJaxSelector: true,
    },
    show: false,
    draftId: null,
    loading: true,
    comment: null,
    lockPost: false, //发布与编辑的禁用状态
    // 是否允许触发contentChange
    contentChangeEventFlag: false,
    //评论编辑类型
    type: '',
    //是否勾选协议
    protocol: true,
    commentContent: '',
    setTimeout: null,
  }),
  components: {
    'editor': Editor,
  },
  mounted() {
  },
  computed: {
    editorConfigs() {
      return getPostEditorConfigs();
    }
  },
  methods: {
    removeEvent() {
      this.$refs[`commentEditor_${this.cid}`].removeNoticeEvent();
      this.initContent(this.comment.content);
    },
    initContent(content) {
      this.$refs[`commentEditor_${this.cid}`].setContent(content);
    },
    getRef() {
      return this.$refs[`commentEditor_${this.cid}`];
    },
    getShow() {
      return this.show;
    },
    open(cid) {
      if(!cid) return;
      const self = this;
      nkcAPI(`/comment/${cid}/commentEditor`, 'GET', {})
      .then(res => {
        self.comment = res.comment;
        self.commentContent = res.comment.content;
        self.type = 'modify';
      })
      .catch(err => {
        sweetError(err);
      })
      self.show = true;
      self.loading = false;
    },
    //关闭评论编辑器
    close() {
      this.show = false;
      window.location.reload();
      // this.$emit('close-editor', this.comment._id);
    },
    //当编辑器中的内容变化时
    editorContentChange: debounce(function() {
      if(!this.contentChangeEventFlag) {
        this.contentChangeEventFlag = true;
        return;
      }
      const data = this.$refs[`commentEditor_${this.comment._id}`].getContent();
      if(data) {
        this.commentContent = data;
        this.modifyPost();
      }
    }, 1000),
    modifyPost() {
      const self = this;
      clearTimeout(self.setTimeout);
      self.setTimeout = setTimeout(function () {
        self.post(self.type);
      }, 2000);
    },
    //设置编辑器保存状态 succeeded failed saving
    setSavedStatus(type) {
      this.$refs[`commentEditor_${this.comment._id}`].changeSaveInfo(type);
    },
    //提交内容
    post(type) {
      if(!this.protocol) sweetWarning('请勾选协议！');
      if(!type) return;
      if(type === 'publish') clearTimeout(this.setTimeout);
      if(this.lockPost) return;
      this.lockPost = true;
      const self = this;
      self.setSavedStatus('saving');
      nkcAPI('/comment', 'POST', {
        content: self.commentContent,
        type,
        source: self.comment.source,
        aid: self.aid,
        commentId: self.comment._id,
      })
        .then(res => {
          self.commentId = res.commentId;
          if(type !== 'publish') {
            self.lockPost = false;
            self.type = 'modify';
            if(type === 'save') sweetSuccess('保存成功');
          } else {
            self.contentChangeEventFlag = false;
            self.lockPost = false;
            sweetSuccess('提交成功');
            //提交成功后关闭评论编辑器
            // self.close();
          }
          return self.setSavedStatus('succeeded');
        })
        .catch(err => {
          self.lockPost = false;
          self.setSavedStatus('failed');
          sweetError(err);
        })
    },
    //提交正式版评论
    publishComment() {
      this.post('publish');
    },
    //暂存评论
    saveComment() {
      this.post('save');
    }
  }
}
</script>
