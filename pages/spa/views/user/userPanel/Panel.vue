<template lang="pug">
  .container-fluid.max-width
    .user-banner(@mouseenter="enter()" @mouseleave="leave()" v-if="targetUser").m-b-1
      subscribe-types(ref="subscribeTypes")
      .hidden-user-home-tip(v-if="targetUser && targetUser.hidden" )
        span 用户名片已被屏蔽
        //用户名片
      .account-banner(v-if="targetUser" )
        //用户banner容器
        .account-user-banner-container
          .account-user-banner(:style="`backgroundImage: url('${getUrl('userBanner', targetUser.userBanner)}')`" data-global-click="viewImage" :data-global-data="objToStr({url: getUrl('userBanner', targetUser.banner)})")
            .account-user-info
              .account-user-avatar
                img(:src="getUrl('userAvatar', targetUser.avatar)" data-global-click="viewImage" :data-global-data="objToStr({url: getUrl('userAvatar', targetUser.avatar)})")
              .account-user-introduce
                .account-user-name {{targetUser.username}}
                  user-level(ref="userLevel" :target-user="targetUser")
                .account-user-subscribe(v-if="subscribeBtn" ref="subscribeBox")
                  div(:class="subscribeBtnType ? 'cancel' : 'focus'" @click.stop="userFollowType(targetUser.uid)") {{subscribeBtnType ? '取关' : '关注' }}
                  div.link(@click.stop="toChat(targetUser.uid)" v-if="selfUid") 私信
                  div.link(onclick="RootApp.openLoginPanel()" v-else-if="!selfUid") 私信
                  //div(v-if="usersBlUid.indexOf(targetUser.uid,1) === -1" ) 加入黑名单
                  //div(v-else-if="usersBlUid.indexOf(targetUser.uid,1) !== -1") 移除黑名单
                .fa(:class="subscribeBtnBoxType ? 'fa-angle-up' : 'fa-angle-down'" @click.stop="subscribeBtnBoxChange(!subscribeBtnBoxType)")
          .account-nav
            .account-nav-box
              .account-nav-left
              .account-nav-middle
                span(@click="containerChange('moment')" :class="{'active': $route.name === 'moment'}") 动态
                span(@click="containerChange('post')" :class="{'active': $route.name === 'post'}") 社区
                span(@click="containerChange('column')" :class="{'active': $route.name === 'column'}") 专栏
                span(@click="containerChange('follower')" :class="{'active': ($route.name === 'follower' || $route.name === 'fan')}") 关注
              .account-nav-right
                .sub-item(@click="containerChange('follower')")
                  div 关注
                  span {{followersCount >= 1000 ? (followersCount/1000).toFixed(1)+'K' : followersCount}}
                .sub-item(@click="containerChange('fan')")
                  div 粉丝
                  span {{fansCount >= 1000 ? (fansCount/1000).toFixed(1)+'K' : fansCount}}

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

