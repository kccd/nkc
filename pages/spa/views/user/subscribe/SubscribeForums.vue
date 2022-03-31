<template lang="pug">
  .home-subscribe-forum
    .account-forum-categories.paging-button(v-if="" )
      a.button.radius-left(
        :class="!t?'active':''"
        :href="`/u/${targetUser.uid}/profile/subscribe/forum`"
        data-type="reload"
      ) 全部
      .forum-categories-list(v-for="(c,index) in forumCategories")
        a.button(
          :class="{'active': t === c._id?'active':'', 'radius-right': index + 1 === forumCategories.length}"
          :href="`/u/${targetUser.uid}/profile/subscribe/forum?t=${c._id}`"
          data-type="reload"
        ) {{c.name}}
</template>
<style lang="less">
@import "../../../../publicModules/base";

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: '',
    forums: [],
    forumCategories: [],
    t: null,
    targetUser: null,
  }),
  components: {

  },
  mounted() {
    this.initData();
    this.getForums();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户关注的专业列表
    getForums() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/subscribe/thread`, 'GET')
      .then(res => {
        // self.forumCategories = res.forumCategories;
        // self.targetUser = res.targetUser;
        // console.log(self.targetUser);
        // self.forums = res.forums;
        // self.t = res.t;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
