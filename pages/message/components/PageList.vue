<template lang="pug">
  div
    h4 PageList Component
    .list-nav-bar
      .nav-item(
        v-for="l in list"
        :class="{'active': l.id === activeListId}"
        @click="clickNav(l)"
        ) {{l.name}}
    .list-container
      .list-item-container(v-if="activeListId === 'chat'")
        .list-item(v-for="chatData in chatListData") {{chatData.time}}
      .list-item-container(v-if="activeListId === 'user'")
      .list-item-container(v-if="activeListId === 'category'")

</template>


<style lang="less" scoped>
  .list-nav-bar{
    @height: 4rem;
    height: @height;
    user-select: none;
    .nav-item{
      height: @height;
      line-height: @height;
      cursor: pointer;
      width: 33.3%;
      display: inline-block;
      text-align: center;
      &:hover, &:active{
        background-color: #f6f6f6;
      }
      &.active{
        background-color: #f4f4f4;
      }
    }
  }
</style>


<script>
  export default {
    props: ['chatListData', 'userListData', 'categoryListData'],
    data: () => ({
      activeListId: 'chat', // chat, user, category
      list: [
        {
          id: 'chat',
          name: '消息',
        },
        {
          id: 'user',
          name: '联系人',
        },
        {
          id: 'category',
          name: '分组',
        }
      ]
    }),
    methods: {
      clickNav(l) {
        this.activeListId = l.id;
      }
    }
  }
</script>