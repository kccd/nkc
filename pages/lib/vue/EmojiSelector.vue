<template lang="pug">
  .emoji-selector
    .emoji-header(ref="draggableHandle")
      .emoji-title 表情选择
      .emoji-close(@click="close")
        .fa.fa-remove
    .emoji-form
      .checkbox
        label.m-r-1
          input(type="checkbox" v-model="multipleSelection")
          span 多选模式
        span.text-success(v-if="selected") 已选择

    .emoji-container
      .emoji-item(v-for="(url, index) in emojiUrl" @click="selectEmoji(index)")
        img(:src="url")
</template>
<style lang="less" scoped>
  .emoji-selector{
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
    .emoji-form{
      padding: 0 1rem;
      .checkbox{
        margin-bottom: 0;
        margin-top: 0.5rem;
      }
    }
    .emoji-container{
      padding: 1rem;
      .emoji-item{
        display: inline-block;
        margin: 0 0.5rem 0.5rem 0;
        height: 2rem;
        width: 2rem;
        cursor: pointer;
        border: 1px solid #fff;
        &:hover{
          border-color: #aaa;
        }
        img{
          height: 100%;
          width: 100%;
        }
      }
    }
    .emoji-header{
      height: 3rem;
      cursor: move;
      line-height: 3rem;
      background-color: #f6f6f6;
      position: relative;
      .emoji-title{
        margin-left: 1rem;
        color: #666;
        cursor: move;
      }
      .emoji-close{
        height: 3rem;
        width: 3rem;
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        line-height: 3rem;
        color: #888;
        cursor: pointer;
        &:hover{
          color: #777;
          background-color: #ddd;
        }
      }
    }
  }
</style>
<script>
  import {sweetError} from "../js/sweetAlert";
  import {getUrl} from "../js/tools";
  import {DraggableElement} from "../js/draggable";
  import {localStorageKeys, getFromLocalStorage, saveToLocalStorage} from "../js/localStorage";

  const emojiSelectorKey = localStorageKeys.emojiSelector;

  export default {
    data: () => ({
      callback: null,
      emoji: [],
      multipleSelection: true,
      selected: false,
      statusTimeout: null,
    }),
    watch: {
      multipleSelection() {
        saveToLocalStorage(emojiSelectorKey, {multipleSelection: !!this.multipleSelection});
      }
    },
    mounted() {
      this.initMultipleSelection();
      this.initDraggableElement();
    },
    destroyed(){
      this.draggableElement && this.draggableElement.destroy();
    },
    computed: {
      emojiUrl() {
        const {emoji} = this;
        const url = [];
        for(const e of emoji) {
          url.push(getUrl('emoji', e));
        }
        return url;
      }
    },
    methods: {
      initMultipleSelection() {
        const {
          multipleSelection = true
        } = getFromLocalStorage(emojiSelectorKey);
        this.multipleSelection = multipleSelection;
      },
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
        this.draggableElement.setPositionCenter();

      },
      initData() {
        const self = this;
        nkcAPI(`/sticker`, 'GET')
          .then(res => {
            self.emoji = res.emoji;
          })
          .catch(sweetError);
      },
      show() {
        this.draggableElement.show();
      },
      hide() {
        this.draggableElement.hide();
      },
      open(callback) {
        this.initMultipleSelection();
        const self = this;
        self.callback = callback;
        self.show();
        self.initData();
      },
      close() {
        this.hide();
      },
      selectEmoji(index) {
        const {callback, emoji, emojiUrl} = this;
        if(!callback) return;
        this.callback({
          code: emoji[index],
          url: emojiUrl[index]
        });
        if(!this.multipleSelection){
          this.close();
        } else {
          this.setStatus()
        }
      },
      setStatus() {
        const self = this;
        self.selected = false;
        setTimeout(() => {
          clearTimeout(self.statusTimeout);
          self.selected = true;
          self.statusTimeout = setTimeout(() => {
            self.selected = false;
          }, 1500);
        }, 100)

      }
    }
  }
</script>
