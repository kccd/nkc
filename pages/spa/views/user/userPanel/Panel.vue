<template lang="pug">
  .user-banner(@mouseenter="enter()" @mouseleave="leave()").m-b-1
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
    div(v-if="panelPermission && (panelPermission.unBannedUser || panelPermission.bannedUser ||panelPermission.clearUserInfo)" )
      .btn-ban(v-show="showBanBox")
        .fa.fa-ban( title="用户违规？点我！")
        ul
          li(v-if="targetUser && (targetUser.certs.includes('banned') && panelPermission.unBannedUser)")
            a(@click="bannedUser(targetUser.uid, false)") 解除封禁
          li(v-if="targetUser && (targetUser.certs.includes('banned') && panelPermission.bannedUser)")
            a(@click="bannedUser(targetUser.uid, true)") 封禁用户
          li(v-if="panelPermission.hideUserHome && targetUser && targetUser.hidden")
            a(@click="hideUserHome(false,targetUser.uid)")  取消屏蔽用户名片
          li(v-if="panelPermission.hideUserHome && targetUser && !targetUser.hidden")
            a(@click="hideUserHome(true,targetUser.uid)")  屏蔽用户名片
          li.divider(role="separator")
          li(v-if="panelPermission.clearUserInfo")
            a(@click="clearUserInfo(targetUser.uid, 'avatar')") 删除头像
          li(v-if="panelPermission.clearUserInfo")
            a(@click="clearUserInfo(targetUser.uid, 'banner')") 删除背景
          li(v-if="panelPermission.clearUserInfo")
            a(@click="clearUserInfo(targetUser.uid, 'username')") 删除用户名
          li(v-if="panelPermission.clearUserInfo")
            a(@click="clearUserInfo(targetUser.uid, 'description')") 删除简介
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
    background: #fff;
    position: absolute;
    top:0;
    z-index: 1;
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
import {nkcAPI} from "../../../../lib/js/netAPI";
import {screenTopWarning} from "../../../../lib/js/topAlert";
export default {
  // props: ['targetUser'],
  data: () => ({
    uid:null,
    showBanBox:false,
    panelPermission:null,
    targetUser:null,

  }),
  components: {
    "user-scores": UserScoresVue,
    "user-level": UserLevel
  },
  created() {
    this.initData()
    this.getPanelData()
  },
  mounted() {

  },
  methods: {
    getUrl: getUrl,
    //获取uid
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取数据
    getPanelData(){
      const self = this;
      nkcAPI(`/u/${this.uid}/userPanel`,'GET')
      .then(res => {
        this.panelPermission = res.panelPermission
        this.targetUser = res.targetUser
      })
    },
    // 封禁用户,banned:false 解封，true 封禁
    bannedUser(uid, banned) {
      let method = 'PUT';
      if(banned) method = 'DELETE';
      nkcAPI('/u/' + uid + '/banned', method, {})
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data.error||data);
        });
    },
    // 取消屏蔽用户名片，isHidden是否隐藏用户主页
    hideUserHome(isHidden, uid) {
      nkcAPI("/u/" + uid + "/hide", "POST", {setHidden: isHidden})
        .catch(sweetError)
        .then(function() {location.reload()});
    },
    //清楚用户信息，type 类型， 可选：avatar、banner、description、username
    clearUserInfo(uid, type) {
      if(!confirm("该操作不可撤回，确定要执行？")) return;
      nkcAPI("/u/" + uid + "/clear", "POST", {
        type: type
      })
        .then(function() {
          screenTopAlert("删除成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    //鼠标移入
    enter(){
      this.showBanBox = true;
    },
    //鼠标移除
    leave(){
      this.showBanBox = false;
    }

  }
}
</script>
