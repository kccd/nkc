<template lang="pug">
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
    padding: 0 10px 10px 10px;
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
import {getUrl} from "../js/tools";
import {emojiGroups} from "../js/emoji";


export default {
  data: () => ({
    multipleSelection: true,
    selected: false,
    statusTimeout: null,
    emojiGroups: emojiGroups,
    selectedGroupName: emojiGroups[0].name,
  }),
  computed: {
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
    selectEmoji(emoji) {
      const {unicode} = emoji;
      this.$emit('select', {
        unicode: unicode,
        url: getUrl('emoji', unicode),
      });
    },
  }
}
</script>