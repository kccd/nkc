<template lang="pug">
  draggable-dialog(title="Emoji 表情" width="50rem" height='35rem' heightXS='70%' ref="draggableDialog")
    .emoji-selector-container
      .emoji-selector-nav-container
        .emoji-selector-nav-item(
          v-for="item in emojiGroups"
          @click="selectGroup(item.name)"
          :class="{'active': selectedGroupName === item.name}"
          ) {{ item.name }}
      .emoji-selector-image-container
        .emoji-selector-image-item(
          v-for="emoji in selectedGroup.emoji"
          @click="selectEmoji(emoji)"
          :key="emoji.unicode"
          :class="{'bg-info': selectedEmoji.includes(emoji)}"
          :title="emoji.tts"
          )
          img(:src="getUrl('emoji', emoji.unicode)")


</template>
<style lang="less" scoped>
  .emoji-selector-container{
    background-color: #fff;
    user-select: none;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
    .emoji-selector-nav-container{
      flex-shrink: 0;
      display: flex;
      overflow-x: auto; /* 允许水平滚动 */
      white-space: nowrap; /* 防止子元素换行 */
      padding: 0.4rem 0;
      background-color: #fefefe;
      height: 4rem;
      .emoji-selector-nav-item{
        cursor: pointer;
        flex: 0 0 auto; /* 子元素不会缩小，保持原始宽度 */
        padding: 0 1rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #eee;
        &:active{
          background-color: #f4f4f4;
        }
        &.active{
          color: #2b90d9;
        }
        &:last-child{
          border-right: none;
        }
      }
    }
    .emoji-selector-image-container{
      max-height: 100%;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap; /* 允许子元素换行 */
      justify-content: flex-start; /* 子元素按顺序从左到右排列 */
      gap: 10px; /* 子元素之间的间距 */
      padding: 10px;
      .emoji-selector-image-item{
        height: 2.8rem;
        width: 2.8rem;
        cursor: pointer; /* 鼠标移上去时显示为手型 */
        &:active, &:hover{
          background-color: #eee;
        }
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
  import {localStorageKeys, getFromLocalStorage, saveToLocalStorage} from "../js/localStorage";
  import {emojiGroups} from "../js/emoji";
  import DraggableDialog from './DraggableDialog/DraggableDialog.vue';

  const emojiSelectorKey = localStorageKeys.emojiSelector;

  export default {
    data: () => ({
      callback: null,
      emoji: [],
      multipleSelection: true,
      selected: false,
      statusTimeout: null,
      emojiGroups: emojiGroups,
      selectedGroupName: emojiGroups[0].name,
      selectedEmoji: [],
      debug: false,
    }),
    components: {
      'draggable-dialog': DraggableDialog,
    },
    watch: {
      multipleSelection() {
        saveToLocalStorage(emojiSelectorKey, {multipleSelection: !!this.multipleSelection});
      }
    },
    mounted() {
      this.initMultipleSelection();
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
      },
      emojiGroupsObject() {
        const obj = {};
        for(const item of emojiGroups) {
          obj[item.name] = item;
        }
        return obj;
      },
      selectedGroup() {
        return this.emojiGroupsObject[this.selectedGroupName];
      }
    },
    methods: {
      getUrl: getUrl,
      selectGroup(groupName) {
        this.selectedGroupName = groupName;
      },
      initMultipleSelection() {
        const {
          multipleSelection = true
        } = getFromLocalStorage(emojiSelectorKey);
        this.multipleSelection = multipleSelection;
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
        this.$refs.draggableDialog.open();
      },
      hide() {
        this.$refs.draggableDialog.close();
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
      selectEmoji(emoji) {
        const {unicode} = emoji;
        if(this.debug) {
          // 开发模式
          if(this.selectedEmoji.length === 0) {
            // 选择第一个表情
            this.selectedEmoji.push(emoji);
          } else if(!this.selectedEmoji.includes(emoji)) {
            // 第二个表情
            const emoji_1 =  this.selectedEmoji[0];
            const emoji_2 = emoji;
            const group = this.selectedGroup;
            const index_1 = group.emoji.indexOf(emoji_1);
            const index_2 = group.emoji.indexOf(emoji_2);
            group.emoji[index_1] = emoji_2;
            group.emoji[index_2] = emoji_1;

            this.selectedEmoji = [];

            console.log(JSON.stringify(group.emoji));
          }
        }

        const {callback} = this;
        if(!callback) return;
        this.callback({
          code: unicode,
          url: getUrl('emoji', unicode),
        })
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
