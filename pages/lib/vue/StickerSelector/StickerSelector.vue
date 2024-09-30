<template lang="pug">
  draggable-dialog(title="选择表情" width="50rem" height='35rem' heightXS='70%' ref="draggableDialog")
    .sticker-selector-container
      .file-upload-dialog-mask(v-if="showUploadForm")
      .file-upload-dialog(v-if="showUploadForm")
        .upload-warning.text-warning.bg-warning 注意事项：{{notesAboutUploading}}
        input(type="file" multiple="multiple" accept='.jpg,.jpeg,.png,.gif' @change="selectedFiles" :disabled="disableForm")
        .checkbox
          label
            input(type="checkbox" v-model="shareStickerWhenUploading" :disabled="disableForm")
            span 分享
        button.btn.btn-primary.btn-sm.m-r-05(:disabled="files.length === 0 || disableForm" @click="uploadFiles")
          .fa.fa-spinner.fa-spin.m-r-05(v-if="uploading")
          span 提交
          span(v-if="uploading") 中...
          span(v-if="uploading") {{uploadingProgress}}%
        button.btn.btn-default.btn-sm(@click="showUploadForm = false" :disabled="disableForm") 取消
      .sticker-selector-nav
        .sticker-selector-nav-container
          .sticker-selector-nav-item(:class="{'active': type === item.type}" v-for='item of types' @click="selectType(item.type)") {{ item.name }}
        .sticker-selector-nav-option-container(@click="selectFiles")
          <upload-one theme="filled" size="24" fill="#333"/>
          div 上传
      emoji-list(v-if="type === 'emoji'" @select="selectEmoji")
      .sticker-selector-own-sticker-container.m-t-05(v-else)
        .sticker-selector-own-sticker-option-container(v-if="type === 'own'")
          .sticker-selector-option(@click="switchManageSticker") {{manageSticker? '完成': '管理'}}
          .sticker-selector-option(:class="{'disabled': !manageSticker}" @click="selectAllSticker") 全选
          .sticker-selector-option(:class="{'disabled': !manageSticker || selectedStickerId.length === 0}" @click="moveToTop") 移动到最前
          .sticker-selector-option.text-danger(:class="{'disabled': !manageSticker || selectedStickerId.length === 0}" @click="deleteSelectedSticker") 删除
        .sticker-selector-sticker-container(@scroll="onStickerContainerScroll" ref="stickerContainer")
          .sticker-selector-blank(v-if="stickers.length === 0") 空空如也~
          .sticker-selector-sticker.pointer(v-for="s of stickers" :key="s._id" @click="clickSticker(s)")
            .sticker-selector-management(v-if="manageSticker")
              input(type="checkbox" :value="s._id" v-model="selectedStickerId")
            .sticker-selector-sticker-state(v-if="s.state === 'inProcess'")
              .fa.fa-spinner.fa-spin
              div 处理中
            .sticker-selector-sticker-state.pointer(v-else-if="s.state === 'useless'" @click="showUselessInfo(s.reason)")
              .fa.fa-info-circle
              div 处理失败
            img(:src=`getUrl('sticker', s.rid)` v-else)
</template>

<script>
import DraggableDialog from '../DraggableDialog/DraggableDialog.vue';
import {getUrl} from "../../js/tools";
import {UploadOne} from "@icon-park/vue";
import EmojiList from '../EmojiList.vue';
import { getSocket } from "../../js/socket";
import {nkcAPI} from "../../js/netAPI";
import {sweetInfo, sweetError} from "../../js/sweetAlert";
import { getFromLocalStorage, localStorageKeys, saveToLocalStorage } from "../../js/localStorage";
import { debounce } from "../../js/execution";
const socket = getSocket();

