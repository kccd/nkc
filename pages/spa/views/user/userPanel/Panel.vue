<template lang="pug">
  .user-banner.m-b-1
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
          .account-user-right
            .account-user-name {{targetUser.username}}
              user-level(ref="userLevel" :target-user="targetUser")
            .account-user-certs {{targetUser.info.certsName}}
            .account-user-description {{targetUser.description}}
            .account-user-kcb
              user-scores(ref="userScore")
    .btn-ban
      .fa.fa-ban(data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="用户违规？点我！")
</template>

<style lang="less">
@import "../../../../publicModules/base";
.user-banner {
  height: 13rem;
  position: relative;
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
        .account-user-right{
          display: inline-block;
          margin-left: 2rem;
          .account-user-name {
            font-size: 16px;
            display: inline-block;
            .account-user-level {
              display: inline-block;
            }
          }
          .account-user-certs{
            color: #e85a71;
          }


        }

      }
    }
  }
  .btn-ban{
    width: 50px;
    height: 100px;
    background: #0e0e0e;
    position: absolute;
    top:0;
    .fa-ban{
      color: red;
      background: #fff;
      width: 20px;
      height: 20px;
      text-align: center;
      line-height: 20px;
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
