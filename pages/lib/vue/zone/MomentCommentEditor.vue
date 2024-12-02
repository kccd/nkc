<template lang="pug">
  .moment-comment-editor
    resource-selector(ref="resourceSelector")
    emoji-selector(ref="emojiSelector")
    .moment-comment-editor-container
      .moment-comment-textaea-ditor-container.m-b-05
        editor-core(
          ref="editorCore"
          :placeholder="placeholder"
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
  import {sweetError} from '../../js/sweetAlert';
  import {immediateDebounce} from "../../js/execution";
  import {getLength} from "../../js/checkData";
  import EmojiSelector from '../EmojiSelector';
  import ResourceSelector from '../ResourceSelector';
  import { getUrl } from '../../js/tools';
  import EditorCore from './EditorCore.plain.vue';
  export default {
    props: ['mid', 'type'],
    components: {
      'editor-core': EditorCore,
      'emoji-selector': EmojiSelector,
      'resource-selector': ResourceSelector,
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
      this.$refs.editorCore.hideLoading();
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
          self.insertContent(JSON.stringify({
            type: 'nkc-emoji',
            attrs: {
              unicode: code,
            }
          }));
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
        this.$refs.editorCore.insertContent(text);
      },
      getMomentComment() {
        const {momentId: parent} = this;
        const self = this;
        nkcAPI(`/api/v1/zone/editor/plain?parent=${parent}`, 'GET')
          .then(res => {
            const {content, momentId, medias} = res.data;
            if(!momentId) return;
            self.content = content;
            self.picturesId = medias.filter(item => item.type === 'picture').map(item => item.rid);
            self.momentCommentId = momentId;
            self.syncTextareaEditorContent();
          })
          .catch(sweetError)
      },
      setTextareaEditorContent(content) {
        this.$refs.editorCore.setContent(content);
      },
      syncTextareaEditorContent() {
        this.setTextareaEditorContent(this.content);
      },
      onTextareaEditorContentChange(content) {
        this.content = content;
      },
      onContentChange: immediateDebounce(function() {
        this.saveContent();
      }, 1000),
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
        return nkcAPI(`/api/v1/zone/editor/plain`, 'PUT', {
          parent: momentId,
          content,
          resourcesId:[...picturesId],
        })
        .then(res => {
          console.log(`动态已自动保存`);
          if(type === 'create') {
            self.momentCommentId = res.data.momentId;
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
        const {postType, alsoPost, content, momentId, picturesId} = this;
        this.lockPost();
        return Promise.resolve()
          .then(() => {
            return nkcAPI(`/api/v1/zone/editor/plain`, 'POST', {
              parent: momentId,
              postType,
              alsoPost,
              content,
              resourcesId:[...picturesId]
            })
          })
          .then(res => {
            self.unlockPost();
            self.$emit('published', {
              momentCommentId: res.data.momentId,
              repostMomentId: res.data.repostMomentId,
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
