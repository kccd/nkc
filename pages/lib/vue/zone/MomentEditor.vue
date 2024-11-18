<template lang="pug">
  .moment-editor
    resource-selector(ref="resourceSelector")
    emoji-selector(ref="emojiSelector")
    .content-body
      .textarea-editor-container
        editor-core(ref="editorCore" @content-change="onEditorContentChange" @click-ctrl-enter="onClickEnter")
      .files-container
        .medias(v-if="mediasUrl.length > 0")
          .media-item(v-for="(media, index) in mediasUrl" :style=" media.type==='picture'? `background-image: url(${media.url})` : '' ")
            .icon-remove(@click="removeFromArr(medias, index)" title="取消选择")
              .fa.fa-trash-o
            video(v-if=" media.type==='video' " :src="media.url" :poster="media.cover" controls="controls")
    .buttons-container.m-b-1
      .button-icon(
        @click="selectMedia"
        :class="{'disabled': !allowedToSelectMedia}"
        @mouseover="iconMouseOver(icons.media)"
        @mouseleave="iconMouseLeave(icons.media)"
        title="媒体资源"
        )
        add-picture(
          :theme="icons.media.theme"
          :size="icons.media.size"
          :fill="icons.media.fill"
          )
      .button-icon(
        @click="selectEmoji"
        @mouseover="iconMouseOver(icons.face)"
        @mouseleave="iconMouseLeave(icons.face)"
        title="表情"
        )
        winking-face(
          :theme="icons.face.theme"
          :size="icons.face.size"
          :fill="icons.face.fill"
          )
      .button-icon(
        @click="visitZoneArticleEditor"
        @mouseover="iconMouseOver(icons.article)"
        @mouseleave="iconMouseLeave(icons.article)"
        title="去编辑器"
        )
        newspaper-folding(
          :theme="icons.article.theme"
          :size="icons.article.size"
          :fill="icons.article.fill"
          )
      .button-pull
        span.number(:class="{'warning': remainingWords < 0}") {{remainingWords}}
        button.publish(:class="{'disabled': disablePublish}" v-if="submitting" title="发射中，请稍候")
          .fa.fa-spinner.fa-spin
        button.publish(:class="{'disabled': disablePublish}" v-else-if="disablePublish") 发射
        button.publish(@click="publishContent" v-else) 发射
</template>

