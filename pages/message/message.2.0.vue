<template lang="pug">
  div.aaa
    PageList(
      v-if='activePageId === pageId.list'
      :chatListData="chatListData"
      :userListData="userListData"
      :categoryListData="categoryListData"
    )
    PageChat(
      v-if='activePageId === pageId.chat'
    )
</template>

<style scoped lang="less">

</style>

<script>

  import PageList from './components/PageList.vue';
  import PageChat from './components/PageChat.vue';

  export default {
    data: () => ({
      // 页面名称
      activePageId: 'chat', // list, message, setting
      pageList: [
        {
          id: 'list',
          name: '聊天、用户以及分组列表'
        },
        {
          id: 'chat',
          name: '对话列表'
        }
      ],
      // 消息列表
      chatListData: [],
      // 联系人列表
      userListData: [],
      // 分组列表
      categoryListData: []
    }),
    computed: {
      pageId() {
        const obj = {};
        for(const p of this.pageList) {
          obj[p.id] = p.id;
        }
        return obj;
      }
    },
    components: {
      PageList,
      PageChat
    },
    mounted() {
      const app = this;
      nkcAPI('/message', 'GET')
      .then(data => {
        const {userList, friendList, categoryList} = data;
        app.chatListData = userList;
        app.userListData = friendList;
        app.categoryListData = categoryList;
        console.log(data);
        console.log(app.userListData);
        console.log(app.categoryListData);
      })
      .catch(sweetError);
    },
    methods: {

    }
  }
</script>