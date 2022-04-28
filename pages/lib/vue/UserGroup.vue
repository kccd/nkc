<template lang="pug">
  .user-group
    a(v-for="user in usersData" :href="user.userHome" target="_blank" :title="user.username")
      img(:src="user.avatarUrl")
</template>

<style lang="less" scoped>
  .user-group{
    display: inline-block;
    font-size: 0;
    a{
      height: 2.2rem;
      width: 2.2rem;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      margin-right: 0.3rem;
      //margin-left: -0.5rem;
      img{
        height: 100%;
        width: 100%;
      }
    }
    & a:first-child{
      margin-left: 0;
    }
  }
</style>

<script>
export default {
  props: ['users'],
  data: () => ({

  }),
  computed: {
    usersData() {
      const {users} = this;
      return users.map(u => {
        const {avatarUrl, uid, username, userHome} = u;
        return {
          avatarUrl,
          uid,
          username,
          userHome
        };
      })
    }
  }
}
</script>
