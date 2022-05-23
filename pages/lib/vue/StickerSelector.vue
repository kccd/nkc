<template lang="pug">
  mixin resourcePaging
    .module-ss-paging(v-if="['own', 'share'].includes(type) && paging && paging.buttonValue && paging.buttonValue.length > 1" )
      .paging-button
        a.button.radius-left(title="上一页" @click="changePage('last')")
          .fa.fa-angle-left
        a.button.radius-right(title="下一页" @click="changePage('next')")
          .fa.fa-angle-right
      .paging-button
        span(v-for="(b, index) in paging.buttonValue")
          span(v-if="b.type === 'active'")
            a.button.active(@click="getStickers(b.num)"
              :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
            ) {{b.num+1}}
          span(v-else-if="b.type === 'common'")
            a.button(@click="getStickers(b.num)"
              :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
            ) {{b.num+1}}
          span(v-else)
            a.button ..
      .paging-button(v-if="paging.buttonValue.length").hidden-xs
        span(style="font-size: 1rem;") 跳转到&nbsp;
        input.input.radius-left(type="text" v-model.number="pageNumber")
        a.button.radius-right(@click="fastSelectPage") 确定
  .sticker-selector
    input.hidden(ref='imageInput' @change="selectedLocalFile" type="file" accept="image/gif,image/png,image/jpeg" multiple="multiple")
    .module-ss-header(ref="draggableHandle")
      .module-ss-title 插入表情
      .module-ss-close(@click="close")
        .fa.fa-remove
    .module-ss-body
      .module-ss-types
        .module-ss-type(:class="{'active': type==='own'}" @click="selectType('own')") 我的表情
        .module-ss-type(:class="{'active': type==='share'}" @click="selectType('share')") 共享表情
        .module-ss-type(:class="{'active': type==='emoji'}" @click="selectType('emoji')") Emoji
        .module-ss-type.upload(:class="{'active': type==='upload'}" @click="selectType('upload')") 上传
      +resourcePaging
      .module-ss-stickers
        div(v-if="type === 'emoji'")
          .emoji(v-for="(e, index) in emoji" @click="selectEmoji(e, index)" :key="e")
            img(:src=`getUrl('emoji', e)`)
        div(v-else-if="type === 'upload'")
          .upload-body
            .upload-button
              button.btn.btn-xs.btn-default(@click="selectLocalFile") 选择本地文件
              .checkbox
                label
                  input(type="checkbox" :value="true" v-model="share")
                  span 分享
            .upload-content
              .warning(v-if="!localStickers.length")
                h5 注意事项
                .pre-warp {{notesAboutUploading}}
              .upload-sticker(v-for="s in localStickers")
                .mask
                  span(v-if="s.error" @click="restartUpload(s)") 点击重试
                  span(v-else-if="s.status === 'unUploaded'") 等待上传
                  span(v-else-if="s.status === 'uploading'")
                    span(v-if="s.progress !== 100") {{s.progress}}%
                    span(v-else) 处理中...
                  span(v-else-if="s.status === 'uploaded'") 已上传
                img(:src="s.url")
        div.null(v-else-if="!stickers.length") 空空如也~
        div(v-else)
          .sticker(v-for="s in stickers" @click="selectSticker(s)" :key="s._id" :class="{'share': type === 'share'}")
            img(v-if="s.state === 'usable'" :src=`getUrl('sticker', s.rid)`)
            .mask(v-else-if = 's.state === "inProcess"')
              span 处理中...
            .mask(v-else-if='s.state === "useless"')
              span 处理失败   
            .mask(v-else)
              span 加载中...
          .share-warning(v-if="type === 'share'")
            .pre-wrap {{notesAboutUsing}}
</template>

