<template lang="pug">
  .moment-comment-editor
    resource-selector(ref="resourceSelector")
    emoji-selector(ref="emojiSelector")
    .moment-comment-editor-container
      .moment-comment-textaea-ditor-container.m-b-05
        textarea-editor(
          ref="textareaEditor"
          :placeholder="placeholder"
          height="4rem"
          @content-change="onTextareaEditorContentChange"
          @click-ctrl-enter="onClickEnter"
          )
    .moment-comment-pictures-container
        .pictures(v-if="picturesUrl.length > 0")
          .picture-item(v-for="(url, index) in picturesUrl" :style="'background-image: url('+url+')'")
            .icon-remove(@click="removeFromArr(picturesId, index)" title="取消选择")
              .fa.fa-trash-o
    .moment-comment-option-container
      .option-box(@click="selectPicture" :class="{'disabled':picturesId.length>0}")
        .fa.fa-picture-o
        span 图片
      .option-box(@click="selectEmoji")
        .fa.fa-smile-o
        span 表情
      .option-box
        .checkbox(v-if="postType === types.comment")
          label
            input(type="checkbox" :value="true" v-model="alsoPost")
            span 同时转发
        .checkbox(v-if="postType === types.repost")
          label
            input(type="checkbox" :value="true" :disabled="disablePostChecked" v-model="alsoPost")
            span 同时评论
      .option-box-right
        span {{remainingWords}}
        button.btn.btn-default.btn-sm(@click="publish" :disabled="disablePostButton" v-if="submitting" title="发表中，请稍候")
          .fa.fa-spinner.fa-spin
        button.btn.btn-default.btn-sm(@click="publish" :disabled="disablePostButton" v-else) 发射
</template>

