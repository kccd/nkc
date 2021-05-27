<template lang="pug">
  div.aaa
    h2 Message Component
    PageList(:chatListData="chatListData")
</template>

<style scoped lang="less">

</style>

<script>

  import PageList from './components/PageList.vue';

  export default {
    data: () => ({
      // 页面名称
      pageName: 'list', // list, message, setting
      // 列表名称
      listName: 'chat', // chat, user, category
      // 消息列表
      chatListData: [],
      // 联系人列表
      userListData: [],
      // 分组列表
      categoryListData: []
    }),
    components: {
      PageList
    },
    mounted() {
      const app = this;
      nkcAPI('/message', 'GET')
      .then(data => {
        console.log(data);
        const {userList, friendList, categoryList} = data;
        app.chatListData = userList;
        app.userListData = friendList;
        app.categoryListData = categoryList;
      })
      .catch(sweetError);
    },
    methods: {

    }
  }
</script>