<style lang="less">
  @import "../../publicModules/base";
  .sticker-selector{
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    z-index: 1050;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #ddd;
    .module-ss-header{
      @height: 3rem;
      height: @height;
      background-color: #f6f6f6;
      position: relative;
      .module-ss-title{
        cursor: move;
        height: @height;
        line-height: @height;
        color: #666;
        padding-left: 1rem;
      }
      .module-ss-close{
        position: absolute;
        right: 0;
        top: 0;
        height: @height;
        width: @height;
        text-align: center;
        cursor: pointer;
        line-height: @height;
        color: #888;
        &:hover{
          background-color: rgba(0,0,0,0.08);
          color: #777;
        }
      }
    }
    .module-ss-body{
      padding: 0.5rem 1rem 0.5rem 1rem;
      .module-ss-types{
        user-select: none;
        .module-ss-type{
          display: inline-block;
          color: @darkGray;
          font-weight: 700;
          margin-right: 0.5rem;
          cursor: pointer;
          &.active{
            color: @primary;
          }
        }
      }
      .module-ss-paging{
        margin-top: 0.2rem;
      }
      .module-ss-stickers{
        font-size: 0;
        margin-top: 0.2rem;
        .share-warning{
          margin-top: 0.5rem;
          color: #555;
          padding: 0.5rem;
          background-color: #f4f4f4;
          font-size: 1rem;
        }
        .null{
          font-size: 1.2rem;
          height: 8rem;
          line-height: 8rem;
          text-align: center;
        }
        .emoji{
          @height: 3rem;
          cursor: pointer;
          display: inline-block;
          height: @height;
          width: @height;
          user-select: none;
          border: 1px solid #aaa;
          margin: 0 0.5rem 0.5rem 0 ;
          img{
            height: 100%;
            width: 100%;
          }
          @media (max-width: 700px) {
            @height: 2.2rem;
            height: @height;
            width: @height;
          }
        }
        .sticker{
          span{
            // font-weight: 700;
            font-size: 1rem;
          }
          @height: 8.2rem;
          overflow: hidden;
          height: @height;
          width: 19%;
          user-select: none;
          cursor: pointer;
          line-height: @height;
          text-align: center;
          display: inline-block;
          margin: 0 1% 0.5rem 0 ;
          border: 1px solid #aaa;
          img{
            max-height: 95%;
            max-width: 95%;
          }
          &.share{
            width: 15.6%;
            height: 7rem;
            line-height: 7rem;
            @media (max-width: 700px) {
              @height: 4.25rem;
              height: @height;
              line-height: @height;
              width: 24%;
            }
          }
          @media (max-width: 700px) {
            @height: 5rem;
            height: @height;
            line-height: @height;
            width: 24%;
          }
        }
        .upload-body{
          .upload-button{
            margin-bottom: 0.5rem;
            height: 2rem;
            line-height: 2rem;
            .checkbox{
              margin: 0 0 0 1rem;
              vertical-align: middle;
              font-size: 1.2rem;
              display: inline-block;
              line-height: 1.4rem;
            }
          }
          .upload-content{
            font-size: 0;
            .warning{
              font-size: 1rem;
              margin-top: 1rem;
              color: #aaa;
            }
            .upload-sticker{
              @height: 8.2rem;
              overflow: hidden;
              height: @height;
              width: 19%;
              cursor: pointer;
              line-height: @height;
              text-align: center;
              display: inline-block;
              margin: 0 1% 0.5rem 0;
              border: 1px solid #aaa;
              position: relative;
              user-select: none;
              img{
                max-height: 100%;
                max-width: 100%;
              }
              @media (max-width: 700px) {
                @height: 5rem;
                height: @height;
                line-height: @height;
                width: 24%;
              }
              .mask{
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.4);
                font-size: 1rem;
                color: #eee;
                span{
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  z-index: 100;
                }
              }
            }
          }
        }
      }
    }
  }
</style>