<style lang="less" scoped>
@import "../../../../publicModules/base";
@media (max-width: 991px){
  .account-nav{
    visibility: hidden;
  }
}
.user-banner {
  height: auto;
  position: relative;
  .hidden-user-home-tip {
  }
  .account-banner {
    background-color: #fff;
    width: 100%;
    border-radius: 3px;
    overflow: hidden;
    .account-user-banner-container {
      .account-user-banner {
        width: 100%;
        height: 14rem;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        position: relative;
        .account-user-info {
          position: relative;
          height: auto;
          top: 8rem;
          margin: 0rem 4rem 0 4rem;
          @media (max-width: 991px){
            margin: 0rem 1rem;
          }
          .account-user-avatar {
            position: absolute;
            top: 0;
            border-radius: 1rem;
            img {
              width: 10rem;
              height: 10rem;
              border: 4px solid #fff;
              border-radius: 8%;
              @media (max-width: 991px){
                width: 8rem;
                height: 8rem;
              }
            }
          }
          .account-user-introduce {
            margin: 0 0 0 11rem;
            .fa{
              display: none;
            }
            @media (max-width: 991px){
              margin: 0 0 0 9rem;
              .fa{
                display: block;
              }
              .fa-angle-down{
                position: absolute;
                top: 36px;
                right: 2.5rem;
                font-size: 2rem;
                &::before {
                  content: "\f107";
                }

              }
              .fa-angle-up{
                position: absolute;
                top: 6rem;
                right: 2.5rem;
                font-size: 2rem;
                &:before {
                  @media (max-width: 991px){
                    content: "\f106";
                  }
                }
              }
            }
            .account-user-name{
              font-size: 20px;
              font-weight: bold;
              @media (max-width: 991px){
                font-size: 16px;
                font-weight: bold;
              }
            }
            .account-user-subscribe{
              position: absolute;
              top: 0;
              right: 0;
              height: 3rem;
              overflow: hidden;
              div{
                display: inline-block;
                text-align: center;
                background: #fff;
                width: auto;
                border: 1px solid #ccc;
                border-radius: 5px;
                cursor:pointer;
                padding: 0.5rem 1rem;
                margin-right: 1rem;
                @media (max-width: 991px){
                  display: block;
                  margin-bottom: 0.5rem;
                }
              }
              .focus{
                background-color: #2b90d9;
                color: #fff;
              }
              .cancel{
                background-color: #e85a71;
                color: #fff;
              }
            }

          }
        }
      }

      .account-nav {
        width: 100%;
        height: 46px;
        .account-nav-box{
          .account-nav-left{
            width: 25%;
            display: inline-block;
          }
          .account-nav-middle{
            width: 58%;
            padding-left: 15px;;
            display: inline-block;
            font-size: 20px;
            font-weight: bold;
            position: relative;
            top: -8px;
            cursor: pointer;
            span{
              display: inline-block;
              padding: 0 30px 0 0;
              &.active {
                color: #2b90d9;
              }
            }
          }
          .account-nav-right{
            width: 17%;
            display: inline-block;
            padding-left: 15px;
            text-align: center;
            .sub-item{
              display: inline-block;
              margin: 3px 15px 0 15px;
              font-weight: bold;
              font-size: 12px;
              cursor: pointer;
              div {

              }
              span{
                font-size: 18px;
              }
            }
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
  .user-account {
    .account-left {
      .user-avatar {
        img {
          width: 8rem;
          height: 8rem;
          border: 4px solid #fff;
          border-radius: 8%;
        }
      }
      .user-info {

      }
    }
  }
}
</style>
<script>
import {getUrl} from "../../../../lib/js/tools";
import UserLevel from "./UserLevel";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {screenTopWarning} from "../../../../lib/js/topAlert";
import {getState} from "../../../../lib/js/state";
import {objToStr} from "../../../../lib/js/tools";
import {subUsers} from "../../../../lib/js/subscribe";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import {EventBus} from "../../../eventBus";

export default {
  props: ['targetUserScores', "fansCount",  "followersCount"],
  data: () => ({
    uid: null,
    selfUid: getState().uid,
    showBanBox: false,
    panelPermission: null,
    targetUser: null,
    showBanContext: false,
    subscribeBtn: false,
    subscribeBtnType: false,
    subscribeBtnBoxType: false,
    usersBlUid: [],

  }),
  components: {
    "user-level": UserLevel,
    "subscribe-types": SubscribeTypes,
  },
  created() {
    this.initData()
    this.getPanelData()
    //移动段才能永久显示封禁框
    if(getState && getState.isApp){
      this.showBanBox = true;
    }
    EventBus.$on('addToBl',()=>{
      console.log('1111')
      this.subscribeBtnType = false
    })
  },
  mounted() {
  },
  methods: {
    objToStr: objToStr,
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
        self.panelPermission = res.panelPermission;
        self.targetUser = res.targetUser;
        // self.usersBlUid = res.usersBlUid;
        if(res.user.uid !== self.$route.params.uid){
          self.subscribeBtn = true
        }
        if(res.user.subUid.some((value)=>{ return value === res.targetUser.uid })){
          self.subscribeBtnType = true
        }
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
    //取消关注和关注
    userFollowType(uid) {
      const self = this;
      if(!self.subscribeBtnType){
        self.$refs.subscribeTypes.open((cid) => {
          subUsers(uid, true, [...cid])
              .then(() => {
                sweetSuccess('关注成功');
                self.subscribeBtnType = true;
                self.$refs.subscribeTypes.close();
                EventBus.$emit('removeToBl',uid)
                this.getPanelData()
              })
              .catch(err => {
                sweetError(err);
              })
        }, {
        })
      }else{
        subUsers(uid,false)
            .then((res)=>{
              sweetSuccess('取消关注');
              self.subscribeBtnType = false;
              // if(index !== -1) self.subUsersId.splice(index, 1);
            })
            .catch(err => {
              sweetError(err);
            })
      }

    },

    //用户移除黑名单 tUid 被拉黑的用户
    removeUserToBlackList(uid) {
      nkcAPI('/blacklist?tUid=' + uid, 'GET')
        .then(data => {
          if(!data.bl) throw "对方未在黑名单中";
          return nkcAPI('/blacklist?tUid=' + uid, 'DELETE');
        })
        .then(data => {
          sweetSuccess('操作成功！');
          this.getPanelData()

          return data;
        })
        .catch(sweetError);
    },

    //用户添加到黑名单 tUid 被拉黑的用户 form 拉黑来源 mid 被拉黑的moment
    addUserToBlackList(tUid, from, mid) {
      const self = this;
      var isFriend = false, subscribed = false;
      return Promise.resolve()
        .then(function() {
          return nkcAPI('/blacklist?tUid=' + tUid,  'GET')
        })
        .then(function(data) {
          isFriend = data.isFriend;
          subscribed = data.subscribed;
          var bl = data.bl;
          if(bl) throw '对方已在黑名单中';
          var info;
          if(isFriend) {
            info = '该会员在你的好友列表中，确定放入黑名单吗？';
          } else if(subscribed) {
            info = '该会员在你的关注列表中，确定放入黑名单吗？';
          }
          if(info) return sweetQuestion(info);
        })
        .then(function() {
          if(isFriend) {
            return nkcAPI(`/message/friend?uid=` + tUid, 'DELETE', {})
          }
        })
        .then(function() {
          if(subscribed) {
            return self.subscribeUserPromise(tUid, false);
          }
        })
        .then(function() {
          return nkcAPI('/blacklist', 'POST', {
            tUid: tUid,
            from: from,
            mid
          })
        })
        .then(function(data) {
          sweetSuccess('操作成功');
          self.getPanelData()
          self.subscribeBtnType = false;
          return data;
        })
        .catch(sweetError);
    },
    subscribeUserPromise(id, sub, cid) {
      const method = sub? "POST": "DELETE";
      return nkcAPI("/u/" + id + "/subscribe", method, {cid: cid || []});
    },

    //主页关注私信按钮盒子展开
    subscribeBtnBoxChange(bool){
      this.subscribeBtnBoxType = bool;
      if(bool) this.$refs.subscribeBox.style.height = '8rem';
      else this.$refs.subscribeBox.style.height = '3rem';
    },
    toChat(uid){
      NKC.methods.toChat(uid)
    },
    //中间显示内容路由切换
    containerChange(path){
      this.$router.push({name: path})
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
