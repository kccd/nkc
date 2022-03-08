<template lang="pug">
  .moment-editor
    resource-selector(ref="resourceSelector")
    emoji-selector(ref="emojiSelector")
    .content-body
      textarea-editor(ref="textareaEditor" @content-change="onTextareaEditorContentChange")
      .files-container
        .pictures(v-if="picturesUrl.length > 0")
          .picture-item(v-for="(url, index) in picturesUrl" :style="'background-image: url('+url+')'")
            .icon-remove(@click="removeFromArr(picturesId, index)")
              .fa.fa-trash-o
        .videos(v-if="videosUrl.length > 0")
          .video-item(v-for="(videoUrl, index) in videosUrl")
            .icon-remove(@click="removeFromArr(videosId, index)")
              .fa.fa-trash-o
            video(:src="videoUrl.url" :poster="videoUrl.cover" controls="controls")
    .buttons-container
      .button-icon(@click="selectPicture" :class="{'disabled': videosId.length > 0}")
        .icon.fa.fa-image
        span 图片
      .button-icon(@click="selectVideo" :class="{'disabled': picturesId.length > 0}")
        .icon.fa.fa-file-video-o
        span 视频
      .button-icon(@click="selectEmoji")
        .icon.fa.fa-smile-o.icon-face
        span 表情
      .button-pull
        span.number(:class="{'warning': remainingWords < 0}") {{remainingWords}}
        button.publish(:class="{'disabled': submitting}" v-if="submitting") 发动态
        button.publish(@click="publishContent" v-else) 发动态
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-editor{
    .files-container{
      .videos{
        margin-bottom: 1rem;
        .video-item{
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          font-size: 0;
          .icon-remove{
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            height: 3rem;
            z-index: 10;
            width: 3rem;
            font-size: 1.4rem;
            line-height: 3rem;
            text-align: center;
            background-color: rgba(0, 0, 0, 0.3);
            transition: background-color 100ms;
            border-radius: 50%;
            color: #fff;
            &:hover{
              background-color: rgba(0, 0, 0, 0.5);
            }
          }
          video{
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
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
    position: relative;
    .content-body.ghost{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: -1;
    }
    .content-container{
      margin-bottom: 0.5rem;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 0.5rem;
      textarea{
        min-height: 4rem;
        resize: none;
        overflow: hidden;
        width: 100%;
        border: none;
        font-size: 1.25rem;
        line-height: 2rem;
        border-radius: 0;
        outline: none;
        padding: 0;
        &.ghost{
          //overflow: auto;
        }
      }
    }
    .buttons-container{
      @buttonHeight: 2.5rem;
      @buttonPostWidth: 5rem;
      position: relative;
      padding-right: @buttonPostWidth + 3rem;
      .button-icon{
        height: @buttonHeight;
        border-radius: 50%;
        display: inline-block;
        line-height: @buttonHeight;
        cursor: pointer;
        color: #333;
        margin-right: 1rem;
        .icon{
          font-size: 1.2rem;
          margin-right: 0.3rem;
          color: #333;
          transition: color 100ms;
          &.icon-face{
            font-size: 1.3rem;
          }
        }
        span{
          font-size: 1rem;
          transition: color 100ms;
        }
        &:hover{
          .icon, span{
            color: #000;
          }

        }
        &.disabled{
          cursor: not-allowed;
          .icon{
            color: #aaa;
          }
          span{
            color: #aaa;
          }
        }
      }
      .button-pull{
        position: absolute;
        top: 0;
        right: 0;
        height: @buttonHeight;
        overflow: hidden;
        span.number{
          margin-right: 0.3rem;
          color: #555;
          &.warning{
            color: red;
          }
        }
        button.publish{
          width: @buttonPostWidth;
          border-radius: @buttonHeight / 2;
          height: 100%;
          font-size: 1.2rem;
          background-color: @accent;
          border: none;
          color: #fff;
          &.disabled{
            opacity: 0.7;
            cursor: not-allowed;
          }
        }
      }
    }
  }
</style>

<script>
  import ResourceSelector from './ResourceSelector';
  import {getLength} from '../js/checkData';
  import {getUrl} from '../js/tools';
  import {screenTopWarning} from "../js/topAlert";
  import {debounce} from '../js/execution';
  import {nkcAPI} from '../js/netAPI';
  import EmojiSelector from './EmojiSelector';
  import TextareaEditor from './TextareaEditor';
  export default {
    props: ['published'],
    components: {
      'resource-selector': ResourceSelector,
      'emoji-selector': EmojiSelector,
      'textarea-editor': TextareaEditor
    },
    data: () => ({
      submitting: false,
      textareaHeight: '0',
      maxContentLength: 1000,
      maxPictureCount: 9,
      maxVideoCount: 1,
      momentId: '',
      content: '',
      picturesId: [],
      videosId: [],
    }),
    mounted() {
      this.initData();
    },
    computed: {
      contentLength() {
        const {content} = this;
        return getLength(content);
      },
      allowedToPublish() {
        const {contentLength, maxContentLength} = this;
        return contentLength <= maxContentLength;
      },
      remainingWords() {
        const {maxContentLength, contentLength} = this;
        return maxContentLength - contentLength;
      },
      picturesUrl() {
        const {picturesId} = this;
        const filesUrl = [];
        for(const rid of picturesId) {
          const url = getUrl('resource', rid);
          filesUrl.push(url);
        }
        return filesUrl;
      },
      videosUrl() {
        const {videosId} = this;
        const filesUrl = [];
        for(const rid of videosId) {
          const url = getUrl('resource', rid);
          const cover = getUrl('resource', rid, 'cover')
          filesUrl.push({url, cover});
        }
        return filesUrl;
      }
    },
    watch: {
      'picturesId.length': 'onContentChange',
      'videosId.length': 'onContentChange',
      'content': 'onContentChange'
    },
    methods: {
      initData() {
        const self = this;
        nkcAPI(`/creation/zone/moment?from=editor`, 'GET')
          .then(res => {
            const {momentId, content, picturesId, videosId} = res;
            if(!momentId) return;
            self.momentId = momentId;
            self.content = content;
            self.syncTextareaEditorContent();
            self.picturesId = picturesId;
            self.videosId = videosId;
          })
          .catch(err => {
            sweetError(err);
          });
      },
      lockButton() {
        this.submitting = true;
      },
      unlockButton() {
        this.submitting = false;
      },
      addResourcesId(type, resourcesId) {
        const {maxPictureCount, maxVideoCount} = this;
        if(type === 'picture') {
          const picturesId = [...new Set(this.picturesId.concat(resourcesId))];
          this.picturesId = picturesId.slice(0, maxPictureCount);
        } else {
          const videosId = [...new Set(this.videosId.concat(resourcesId))];
          this.videosId = videosId.slice(0, maxVideoCount);
        }
      },
      selectPicture() {
        const self = this;
        if(self.videosId.length > 0) return;
        const type = 'picture';
        this.$refs.resourceSelector.open(res => {
          self.addResourcesId(type, res.resourcesId);
          self.$refs.resourceSelector.close();
        }, {
          allowedExt: [type],
          countLimit: self.maxPictureCount - self.picturesId.length
        });
      },
      selectVideo() {
        const self = this;
        if(self.picturesId.length > 0) return;
        const type = 'video';
        this.$refs.resourceSelector.open(res => {
          self.addResourcesId(type, res.resourcesId);
          self.$refs.resourceSelector.close();
        }, {
          allowedExt: [type],
          countLimit: self.maxVideoCount - self.videosId.length
        });
      },
      insertContent(text) {
        return this.$refs.textareaEditor.insertContent(text);
      },
      selectEmoji() {
        const self = this;
        this.$refs.emojiSelector.open(res => {
          const {code} = res;
          self.insertContent(`[${code}]`);
        });
      },
      removeFromArr(arr, index) {
        arr.splice(index, 1)
      },
      publishContent() {
        const self = this;
        self.lockButton();
        self
          .saveContent()
          .then(() => {
            return nkcAPI(`/creation/zone/moment`, 'POST', {
              type: 'publish',
              momentId: self.momentId,
            })
          })
          .then(() => {
            // sweetSuccess('发表成功');
            self.sendPublishedEvent();
          })
          .catch(err => {
            self.unlockButton();
            sweetError(err);
          });
      },
      sendPublishedEvent() {
        this.$emit('published')
      },
      onTextareaEditorContentChange(content) {
        this.content = content;
      },
      syncTextareaEditorContent() {
        this.$refs.textareaEditor.setContent(this.content);
      },
      onContentChange: debounce(function() {
        this.saveContent();
      }, 500),
      saveContent() {
        const {content, picturesId, videosId, momentId} = this;
        const self = this;
        const resourcesId = picturesId.length > 0? picturesId: videosId;
        const type = momentId? 'modify': 'create';
        return nkcAPI(`/creation/zone/moment`, 'POST', {
          type,
          momentId,
          content,
          resourcesId
        })
        .then((res) => {
          self.momentId = res.momentId;
          console.log(`动态已自动保存`);
        })
        .catch(err => {
          screenTopWarning(`动态保存失败：${err.error || err.message || err}`);
        });
      }
    }
  }
</script>