export default {
  components: {
    'draggable-dialog': DraggableDialog,
    'upload-one': UploadOne,
    'emoji-list': EmojiList,
  },
  data: () => ({
    type: 'emoji',  // own, share, emoji,
    stickers: [],
    paging: {
      page: 0,
    },
    perPage: 64,
    notesAboutUsing: '',
    notesAboutUploading: '',
    callback: null,
    manageSticker: false,
    showUploadForm: false,
    shareStickerWhenUploading: false,
    uploading: false,
    uploadingProgress: 0,
    getting: false,
    selectedStickerId: [],
    files: [],
    types: [
      {
        type: 'emoji',
        name: '默认'
      },
      {
        type: 'own',
        name: '收藏',
      },
      {
        type: 'share',
        name: '共享'
      }

    ]
  }),
  watch: {
    shareStickerWhenUploading() {
      this.setShareStickerState();
    }
  },
  computed: {
    disableForm() {
      return this.uploading;
    },
    stickersObj() {
      const obj = {};
      for(const s of this.stickers) {
        obj[s._id] = s;
      }
      return obj;
    }
  },
  mounted() {
    this.getShareStickerState();
    socket.on('fileTransformProcess', debounce(
      ()=>{
        this.getStickers()
      } ,1000) )
  },
  methods: {
    open(callback) {
      this.callback = callback;
      this.getStickers();
      this.$refs.draggableDialog.open();
    },
    close() {
      this.$refs.draggableDialog.close();
    },
    getShareStickerState() {
      const {share = false} = getFromLocalStorage(localStorageKeys.shareStickerWhenUploading);
      this.shareStickerWhenUploading = share;
    },
    setShareStickerState() {
      saveToLocalStorage(localStorageKeys.shareStickerWhenUploading, {
        share: this.shareStickerWhenUploading
      });
    },
    getUrl: getUrl,
    selectType(type) {
      this.type = type;
      this.stickers = [];
      if(this.$refs.stickerContainer) {
        this.$refs.stickerContainer.scrollTop = 0;
      }
      this.getStickers();
    },
    clickSticker(sticker) {
      if(this.manageSticker) {
        // 管理表情
        const stickerIndex = this.selectedStickerId.indexOf(sticker._id);
        if(stickerIndex !== -1) {
          this.selectedStickerId.splice(stickerIndex, 1);
        } else {
          this.selectedStickerId.push(sticker._id);
        }

      } else {
        this.selectSticker(sticker);
      }
    },
    selectSticker(sticker) {
      this.callback({
        type: "sticker",
        data: sticker
      });
    },
    selectEmoji(res) {
      const {unicode} = res;
      this.callback({
        type: "emoji",
        data: unicode
      });
    },
    selectedFiles(e) {
      const files = e.target.files;
      const newFiles = [];
      for(let i = 0; i < files.length; i++) {
        newFiles.push(files[i]);
      }
      this.files = newFiles;
    },
    selectFiles() {
      this.showUploadForm = true;
    },
    showUselessInfo(info) {
      sweetInfo(info);
    },
    onStickerContainerScroll(e) {
      const element = e.target;
      if(element.scrollHeight - element.scrollTop === element.clientHeight && !this.getting) {
        this.getStickers(this.paging.page + 1);
      }
    },
    async uploadFiles() {
      const self = this;
      try{
        this.uploading = true;
        for(const file of this.files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'sticker');
          formData.append('fileName', file.name);
          if(this.shareStickerWhenUploading) {
            formData.append('share', "true");
          }
          const url = '/r';
          await nkcUploadFile(url, "POST", formData, function(e, progress) {
            self.uploadingProgress = progress;
          });
        }
        setTimeout(() => {
          this.showUploadForm = false;
          this.files = [];
          this.selectType('own');
          this.getStickers();
          this.uploading = false;
        }, 1000)
      } catch(err) {
        sweetError(err);
        this.uploading = false;
      }
    },
    switchManageSticker() {
      this.manageSticker = !this.manageSticker;
    },
    getStickers(page = 0) {
      let {type: typeBK} = this;
      if(!["own", "share"].includes(typeBK)) {
        typeBK = 'own'
      }
      let url = `/sticker?page=${page}&c=own&reviewed=true&perpage=${this.perPage}`;
      if(typeBK === "share") {
        url = `/stickers?page=${page}&perpage=${this.perPage}`;
      }
      const self = this;
      this.getting = true;
      nkcAPI(url, "GET")
        .then(data => {
          if(page === 0) {
            self.stickers = data.stickers;
          } else {
            self.stickers = self.stickers.concat(data.stickers);
          }
          self.paging = data.paging;
          self.notesAboutUsing = data.notesAboutUsing;
          self.notesAboutUploading = data.notesAboutUploading;
          if(data.emoji) {
            self.emoji = data.emoji;
          }
        })
        .catch(sweetError)
        .finally(() => {
          self.getting = false;
        })
    },
    deleteSelectedSticker() {
      if(!this.manageSticker || this.selectedStickerId.length === 0) return;
      return sweetQuestion('删除操作无法撤销，确定要执行吗？')
        .then(() => {
          return nkcAPI('/sticker', 'POST', {
            type: 'delete',
            stickersId: this.selectedStickerId
          });
        })
        .then(() => {
          this.stickers = this.stickers.filter(s => !this.selectedStickerId.includes(s._id));
          this.selectedStickerId = [];
        })
        .catch(sweetError);
    },
    moveToTop() {
      if(!this.manageSticker || this.selectedStickerId.length === 0) return;
      nkcAPI('/sticker', 'POST', {
        type: 'move',
        stickersId: this.selectedStickerId,
      })
        .then(() => {
          const newStickers = this.stickers.filter(s => !this.selectedStickerId.includes(s._id));
          for(const id of this.selectedStickerId.reverse()) {
            newStickers.unshift(this.stickersObj[id]);
          }
          this.stickers = newStickers;
          this.selectedStickerId = [];
        })
        .catch(sweetError);
    },
    selectAllSticker() {
      if(!this.manageSticker) return;
      const allId = this.stickers.map(s => s._id);
      for(const id of allId) {
        if(!this.selectedStickerId.includes(id)) {
          // 到这里，说明存在未被选择的表情ID
          this.selectedStickerId = [...allId];
          return;
        }
      }

      this.selectedStickerId = [];
    }
  },
  destroyed() {
    socket.removeListener("fileTransformProcess");
  }
}
</script>

