<template lang="pug">
  .emoji-selector
    .emoji-header(ref="draggableHandle") Head
    .emoji-container
      .emoji-item(v-for="(url, index) in emojiUrl" @click="selectEmoji(index)")
        img(:src="url")
</template>
<style lang="less" scoped>
  .emoji-selector{
    .emoji-container{
      .emoji-item{
        display: inline-block;
        margin: 0 0.5rem 0.5rem 0;
        height: 2rem;
        width: 2rem;
        img{
          height: 100%;
          width: 100%;
        }
      }
    }
  }
</style>
<script>
  import {sweetError} from "../js/sweetAlert";
  import {getUrl} from "../js/tools";
  import {DraggableElement} from "../js/draggable";

  export default {
    data: () => ({
      callback: null,
      emoji: []
    }),
    mounted() {
      this.initDraggableElement();
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
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      },
      initData() {
        const self = this;
        nkcAPI(`/sticker`, 'GET')
          .then(res => {
            self.emoji = res.emoji;
          })
          .catch(sweetError);
      },
      open(callback) {
        const self = this;
        self.callback = callback;
        self.initData();
      },
      selectEmoji(index) {
        const {callback, emoji, emojiUrl} = this;
        if(!callback) return;
        this.callback({
          code: emoji[index],
          url: emojiUrl[index]
        });
      }
    }
  }
</script>
