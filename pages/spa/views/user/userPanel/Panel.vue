<template lang="pug">
  .container-fluid.max-width.clear-padding
    .hidden-user-home-tip(v-if="targetUser && targetUser.hidden" )
      span 用户名片已被屏蔽
    .user-banner(@mouseenter="enter()" @mouseleave="leave()" v-if="targetUser").m-b-1
      subscribe-types(ref="subscribeTypes")
        //用户名片
      .account-banner(v-if="targetUser" )
        //用户banner容器
        .account-user-banner-container
          .account-user-banner(:style="`backgroundImage: url('${userHomeBannerUrl}')`")
            .account-box-mask
              .account-user-info.row
                .account-user-avatar.col-xs-3.col-sm-2.col-md-2.hidden-xs
                  img(:src="getUrl('userAvatar', targetUser.avatar)" data-global-click="viewImage" :data-global-data="objToStr({url: getUrl('userAvatar', targetUser.avatar)})")
                .account-user-introduce.col-xs-12.col-sm-10.col-md-10
                  .account-user-avatar-xs
                    img.xs.hidden-sm.hidden-md.hidden-lg(:src="getUrl('userAvatar', targetUser.avatar)" data-global-click="viewImage" :data-global-data="objToStr({url: getUrl('userAvatar', targetUser.avatar)})")
                  .account-user-name {{targetUser.username}}
                  .account-user-certs
                    user-level(ref="userLevel" :target-user="targetUser")
                  .account-user-subscribe(v-if="subscribeBtn" ref="subscribeBox")
                    div(:class="subscribeBtnType ? 'cancel' : 'focus'" @click.stop="userFollowType(targetUser.uid)") {{subscribeBtnType ? '取关' : '关注' }}
                    div.link.hidden-xs.hidden-sm(@click.stop="toChat(targetUser.uid)") 私信
                    div.link.hidden-md.hidden-lg
                      a(href=`/message` target='_blank') 私信
                    //div.link(onclick="RootApp.openLoginPanel()" v-else-if="!selfUid") 私信
                  .fa(v-if="subscribeBtn" :class="subscribeBtnBoxType ? 'fa-angle-up' : 'fa-angle-down'" @click.stop="subscribeBtnBoxChange(!subscribeBtnBoxType)")
          .account-nav
            .account-nav-box.row
              .account-nav-left.col-xs-12.col-md-2.hidden-xs.hidden-sm
              .account-nav-middle.col-xs-12.col-md-7.p-l-0.hidden-xs.hidden-sm
                span(@click="containerChange('moment')" :class="{'active': $route.name === 'moment'}") 动态
                span(@click="containerChange('post')" :class="{'active': $route.name === 'post'}") 社区
                span(@click="containerChange('column')" :class="{'active': $route.name === 'column'}") 专栏
                //span(@click="containerChange('follower')" :class="{'active': ($route.name === 'follower' || $route.name === 'fan')}") 关注
              .account-nav-right.col-xs-12.col-md-3
                .sub-item(@click="containerChange('follower')")
                  div 关注
                  span {{followersCount >= 1000 ? (followersCount/1000).toFixed(1)+'K' : followersCount}}
                .sub-item(@click="containerChange('fan')")
                  div 粉丝
                  span {{fansCount >= 1000 ? (fansCount/1000).toFixed(1)+'K' : fansCount}}

        admin-manage(ref="adminManage" :target-user="targetUser" :panel-permission="panelPermission")

</template>

