<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 表情图片
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content(v-if="loading")
      .loading 加载中...
    .module-dialog-content(v-else-if="sticker")
      .sticker-image
        img(:src="getUrl('sticker', sticker.rid)")
      .sticker-info.m-t-05
        img.user-avatar(:src="getUrl('userAvatar', sticker.targetUser.avatar)")
        a(:href="'/u/' + sticker.tUid" target="_blank") {{sticker.targetUser.username}}
        | &nbsp;{{sticker.shared?"分享":"上传"}}于 {{fromNow(sticker.toc)}}
      .sticker-option(v-if="sticker.collected")
        .sticker-info(v-if="uid !== sticker.tUid") 已添加到表情
        .sticker-info(v-if="management").m-t-05
          button.btn.btn-sm.btn-primary.m-r-05(@click="shareSticker" v-if="!sticker.shared && sticker.reviewed && uid === sticker.tUid") 设为共享
          button.btn.btn-sm.btn-primary.m-r-05(@click="moveSticker") 移到最前
          button.btn.btn-sm.btn-danger(@click="removeSticker") 删除
      // 分享审核通过后才能显示
      .sticker-option(v-else-if="sticker.shared && sticker.reviewed")
        button.btn.btn-sm.btn-theme(@click="collection") 添加到表情
      .sticker-warning(v-if="sticker.shared && sticker.reviewed").pre-wrap {{notesAboutUsing}}
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
    text-align: center;
    margin-bottom: 1rem;
    .sticker-image{
      display: inline-block;
      @height: 10rem;
      width: @height;
      height: @height;
      text-align: center;
      line-height: @height;
      //border: 1px solid #eee;
      img{
        max-height: 100%;
        max-width: 100%;
      }
    }
    .sticker-info{
      font-size: 1.1rem;
      .user-avatar{
        height: 1.5rem;
        width: 1.5rem;
        vertical-align: top;
        margin-right: 0.3rem;
        border-radius: 50%;
        margin-top: -1px;
      }
    }
    .sticker-warning{
      margin-top: 0.5rem;
      font-size: 1rem;
      color: #777;
      padding: 0.5rem;
      background-color: #f4f4f4;
    }
    .sticker-option{
      margin-top: 0.5rem;
    }
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";
import {getUrl, fromNow} from "../js/tools";
import {nkcAPI} from "../js/netAPI";
export default {
  data: () => ({
    show: false,
    sticker: "",
    uid: NKC.configs.uid,
    management: false,
    loading: false,
    notesAboutUsing: ''
  }),
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    getUrl: getUrl,
    fromNow: fromNow,
    collection() {
      const self = this;
      nkcAPI(`/sticker`, "POST", {
        type: "collection",
        stickersId: [this.sticker._id]
      })
        .then(function() {
          self.close();
          sweetSuccess("表情已添加");
        })
        .catch(sweetError);
    },
    moveSticker() {
      const {sticker} = this;
      const body = {
        type: "move",
        stickersId: [sticker.collected._id]
      };
      const self = this;
      nkcAPI("/sticker", "POST", body)
        .then(() => {
          self.close();
          window.location.reload();
        })
        .catch(sweetError);
    },
    shareSticker() {
      const {sticker} = this;
      const body = {
        type: "share",
        stickersId: [sticker._id]
      };
      nkcAPI("/sticker", "POST", body)
        .then(() => {
          sweetSuccess("操作成功");
        })
        .catch(sweetError);
    },
    removeSticker() {
      const {sticker} = this;
      const self = this;
      sweetQuestion(`确定要删除表情？`)
        .then(() => {
          const body = {
            type: "delete",
            stickersId: [sticker.collected._id]
          };
          return nkcAPI("/sticker", "POST", body);
        })
        .then(() => {
          self.close();
          window.location.reload();
        })
        .catch(sweetError);
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    submit: function() {
      this.callback(this.data);
    },
    open(rid, management) {
      this.management = !!management;
      this.draggableElement.show();
      this.show = true;
      this.loading = true;
      const self = this;
      nkcAPI(`/sticker/${rid}?t=json`, 'GET')
        .then(data => {
          self.sticker = data.sticker;
          self.loading = false;
          self.notesAboutUsing = data.notesAboutUsing;
        })
        .catch(err => {
          sweetError(err);
          self.close();
        })
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
    },
  }
}
</script>
