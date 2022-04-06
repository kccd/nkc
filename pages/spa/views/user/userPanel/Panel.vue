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
              user-scores(ref="userScore" :scores="scores" :xsf="targetUser.xsf" )
    div(v-if="panelPermission && (panelPermission.unBannedUser || panelPermission.bannedUser ||panelPermission.clearUserInfo)" )
      .btn-ban(v-show="showBanBox" @click="clickBanContext()")
        .fa.fa-ban( title="用户违规？点我！")
        ul(v-show="showBanContext" )
          li(v-if="targetUser && (targetUser.certs.includes('banned') && panelPermission.unBannedUser)")
            a(@click="bannedUser(targetUser.uid, false)") 解除封禁
          li(v-if="targetUser && (targetUser.certs.includes('banned') && panelPermission.bannedUser)")
            a(@click="bannedUser(targetUser.uid, true)") 封禁用户
          li(v-if="panelPermission.hideUserHome && targetUser && targetUser.hidden")
            a(@click="hideUserHome(false,targetUser.uid)")  取消屏蔽用户名片
          li(v-if="panelPermission.hideUserHome && targetUser && !targetUser.hidden")
            a(@click="hideUserHome(true,targetUser.uid)")  屏蔽用户名片
          li.divider
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
        margin-top: -11rem;
        position: relative;
        .account-user-avatar {
          position: absolute;
          top: 0px;
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
           width: 50%;
           display: inline-block;
           margin-left: 144px;
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
           .account-user-description{
             white-space: nowrap;
             overflow: hidden;
             text-overflow: ellipsis;
           }
           .account-user-kcb{
             display: inline-block;
           }
         }



      }
    }
  }
  .btn-ban{
    //background: #fff;
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
      margin-bottom: 2px;
    }
    ul{
      background: #fff;
      list-style-type: none;
      padding-left: 0;
      margin-left: 2px;
      border-radius: 2px;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
      li{
        padding: 5px 25px 5px 15px;
        a{
          color: #0e0e0e;
          &:hover{
            cursor: pointer;
          }
        }
      }
      .divider{
        height: 1px;
        width: 100%;
        background: #DCDCDC;
        padding: 0;
        margin: 3px 0;
      }
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
import {getState} from "../../../../lib/js/state";
export default {
  props: ['targetUserScores'],
  data: () => ({
    uid: null,
    showBanBox: false,
    panelPermission: null,
    targetUser: null,
    showBanContext: false,
    scores: null
  }),
  components: {
    "user-scores": UserScoresVue,
    "user-level": UserLevel
  },
  created() {
    this.initData()
    this.getPanelData()
    //移动段才能永久显示封禁框
    if(getState && getState.isApp){
      this.showBanBox = true
    }
    this.scores = this.targetUserScores
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
    //点击显示禁止内容
    clickBanContext(){
      this.showBanContext = !this.showBanContext
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