<style lang="less" scoped>
  .moment-comment-editor{
    @buttonContainerWidth: 4rem;
    @buttonContainerHeight: 3rem;
    .moment-comment-editor-container{
      position: relative;
      min-height: @buttonContainerHeight;
    }
    .moment-comment-pictures-container{
      .pictures{
        margin-bottom: 1rem;
        .picture-item{
          @pictureHeight: 8rem;
          position: relative;
          display: inline-block;
          height: @pictureHeight;
          width: @pictureHeight;
          background-color: #000;
          overflow: hidden;
          margin-right: 0.5rem;
          border-radius: 10px;
          background-size: cover;
          background-position: center;
          .icon-remove{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2rem;
            line-height: 2rem;
            text-align: center;
            background-color: rgba(0, 0, 0, 0.3);
            color: #fff;
            cursor: pointer;
            transition: background-color 100ms;
            &:hover{
              background-color: rgba(0, 0, 0, 0.5);
            }
          }
        }
      }
    }
    .moment-comment-option-container{
      @height: 3rem;
      @paddingRight: 10rem;
      padding-right: @paddingRight;
      position: relative;
      .option-box{
        display: inline-block;
        margin-right: 1rem;
        cursor: pointer;
        .fa{
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }
      }
      .option-box-right{
        height: @height;
        text-align: right;
        top: 0;
        right: 0;
        line-height: @height;
        position: absolute;
        width: @paddingRight;
        button{
          width: 4rem;
        }
        span{
          height: @height;
          line-height: @height;
          margin-right: 1rem;
          font-weight: 700;
          color: #787878;
          &.warning{
            color: red;
          }
        }
      }
      .disabled{
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
</style>

<script>
  import TextareaEditor from '../TextareaEditor';
  import {sweetError} from '../../js/sweetAlert';
  import {immediateDebounce} from "../../js/execution";
  import {getLength} from "../../js/checkData";
  import EmojiSelector from '../EmojiSelector';
  import ResourceSelector from '../ResourceSelector';
  import { getUrl } from '../../js/tools';
  import MomentFiles from './MomentFiles';
  export default {
    props: ['mid', 'type'],
    components: {
      'textarea-editor': TextareaEditor,
      'emoji-selector': EmojiSelector,
      'resource-selector': ResourceSelector,
      'moment-files': MomentFiles,
    },
    data: () => ({
      maxContentLength: 1000,
      content: '',
      picturesId:[],
      alsoPost: false,
      momentCommentId: '',
      submitting: false,
      types: {
        repost: 'repost',
        comment: 'comment'
      },
      disableSavingCount: 0,
    }),
    watch: {
      content: 'onContentChange',
      'picturesId.length': 'onContentChange',
    },
    mounted() {
      this.getMomentComment()
    },
    computed: {
      placeholder() {
        return {
          comment: '发表你的评论',
          repost: '发表你的想法'
        }[this.postType]
      },
      postType() {
        return this.type || this.types.comment; // repost(转发), comment(评论)
      },
      momentId() {
        return this.mid;
      },
      contentLength() {
        return getLength(this.content);
      },
      allowedToPublish() {
        const {contentLength, maxContentLength} = this;
        return contentLength <= maxContentLength;
      },
      remainingWords() {
        const {maxContentLength, contentLength} = this;
        return maxContentLength - contentLength;
      },
      disablePostButton() {
        return this.submitting || (this.type === this.types.comment && this.disablePostChecked);
      },
      disablePostChecked() {
        return this.content.length === 0 && this.picturesUrl.length === 0;
      },
      picturesUrl() {
        const {picturesId} = this;
        const filesUrl = [];
        for(const rid of picturesId) {
          const url = getUrl('resource', rid);
          filesUrl.push(url);
        }
        return filesUrl;
      }
    },
    methods: {
      reset() {
        this.lockAutoSaving(1);
        this.momentCommentId = '';
        this.setTextareaEditorContent('');
        this.picturesId=[];
      },
      lockAutoSaving(num) {
        this.disableSavingCount = num;
      },
      unlockAutoSaving() {
        this.disableSavingCount = 0;
      },
      selectEmoji() {
        const self = this;
        this.$refs.emojiSelector.open(res => {
          const {code} = res;
          self.insertContent(`[${code}]`);
        });
      },
      selectPicture(){
        if(this.picturesId.length>0) return;
        const self= this;
        this.$refs.resourceSelector.open(res => {
          self.picturesId=[...new Set(res.resourcesId)].slice(0, 1);
          self.$refs.resourceSelector.close();
        }, {
          allowedExt: ['picture'],
          countLimit: 1 - self.picturesId.length
        });
      },
      removeFromArr(arr, index) {
        arr.splice(index, 1)
      },
      insertContent(text) {
        this.$refs.textareaEditor.insertContent(text);
      },
      getMomentComment() {
        const {momentId} = this;
        const self = this;
        nkcAPI(`/creation/zone/moment?from=editor&mid=${momentId}`, 'GET')
          .then(res => {
            const {content, momentCommentId,picturesId} = res;
            if(!momentCommentId) return;
            self.content = content;
            self.picturesId = picturesId;
            self.momentCommentId = momentCommentId;
            self.syncTextareaEditorContent();
          })
          .catch(sweetError)
      },
      setTextareaEditorContent(content) {
        this.$refs.textareaEditor.setContent(content);
      },
      syncTextareaEditorContent() {
        this.setTextareaEditorContent(this.content);
      },
      onTextareaEditorContentChange(content) {
        this.content = content;
      },
      onContentChange: immediateDebounce(function() {
        this.saveContent();
      }, 500),
      saveContent(t) {
        const {
          content,
          momentId,
          disableSavingCount,
          momentCommentId,
          picturesId
        } = this;
        const self = this;
        if(disableSavingCount > 0) {
          this.disableSavingCount --;
          return;
        }
        let type;
        if(t) {
          type = t;
        } else {
          type = momentCommentId? 'modify': 'create';
        }
        return nkcAPI(`/creation/zone/moment/${momentId}`, 'POST', {
          type,
          content,
          momentCommentId,
          resourcesId:[...picturesId],
        })
        .then(res => {
          console.log(`动态已自动保存`);
          if(type === 'create') {
            self.momentCommentId = res.momentCommentId;
          }
        })
        .catch(err => {
          screenTopWarning(`动态保存失败：${err.error || err.message || err}`)
        });
      },
      lockPost() {
        this.submitting = true;
      },
      unlockPost() {
        this.submitting = false;
      },
      onClickEnter() {
        this.publish();
      },
      async publish() {
        const self = this;
        const {postType, alsoPost, content, momentId, momentCommentId,picturesId} = this;
        this.lockPost();
        return Promise.resolve()
          .then(() => {
            // if(content.length === 0) throw new Error(`请输入内容`);
            return nkcAPI(`/creation/zone/moment/${momentId}`, 'POST', {
              type: momentCommentId ? 'publish' : 'forward',
              content,
              postType,
              alsoPost,
              momentCommentId,
              resourcesId:[...picturesId]
            })
          })
          .then(res => {
            self.unlockPost();
            self.$emit('published', {
              momentCommentId: res.momentCommentId,
              momentCommentPage: res.momentCommentPage,
              repostMomentId: res.repostMomentId,
            });
            self.reset();
          })
          .catch(err => {
            self.unlockPost();
            sweetError(err)
          });
      }
    }
  }
</script>
