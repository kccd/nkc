<template lang="pug">
  .user-panel.m-b-1
    .hidden-user-home-tip(v-if="targetUser && targetUser.hidden" )
      span 用户名片已被屏蔽
      //用户名片
    .account-nav(v-if="targetUser" )
      //用户banner
      .account-user-banner-container
        .account-user-banner
          a(:href="getUrl('userBanner', targetUser.banner)")
            img(:src="getUrl('userBanner', targetUser.banner)")
        .account-user-info
          .account-user-avatar
            a(:href="getUrl('userAvatar', targetUser.avatar, 'lg')" target="_blank").user-avatar
              img(:src="getUrl('userAvatar', targetUser.avatar)")
          .account-user-name {{targetUser.username}}
            user-level(ref="userLevel" :target-user="targetUser")
          .account-user-certs {{targetUser.info.certsName}}
          .account-user-description {{targetUser.description}}
          .account-user-kcb
            user-scores(ref="userScore")
</template>

<style lang="less">
@import "../../../../publicModules/base";
.user-panel {
  height: 13rem;
  .hidden-user-home-tip {
  }
  .account-nav {
    .account-user-banner-container {
      .account-user-banner {
        img {
          width: 100%;
          height: 13rem;
        }
      }
      .account-user-info {
        margin-top: -10rem;
        .account-user-avatar {
          display: inline-block;
          margin-left: 2rem;
          img {
            width: 8rem;
            height: 8rem;
            border-radius: 50%;
            box-sizing: border-box;
            border: 3px solid #fff;
          }
        }
        .account-user-name {
          display: inline-block;
        }

        .account-user-level {
          display: inline-block;
        }
      }
    }
  }
}
</style>
<script>
import {getUrl} from "../../../../lib/js/tools";
import UserScoresVue from "../../../../lib/vue/publicVue/userDraw/UserScoresVue";
import UserLevel from "./UserLevel";
export default {
  props: ['targetUser'],
  data: () => ({
  }),
  components: {
    "user-scores": UserScoresVue,
    "user-level": UserLevel
  },
  created() {
  },
  mounted() {
  },
  methods: {
    getUrl: getUrl,
  }
}
</script>