<style lang="less" scoped>
@import "../../../../publicModules/base";
.clear-padding{
  @media (max-width: 992px){
    padding-left: 0;
    padding-right: 0;
  }
}
.hidden-user-home-tip {
  line-height: 4rem;
  text-align: center;
  background-color: #222;
  font-size: 1.3rem;
  margin-bottom: 6px;
  border-radius: 2px;
  color: white;
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
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
    .account-user-banner-container {

      .account-user-banner {
        width: 100%;
        height: 14rem;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
        position: relative;
        .account-box-mask{
          background: linear-gradient(rgba(0,0,0,0), 80%, rgba(20,20,20,0.6));
          height: 100%;
          .account-user-info {
            position: relative;
            height: auto;
            top: 8rem;
            @media (max-width: 768px){
              top: 10rem;
            }
            .account-user-avatar {
              text-align: center;
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
              padding: 0;
              @media (max-width: 768px){
                padding-left: 10rem;
              }
              .account-user-avatar-xs{
                position: absolute;
                top: 0;
                left: 3rem;
                img {
                  width: 6rem;
                  height: 6rem;
                  border: 4px solid #fff;
                  border-radius: 10px;
                }
              }
              .fa{
                display: none;
              }
              @media (max-width: 991px){
                .fa{
                  display: block;
                  width: 40px;
                  height: 20px;
                  text-align: center;
                  z-index: 100;
                }
                .fa-angle-down{
                  position: absolute;
                  top: 27px;
                  right: 3.5rem;
                  font-size: 2rem;
                  color: #fff;
                  &::before {
                    content: "\f107";
                  }

                }
                .fa-angle-up{
                  position: absolute;
                  top: 5rem;
                  right: 3.5rem;
                  font-size: 2rem;
                  height: 40px;
                  &:before {
                    @media (max-width: 991px){
                      content: "\f106";
                    }
                  }
                }
              }
              .account-user-name{
                font-size: 1.5rem;
                font-weight: bold;
                text-shadow: 1px 0px 2px #333;
                padding-top: 1rem;
                margin-bottom: 0.5rem;
                color: #fff;
                @media (max-width: 768px){
                  font-size: 14px;
                  padding-top: 0;
                }
              }
              .account-user-certs{
                color: #fff;
              }
              .account-user-subscribe{
                position: absolute;
                top: 0;
                right: 2rem;
                height: 3rem;
                overflow: hidden;
                z-index: 1;
                div{
                  display: inline-block;
                  text-align: center;
                  background: #fff;
                  width: auto;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  cursor:pointer;
                  padding: 3px 1rem;
                  margin-right: 1rem;
                  @media (max-width: 991px){
                    display: block;
                    margin-bottom: 8px;
                  }
                  a{
                    color: #0e0e0e;
                    text-decoration: none;
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

      }

      .account-nav {
        width: 100%;
        height: 48px;
        .account-nav-box{
          .account-nav-middle{
            height: 46px;
            line-height: 46px;
            font-size: 18px;
            font-weight: bold;
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
            display: inline-block;
            text-align: center;
            @media (max-width: 991px){
              text-align: right;
            }
            .sub-item{
              display: inline-block;
              margin: 3px 15px 0 15px;
              //font-weight: bold;
              font-size: 12px;
              cursor: pointer;
              text-align: center;
              span{
                font-size: 18px;
              }
            }
          }
        }
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
    }
  }
}
</style>
<script>
import {getUrl} from "../../../../lib/js/tools";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {screenTopWarning} from "../../../../lib/js/topAlert";
import {getState} from "../../../../lib/js/state";
import {objToStr} from "../../../../lib/js/tools";
import {subUsers} from "../../../../lib/js/subscribe";
import {EventBus} from "../../../eventBus";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import UserLevel from "./UserLevel";
import AdminManage from "./AdminManage";

export default {
  props: ['targetUserScores', "fansCount",  "followersCount"],
  data: () => ({
    uid: null,
    selfUid: getState().uid,
    panelPermission: null,
    targetUser: null,
    subscribeBtn: false,
    subscribeBtnType: false,
    subscribeBtnBoxType: false,
    usersBlUid: [],
    stopInAndOut: false,
  }),
  components: {
    "user-level": UserLevel,
    "subscribe-types": SubscribeTypes,
    "admin-manage": AdminManage
  },
  created() {
    this.initData()
    this.getPanelData()
    EventBus.$on('addToBl',()=>{
      this.subscribeBtnType = false
    })
    if(getState() && getState().isApp){
      this.stopInAndOut = true;
    }
  },
  computed: {
    userHomeBannerUrl() {
      const {homeBanner} = this.targetUser;
      if(!homeBanner) {
        return this.getUrl('defaultFile', 'default_pf_banner.jpg')
      } else {
        return this.getUrl('userHomeBanner', homeBanner);
      }

    }
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
        if(res.user && res.user.uid !== self.$route.params.uid){
          self.subscribeBtn = true
        }
        if(res.user && res.user.subUid.some((value)=>{ return value === res.targetUser.uid })){
          self.subscribeBtnType = true
        }
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
    //鼠标移入,移动段屏蔽
    enter(){
      if(this.stopInAndOut){
        return
      }else{
        this.$refs.adminManage.changeShowBanBox(true);
      }
    },
    //鼠标移除
    leave(){
      if(this.stopInAndOut){
        return
      }else{
        this.$refs.adminManage.changeShowBanBox(false);
        this.$refs.adminManage.clickBanContext(false);
      }

    }
  }
}
</script>