<style lang="less" scoped>
  @import '../../../publicModules/base';
  .moment-editor{
    .files-container{
      .videos{
        margin-bottom: 1rem;
        .video-item{
          position: relative;
          overflow: hidden;
          font-size: 0;
          max-width: 70%;
          @media(max-width: 768px) {
            max-width: 100%;
          }
          .icon-remove{
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            height: 3rem;
            z-index: 10;
            width: 3rem;
            font-size: 1.4rem;
            padding: 0 1rem;
            .fa{
              margin-right: 0.2rem;
            }
            line-height: 3rem;
            text-align: center;
            background-color: rgba(0, 0, 0, 0.8);
            transition: background-color 100ms;
            color: #fff;
            &:hover{
              background-color: rgba(0, 0, 0, 1);
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
      .medias{
        margin-bottom: 1rem;
        .media-item{
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
          // .icon-remove{
          //   position: absolute;
          //   bottom: 0;
          //   left: 0;
          //   width: 100%;
          //   height: 2rem;
          //   line-height: 2rem;
          //   text-align: center;
          //   background-color: rgba(0, 0, 0, 0.3);
          //   color: #fff;
          //   cursor: pointer;
          //   transition: background-color 100ms;
          //   &:hover{
          //     background-color: rgba(0, 0, 0, 0.5);
          //   }
          // }
          .icon-remove{
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            height: 2.5rem;
            z-index: 10;
            width: 2.5rem;
            font-size: 1.4rem;
            padding: 0 0.7rem;
            .fa{
              margin-right: 0.2rem;
            }
            line-height: 2.5rem;
            text-align: center;
            background-color: rgba(0, 0, 0, 0.8);
            transition: background-color 100ms;
            color: #fff;
            &:hover{
              background-color: rgba(0, 0, 0, 1);
            }
          }
          video{
            width: 100%;
            height: 100%;
          }
          .play-icon{
            font-size: 3rem;
            color:rgba(0, 179, 255, 0.8);
            position: absolute;
            top: 10rem;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: color 0.2s;
            display: inline-block;
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
    .textarea-editor-container{
      margin-bottom: 1rem;
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
          margin-right: 1rem;
          font-weight: 700;
          color: #787878;
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
  import ResourceSelector from '../ResourceSelector';
  import { getMomentPlainJsonContentLength } from "../../js/checkData";
  import {getUrl} from '../../js/tools';
  import {screenTopWarning} from "../../js/topAlert";
  import {immediateDebounce} from '../../js/execution';
  import {nkcAPI} from '../../js/netAPI';
  import EmojiSelector from '../EmojiSelector';
  import EditorCore from './EditorCore.plain.vue'
  import {visitUrl} from "../../js/pageSwitch";
  import {
    Home as HomeIcon,
    AddPicture,
    VideoTwo,
    WinkingFace,
    NewspaperFolding,
  } from '@icon-park/vue';

  const iconFill = {
    normal: '#555',
    active: '#000'
  };

  export default {
    props: ['published','mid'],
    components: {
      'editor-core': EditorCore,
      'resource-selector': ResourceSelector,
      'emoji-selector': EmojiSelector,
      'home-icon': HomeIcon,
      'add-picture': AddPicture,
      'video-two': VideoTwo,
      'winking-face': WinkingFace,
      'newspaper-folding': NewspaperFolding
    },
    data: () => ({
      submitting: false,
      textareaHeight: '0',
      maxContentLength: 1000,
      maxPictureCount: 9,
      maxVideoCount: 1,
      maxMediaCount: 9,
      momentId: '',
      content: '',
      momentStatus:'',
      picturesId: [],
      videosId: [],
      medias: [],
      files:[],
      icons: {
        image: {
          fill: iconFill.normal,
          size: 22,
          theme: 'outline'
        },
        video: {
          fill: iconFill.normal,
          size: 22,
          theme: 'outline'
        },
        media: {
          fill: iconFill.normal,
          size: 22,
          theme: 'outline'
        },
        face: {
          fill: iconFill.normal,
          size: 22,
          theme: 'outline'
        },
        article: {
          fill: iconFill.normal,
          size: 22,
          theme: 'outline'
        }
      }
    }),
    mounted() {
      this.initData();
    },
    computed: {
      allowedToSelectPicture() {
        const {picturesId, videosId, maxPictureCount} = this;
        return videosId.length === 0 && picturesId.length < maxPictureCount;
      },
      allowedToSelectVideo() {
        const {picturesId, videosId, maxVideoCount} = this;
        return picturesId.length === 0 && videosId.length < maxVideoCount;
      },
      allowedToSelectMedia() {
        const { medias,maxMediaCount} = this;
        return medias.length < maxMediaCount;
      },
      contentLength() {
        const {content} = this;
        return getMomentPlainJsonContentLength(content);
      },
      allowedToPublish() {
        const {contentLength, maxContentLength, momentId} = this;
        return momentId && contentLength <= maxContentLength;
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
      },
      mediasUrl() {
        const { medias } = this;
        const filesUrl = [];
        for (const item of medias) {
          const url = getUrl('resource', item.rid);
          if (item.type === 'video') {
            const cover = getUrl('resource', item.rid, 'cover')
            filesUrl.push({ url, cover, type: item.type });
          } else {
            filesUrl.push({url, type:item.type});
          }
        }
        return filesUrl;
      },
      disablePublish() {
        const {submitting, momentId, content,picturesUrl,videosUrl,medias} = this;
        return submitting || !momentId || (content.length === 0 && medias.length === 0 )
      }
    },
    watch: {
      'picturesId.length': 'onContentChange',
      'videosId.length': 'onContentChange',
      'medias.length': 'onContentChange',
      'content': 'onContentChange'
    },
    methods: {
      visitZoneArticleEditor() {
        visitUrl(`/z/editor/rich`, true);
      },
      iconMouseOver(e) {
        e.fill = iconFill.active;
      },
      iconMouseLeave(e) {
        e.fill = iconFill.normal;
      },
      reset() {
        this.momentId = '';
        this.setEditorContent('');
        this.picturesId = [];
        this.videosId = [];
        this.medias = [];
      },
      initData() {
        const self = this;
        if(!this.mid){
          nkcAPI(`/api/v1/zone/editor/plain`, 'GET')
            .then(res => {
              const {momentId, content, medias} = res.data;
              if(momentId) {
                self.momentId = momentId;
                self.content = content;
                self.syncEditorContent();
                self.medias = medias;
              }
              self.hideEditorLoading();
            })
            .catch(err => {
              sweetError(err);
            });
        }else {
          nkcAPI(`/api/v1/zone/moment/${this.mid}/editor/plain`, 'GET')
            .then(res => {
              const {momentId, content, momentStatus, medias} = res.data;
              if(momentId) {
                self.momentId = momentId;
                self.content = content;
                self.syncEditorContent();
                self.momentStatus = momentStatus
                self.medias = medias;
              }
              self.hideEditorLoading();
            }).catch(err=>{
              sweetError(err,'err')
            })
        }
      },
      lockButton() {
        this.submitting = true;
      },
      unlockButton() {
        this.submitting = false;
      },
      addResourcesId(type, resourcesId) {
        const {maxPictureCount, maxVideoCount} = this;
        // if(type === 'picture') {
        //   const picturesId = [...new Set(this.picturesId.concat(resourcesId))];
        //   this.picturesId = picturesId.slice(0, maxPictureCount);
        // } else {
        //   const videosId = [...new Set(this.videosId.concat(resourcesId))];
        //   this.videosId = videosId.slice(0, maxVideoCount);
        // }
        const temMedia = [...this.medias];
        const readyMedia = []
        for(const rid of resourcesId){
          if(temMedia.findIndex(item=>item.rid===rid)===-1){
            readyMedia.push({
              rid,
              type
            })
          }
        }
        temMedia.push(...readyMedia);
        this.medias= temMedia.slice(0, this.maxMediaCount);
      },
      addResources(resources) {
        const temMedia = [...this.medias];
        const readyMedia = []
        for(const rItem of resources){
          let type = '';
          if(rItem.mediaType === 'mediaVideo'){
            type = 'video';
          } else if(rItem.mediaType === 'mediaPicture'){
            type = 'picture';
          }
          if(temMedia.findIndex(item=>item.rid=== rItem.rid)===-1){
            readyMedia.push({
              rid: rItem.rid,
              type,
            })
          }
        }
        temMedia.push(...readyMedia);
        this.medias= temMedia.slice(0, this.maxMediaCount);
      },
      selectMedia() {
        const self = this;
        if(!this.allowedToSelectMedia) return;
        this.$refs.resourceSelector.open(res => {
          // 后期可以利用回传的对象数据获取type
          self.addResources(res.resources);
          self.$refs.resourceSelector.close();
        }, {
          allowedExt: ['picture','video'],
          countLimit: self.maxMediaCount - self.medias.length
        });
      },
      insertContent(text) {
        return this.$refs.editorCore.insertContent(text);
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
      removeFromArr(arr, index) {
        arr.splice(index, 1)
      },
      publishContent() {
        const self = this;
        const {content, picturesId, videosId, momentId,momentStatus,medias} = this;
        // const resourcesId = picturesId.length > 0? picturesId: videosId;
        const resourcesId = medias.map(item=>item.rid);
        if(momentStatus === 'normal'){
          nkcAPI(`/api/v1/zone/moment/${this.mid}/editor/plain`,'POST',{
            content,
            resourcesId
          }).then((res)=>{
            self.sendPublishedEvent(res.data);
            self.unlockButton();
          }).catch(err=>{
            sweetError(err, 'err');
            self.unlockButton();
          })
        }else {
          nkcAPI(`/api/v1/zone/editor/plain`, 'POST', {
          content,
          resourcesId
        })
          .then(() => {
            self.sendPublishedEvent({
              momentId: momentId,
            });
            self.unlockButton();
          })
          .catch(err => {
            sweetError(err);
            self.unlockButton();
          });
        }
        self.lockButton();
      },
      sendPublishedEvent(data) {
        const newData = {...data,submitting:this.submitting}
        this.$emit('published',newData)
      },
      onEditorContentChange(content) {
        this.content = content;
      },
      setEditorContent(content) {
        this.$refs.editorCore.setContent(content);
      },
      syncEditorContent() {
        this.setEditorContent(this.content);
      },
      hideEditorLoading() {
        this.$refs.editorCore.hideLoading();
      },
      onClickEnter() {
        this.publishContent();
      },
      onContentChange: immediateDebounce(function() {
        this.saveContent();
      }, 1000),
      saveContent() {
        const self = this;
        //暂存的
        const {content, momentId, momentStatus, medias} = this;
        // const resourcesId = picturesId.length > 0? picturesId: videosId;
        const resourcesId =  medias.map(item=>item.rid);
        //判断是否是已发表的电文的编辑
        if(momentStatus === 'normal'){
          nkcAPI(`/api/v1/zone/moment/${this.mid}/editor/plain`,'PUT',{
            content,
            resourcesId
          }).then(()=>{
            console.log('电文自动保存')
          })
            .catch(err=>{
            sweetError(err, 'err')
          })
        }else {
          return nkcAPI(`/api/v1/zone/editor/plain`, 'PUT', {
            content,
            momentId,
            resourcesId
          })
            .then((res) => {
              self.momentId = res.data.momentId;
              console.log(`电文已自动保存`);
            })
            .catch(err => {
              screenTopWarning(`实时保存失败：${err.error || err.message || err}`);
            });
        }
      }
    }
  }
</script>
