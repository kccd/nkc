<template lang="pug">
  .user-nav-container
    .user-nav-banner
      img(:src="user.userInfo.banner")
    .user-nav-other
      .user-nav-info
        .user-nav-avatar
          img(:src="user.userInfo.avatar")
        .user-nav-name {{user.userInfo.username}}
        .user-score
          .user-nav-level
            span.user-grade(:style="'color:' + user.userInfo.gradeColor")
              span {{user.userInfo.gradeName}}
              img.grade-icon(:src="user.userInfo.gradeIcon" :title="user.userInfo.gradeName")
          .user-nav-certs {{user.userInfo.certsName}}
        .user-nav-count
          user-score(:scores="user.userInfo.scores" :xsf="user.userInfo.xsf" :sicon="true" :xsficon="user.xsfIcon")
      .user-nav-links
        a(:href="'/u/' + user.uid + '/profile'" target='_blank').col-xs-6.nav-user-link
          .fa.fa-user-circle
          | 我的主页
        a(href="/sticker" target='_blank').col-xs-6.nav-user-link
          .fa.fa-smile-o
          | 我的表情
        a(:href="'/u/' + user.uid + '/profile/subscribe/user'" target='_blank').col-xs-6.nav-user-link
          .fa.fa-smile-o
          | 我的关注
        a(:href="'/m/' + user.userInfo.columnId" target='_blank' v-if="user.userInfo.columnId").col-xs-6.nav-user-link
          .fa.fa-columns
          | 我的专栏
        a(href=`/column/apply` target='_blank' v-else-if="user.uid && user.columnPermission").col-xs-6.nav-user-link
          .fa.fa-columns
          | 开设专栏
        .col-xs-6.nav-user-link(onclick='RootApp.openChatPanel()')
          .fa.fa-envelope-o
          | 消息中心
          .count(v-if="user.newMessageCount && user.newMessageCount > 0") {{user.newMessageCount}}
        a(:href="'/creation/community/draft'" target='_blank').col-xs-6.nav-user-link
          .fa.fa-inbox
          | 社区草稿
          .count(:class="user.userInfo.draftCount? '':'hidden'") {{user.userInfo.draftCount}}
        a(:href="'/u/' + user.uid + '/settings'" target='_blank').col-xs-6.nav-user-link
          .fa.fa-cog
          | 资料设置
        a(:href="'/u/' + user.uid + '/profile/finance?t=all'" target='_blank').col-xs-6.nav-user-link
          .fa.fa-file-text-o
          | 我的账单
        a(href=`/shop/order` target='_blank').col-xs-6.nav-user-link
          .fa.fa-file-text-o
          | 我的订单
        a(href=`/shop/manage/order` target='_blank').col-xs-6.nav-user-link
          .fa.fa-archive
          | 我出售的
        a(href=`/shop/cart` target='_blank').col-xs-6.nav-user-link
          .fa.fa-shopping-cart
          | 购物车
        a(onclick="NKC.methods.logout()" title='不，不要走！' :class="showColumnLink?'col-xs-6':'col-xs-12'").nav-user-link
          .fa.fa-sign-out
          | 退出登录
</template>

<script>
import UserScoresVue from "../../lib/vue/publicVue/userDraw/UserScoresVue";
export default {
  props: ['user'],
  data: () => ({
    showColumnLink: true,
  }),
  mounted() {
    //判断当专栏开启时退出登录不占一行
    if(this.user.userInfo.columnId) {
      this.showColumnLink = true;
    } else if (!this.user.userInfo.columnId && (this.user.uid && this.user.columnPermission)) {
      this.showColumnLink = true;
    } else if(!this.user.userInfo.columnId && (!this.user.uid || !this.user.columnPermission)) {
      this.showColumnLink = false;
    }
  },
  components: {
    "user-score": UserScoresVue,
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.user-nav-container {
  .user-nav-banner {
    height: 11rem;
    width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 100;
    left: 0;
    top: 0;
    img {
      width: 100%;
    }
  }
  .user-nav-other {
    position: absolute;
    z-index: 110;
    top: 0;
    left: 0;
    width: 100%;
    .user-nav-info {
      //height: 8rem;
      background-color: #fff;
      padding-top: 2rem;
      position: relative;
      margin-top: 7rem;
      border-radius: 5px;
      text-align: center;
      margin-bottom: 1rem;
      .user-nav-avatar {
        position: absolute;
        left: 0;
        top: -4rem;
        width: 100%;
        img {
          width: 6rem;
          height: 6rem;
          border-radius: 50%;
          box-sizing: border-box;
          border: 3px solid #fff;
        }
  }
  .user-nav-name {
    color: #282c37;
    font-weight: 700;
    font-size: 1.4rem;
    height: 2rem;
    line-height: 2.5rem;
    overflow: hidden;
    padding: 0 1rem;
    display: -webkit-box;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .user-score {
    line-height: normal;
    .user-nav-level {
      display: inline-block;
      height: 1.5rem;
      line-height: 1.5rem;
      font-size: 1rem;
      .user-grade {
        padding: 2px 5px;
        color: #ffffff;
        border-radius: 2px;
        .grade-icon {
          height: 12px;
          margin-top: -3px;
          margin-left: 4px;
        }
      }
    }
    .user-nav-certs {
      display: inline-block;
      height: 1.5rem;
      line-height: 1.5rem;
      color: #e85a71;
      font-size: 1rem;
    }
  }
  .user-nav-count {
    height: 2rem;
    line-height: 1rem;
    margin-top: 0;
    padding: 0 0.5rem;
    overflow: hidden;
    text-align: center;
    .nkc-score {
      display: inline-block;
      margin-right: 0.5rem;
    }
  }
}
.user-nav-links {
  border-top: 1px solid #eee;
  padding: 1rem;
  .nav-user-link {
    text-decoration: none;
    color: #282c37;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    padding: 0;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: background-color 100ms;
    .fa {
      margin-right: 0.3rem;
      color: #555;
    }
  }
}
  }
    }
</style>
