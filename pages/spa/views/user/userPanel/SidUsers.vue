<template lang="pug">
  .sub-fans(v-if="sidUsers && sidUsers.length !== 0")
    .panel-header {{title}}
    .m-b-2
      .user-card-sub-div
        .home-topic-item-div
          .user-card-panel
            .user-card-user-list
              .side-user(
                v-for="(u, index) in sidUsers"
                :data-float-uid="u.uid"
                data-global-click="showUserPanel"
                v-if="index <= 7"
              )
                a(:href="`/u/${u.uid}`" target="_blank")
                  img(:src="getUrl('userAvatar', u.avatar)")
            a(:href="`/u/${targetUser.uid}/p/${type}`" v-if="sidUsers.length > 8").user-card-user-link 查看更多
</template>
<style lang="less">

</style>
<script>
import {getUrl} from "../../../../lib/js/tools";
export default {
  props: ['targetUser', 'sidUsers', 'title', 'type'],
  data: () => ({

  }),
  methods: {
    getUrl: getUrl
  }
}
</script>
