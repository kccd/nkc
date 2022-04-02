<template lang="pug">
  .sub-users(v-if="sideUsers && sideUsers.length !== 0")
    .panel-header 关注
    .m-b-2
      .user-card-sub-div
        .home-topic-item-div
          .user-card-panel
            .user-card-user-list
              .side-user(
                v-for="(u, index) in sideUsers"
                :data-float-uid="u.uid"
                v-if="index <= 7"
              )
                a(:href="`/u/${u.uid}`" target="_blank")
                  img(:src="getUrl('userAvatar', u.avatar)")
            a(:href="`/u/${targetUser.uid}/p/follower`" v-if="sideUsers.length > 8" ).user-card-user-link 查看更多
</template>
<style lang="less">
.sub-users {
  .panel-header {
    margin: -15px -15px 1rem -15px;
    border-bottom: 1px solid #f4f4f4;
    padding: 0 1rem;
  }
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl} from "../../../../lib/js/tools";
export default {
  data: () => ({
    sideUsers: null,
    targetUser: '',
    uid: null,
  }),
  mounted() {
    this.initData();
    this.getSubUser();
  },
  methods: {
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    getSubUser() {
      const self = this;
      nkcAPI(`/u/${self.uid}/p/subUser`, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.sideUsers = res.targetUserFollowers;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
