<template>
  <div>
    <img class="avatar" :src="avatarUrl" />
    <a :href="homeUrl" target="_blank">{{username}}</a>
  </div>
</template>

<script>
const tools = new Tools();

export default {
  props: {
    uid: {
      type: String,
      required: true
    }
  },
  data: (() => ({
    username: "",
    avatarUrl: "",
    homeUrl: ""
  })),
  async created() {
    const res = await nkcAPI("/u?uid=" + this.uid, "GET");
    const [user] = res.targetUsers;
    if(!user) {
      this.username = "未知用户";
    }
    this.username = user.username;
    this.avatarUrl = tools.getUrl("userAvatar", user.avatar);
    this.homeUrl = tools.getUrl("userHome", user.uid);
  }
}
</script>

<style scoped>
div {
  vertical-align: middle;
}
.avatar {
  width: 20px;
  height: 20px;
}
</style>