<script>
  import {getUrl} from "../js/tools";
  import {DraggableElement} from "../js/draggable";
  import {fileToBase64} from "../js/file";
  import {screenTopWarning} from "../js/topAlert";
  import { getSocket } from "../js/socket";
  import { debounce } from "../js/execution";

  const socket = getSocket();
  export default {
    data: () => ({
      draggableElement: null,
      callback: null,

      type: "own",
      pageNumber: "",
      perpage: 20,
      sharePerpage: 24,
      emoji: [],
      share: false,
      localStickers: [],
      stickers: [],
      paging: {},

      notesAboutUploading: '',
      notesAboutUsing: ''
    }),
    mounted() {
      socket.on('fileTransformProcess', debounce(
        (data)=>{
        this.getStickers()
      } ,1000) )
      this.initDraggableElement();
    },
    destroyed(){
      socket.removeListener("fileTransformProcess");
      this.draggableElement && this.draggableElement.destroy();
    },
    methods: {
      getUrl,
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
        this.draggableElement.setPositionCenter();
      },
      selectType(type) {
        this.type = type;
        if(["own", "share"].includes(type)) {
          this.getStickers();
        }
      },
      changePage(type) {
        const paging = this.paging;
        if(paging.buttonValue.length <= 1) return;
        if(type === "last" && paging.page === 0) return;
        if(type === "next" && paging.page + 1 === paging.pageCount) return;
        const count = type === "last"? -1: 1;
        this.getStickers(paging.page + count);
      },
      getStickers(page = 0) {
        const {type} = this;
        if(!["own", "share"].includes(type)) return;
        let url = `/sticker?page=${page}&c=own&reviewed=true&perpage=${this.perpage}`;
        if(type === "share") {
          url = `/stickers?page=${page}&perpage=${this.sharePerpage}`;
        }
        const self = this;
        nkcAPI(url, "GET")
          .then(data => {
            self.stickers = data.stickers;
            self.paging = data.paging;
            self.notesAboutUsing = data.notesAboutUsing;
            self.notesAboutUploading = data.notesAboutUploading;
            if(data.emoji) {
              self.emoji = data.emoji;
            }
          })
          .catch(sweetError);
      },
      fastSelectPage() {
        const pageNumber = this.pageNumber - 1;
        const paging = this.paging;
        if(!paging || !paging.buttonValue.length) return;
        const lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
        if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
        this.getStickers(pageNumber);
      },
      selectSticker(sticker) {
        this.callback({
          type: "sticker",
          data: sticker
        });
      },
      selectEmoji(emojiCode, index) {
        this.callback({
          type: "emoji",
          data: emojiCode
        });
      },
      addLocalFile(file) {
        const self = this;
        this.fileToSticker(file)
          .then(sticker => {
            self.localStickers.push(sticker);
            self.uploadLocalSticker(sticker);
          })
      },
      fileToSticker(file) {
        return new Promise((resolve, reject) => {
          const sticker = {file};
          sticker.status = "unUploaded";
          sticker.progress = 0;
          fileToBase64(file)
            .then(base64 => {
              sticker.url = base64;
              resolve(sticker);
            })
            .catch(reject);
        });

      },
      selectedLocalFile() {
        const input = this.$refs.imageInput;
        const files = input.files;
        const self = this;
        for(let i = 0; i < files.length; i ++) {
          const file = files[i];
          self.addLocalFile(file);
        }
        $(input).val('');

      },
      selectLocalFile() {
        this.$refs.imageInput.click();
      },
      uploadLocalSticker(sticker) {
        const self = this;
        Promise.resolve()
          .then(() => {
            sticker.status = "uploading";
            const formData = new FormData();
            formData.append("file", sticker.file);
            formData.append("type", "sticker");
            formData.append("fileName", sticker.file.name);
            if(self.share) {
              formData.append("share", "true");
            }
            return nkcUploadFile("/r", "POST", formData, function(e, progress) {
              sticker.progress = progress;
            });
          })
          .then(() => {
            sticker.status = "uploaded";
            self.localStickers.splice(self.localStickers.indexOf(sticker), 1);
            if(!self.localStickers.length) self.selectType("own");
          })
          .catch((data) => {
            screenTopWarning(data.error || data);
            sticker.error = data.error || data;
            sticker.status = "unUploaded";
          });
      },
      restartUpload(s) {
        this.uploadLocalSticker(s);
      },
      open(callback) {
        this.callback = callback;
        this.draggableElement.show();
        this.getStickers();
      },
      close() {
        this.draggableElement.hide();
      }
    }
  }
</script>