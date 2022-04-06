<template lang="pug">
  .sub-fans(v-if="sideFans && sideFans.length !== 0")
    .panel-header 粉丝
    .m-b-2
      .user-card-sub-div
        .home-topic-item-div
          .user-card-panel
            .user-card-user-list
              .side-user(
                v-for="(u, index) in sideFans"
                :data-float-uid="u.uid"
                v-if="index <= 7"
              )
                a(:href="`/u/${u.uid}`" target="_blank")
                  img(:src="getUrl('userAvatar', u.avatar)")
            a(:href="`/u/${targetUser.uid}/p/follower`" v-if="sideFans.length > 8").user-card-user-link 查看更多

</template>
<style lang="less">
.sub-fans {
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
    sideFans: null,
    targetUser: null,
  }),
  mounted() {
    this.initData();
    this.getFans();
  },
  methods: {
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    getFans() {
      const self = this;
      nkcAPI(`/u/${self.uid}/p/fan`, 'GET')
      .then(res => {
        self.sideFans = res.targetUserFans;
        self.targetUser = res. targetUser;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  },
}
</script>