<style lang="less" scoped>
.sticker-selector-blank{
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555;
}
.sticker-selector-management{
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255,255,255,0.5);
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  input{
    margin: 0;
  }
}
.sticker-selector-own-sticker-container{
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.upload-warning{
  border: 1px solid #eee;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 5px;
}
.file-upload-dialog-mask{
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.2);
}
.file-upload-dialog{
  border-radius: 5px;
  padding: 1rem;
  background-color: #fff;
  position: absolute;
  width: 30rem;
  max-width: 100%;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  margin: auto;
}
.sticker-selector-own-sticker-option-container{
  display: flex;
  height: 3rem;
  padding: 0 1rem;
  align-items: center;

}
.sticker-selector-option{
  margin-right: 1rem;
  cursor: pointer;
  &.disabled{
    opacity: 0.7;
  }
}
.sticker-selector-sticker-container{
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
  align-content: flex-start;
  padding: 0 0.5rem 0.5rem 0.5rem;
  margin-top: 0.5rem;
  .sticker-selector-sticker{
    height: 5rem;
    width: 5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    img{
      max-width: 100%;
      max-height: 100%;
    }
    .sticker-selector-sticker-state{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      position: absolute;
      background-color: #eee;
      font-size: 1rem;
      color: #777;
      .fa{
        font-size: 1.32rem;
        margin-bottom: 0.5rem;
      }
    }
  }
}

.sticker-selector-container{
  background-color: #fff;
  user-select: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}
.sticker-selector-nav{
  display: flex;
  justify-content: space-between;
}
.sticker-selector-nav-option-container{
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  div{
    margin-left: 0.3rem;
  }
}
.sticker-selector-nav-container{
  padding: 0 0.5rem;
  height: 3rem;
  display: flex;
  margin-top: 0.5rem;
  .sticker-selector-nav-item{
    height: 100%;
    padding: 0 1rem;
    align-items: center;
    display: flex;
    background-color: #f4f4f4;
    border-radius: 10px;
    margin-right: 0.5rem;
    cursor: pointer;
    &:hover, &:active{
      background-color: #eee;
    }
    &.active{
      //background-color: #2b90d9;
      //color: #fff;
      color: #2b90d9;
    }
  }
}
</style>