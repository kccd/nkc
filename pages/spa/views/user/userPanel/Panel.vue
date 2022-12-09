<template lang="pug">
  .container-fluid.max-width
    .hidden-user-home-tip(v-if="targetUser && targetUser.hidden" )
      span 用户名片已被屏蔽
    .user-banner(@mouseenter="enter()" @mouseleave="leave()" v-if="targetUser").clearPaddingLeftByMargin.clearPaddingRightByMargin
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
          .account-user-base-info.hidden-md.hidden-sm.hidden-lg.col-xs-12
            .row
              .col-xs-6.m-b-05 {{websiteCode}}ID：{{targetUser.uid}}
              .col-xs-6.m-b-05 学术分：{{targetUser.xsf}}
              .col-xs-6.m-b-05(v-if="selfUid === targetUser.uid") 动态码：{{code}}
            .row
              .col-xs-6.m-b-05 注册：{{new Date(targetUser.toc).toLocaleDateString()}}
              .col-xs-6.m-b-05 活动：
                from-now(:time="targetUser.tlv")
            .row
              .col-xs-12
                span 个人简介：
              .col-xs-12.m-b-05(v-html="userDescription")

              //-.form.form-horizontal
                .form-group
                  label.label.col-xs-3.control-label UID：
                  .col-xs-9 {{targetUser.uid}}
                .form-group
                  label.label.col-xs-3.control-label 动态码：
                  .col-xs-9 {{code}}
                .form-group
                  label.label.col-xs-3.control-label 注册于：
                  .col-xs-9 {{timeFormat(targetUser.toc)}}
                .form-group
                  label.label.col-xs-3.control-label 活动于：
                  .col-xs-9
                    from-now(time="targetUser.tlv")
          .account-nav
            .account-nav-box.row
              .account-nav-left.col-xs-12.col-sm-2.col-md-2.hidden-xs.p-a-0
              .account-nav-center.col-xs-12.col-sm-10.col-md-10
                .account-nav-item.m-r-2f5(@click="containerChange('timeline')" :class="{'active': $route.name === 'timeline'}")
                  .account-nav-item-name 动态
                  .account-nav-item-value {{targetUser.timelineCount}}
                .account-nav-item.m-r-2f5(@click="containerChange('moment')" :class="{'active': $route.name === 'moment'}")
                  .account-nav-item-name 空间
                  .account-nav-item-value {{targetUser.momentCount}}
                .account-nav-item.m-r-2f5(@click="containerChange('post')" :class="{'active': ($route.name === 'post' || $route.name === 'thread')}")
                  .account-nav-item-name 社区
                  .account-nav-item-value {{targetUser.postCount + targetUser.threadCount - targetUser.disabledThreadsCount - targetUser.disabledPostsCount}}
                .account-nav-item.m-r-2f5(@click="containerChange('column')" :class="{'active': $route.name === 'column'}" v-if="targetUser.column")
                  .account-nav-item-name 专栏
                  .account-nav-item-value {{targetUser.columnThreadCount - targetUser.disabledColumnThreadCount}}
                .account-nav-item.m-r-2f5.hidden-md.hidden-sm.hidden-lg(@click="containerChange('follower')" :class="{'active': $route.name === 'follower'}")
                  .account-nav-item-name 关注
                  .account-nav-item-value {{followersCount >= 1000 ? (followersCount/1000).toFixed(1)+'K' : followersCount}}
                .account-nav-item.hidden-md.hidden-sm.hidden-lg(@click="containerChange('fan')" :class="{'active': $route.name === 'fan'}")
                  .account-nav-item-name 粉丝
                  .account-nav-item-value {{fansCount >= 1000 ? (fansCount/1000).toFixed(1)+'K' : fansCount}}
                .pull-right.m-r-2.hidden-xs
                  .account-nav-item.m-r-2f5
                    .account-nav-item-name 学术分
                    .account-nav-item-value {{targetUser.xsf}}
                  .account-nav-item.m-r-2f5(@click="containerChange('follower')" :class="{'active': $route.name === 'follower'}")
                    .account-nav-item-name 关注
                    .account-nav-item-value {{followersCount >= 1000 ? (followersCount/1000).toFixed(1)+'K' : followersCount}}
                  .account-nav-item(@click="containerChange('fan')" :class="{'active': $route.name === 'fan'}")
                    .account-nav-item-name 粉丝
                    .account-nav-item-value {{fansCount >= 1000 ? (fansCount/1000).toFixed(1)+'K' : fansCount}}
                //-.account-nav-item.m-r-2
                  .account-nav-item-name UID
                  .account-nav-item-value {{targetUser.uid}}
              //.account-nav-middle.col-xs-12.col-md-4.p-l-0.hidden-xs.hidden-sm
                span(@click="containerChange('moment')" :class="{'active': $route.name === 'moment'}") 动态
                span(@click="containerChange('post')" :class="{'active': ($route.name === 'post' || $route.name === 'thread')}") 社区
                span(@click="containerChange('column')" :class="{'active': $route.name === 'column'}") 专栏
                //span(@click="containerChange('follower')" :class="{'active': ($route.name === 'follower' || $route.name === 'fan')}") 关注
              //-.account-nav-right.col-xs-12.col-md-6
                .col-xs-12
                  .account-nav-item.m-r-2(@click="containerChange('follower')")
                    .account-nav-item-name 关注
                    .account-nav-item-value {{followersCount >= 1000 ? (followersCount/1000).toFixed(1)+'K' : followersCount}}
                  .account-nav-item(@click="containerChange('fan')")
                    .account-nav-item-name 粉丝
                    .account-nav-item-value {{fansCount >= 1000 ? (fansCount/1000).toFixed(1)+'K' : fansCount}}

        admin-manage(ref="adminManage" :target-user="targetUser" :panel-permission="panelPermission")

</template>

<style lang="less" scoped>
@import "../../../../publicModules/base";
.hidden-user-home-tip {
  line-height: 4rem;
  text-align: center;
  background-color: #222;
  font-size: 1.3rem;
  margin-bottom: 6px;
  border-radius: 2px;
  color: white;
}

.account-user-base-info{
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9e9e9;
  .user-info-item{
    @height: 2rem;
    min-height: @height;
    line-height: @height;
    padding-left: 5rem;
    position: relative;
    .user-info-name{
      width: 5rem;
      position: absolute;
      top: 0;
      left: 0;
      text-align: right;
    }
    .user-info-value{
      overflow: hidden;
      text-align: left;
    }
  }
}

.user-banner {
  height: auto;
  position: relative;
  margin-bottom: 1rem;
  @media(max-width: 767px) {
    margin-bottom: 0;
  }
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
            @media (max-width: 767px){
              top: 7rem;
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
              padding: 0 7rem 0 0;
              @media (max-width: 767px){
                padding-left: 10.5rem;
                padding-top: 0.5rem;

              }
              .account-user-avatar-xs{
                position: absolute;
                top: 0;
                left: 3rem;
                img {
                  width: 6rem;
                  height: 6rem;
                  border: 2px solid #f4f4f4;
                  border-radius: 50%;
                }
              }
              .fa{
                display: none;
              }

              .account-user-name{
                font-size: 1.7rem;
                font-weight: bold;
                text-shadow: 1px 0 2px #333;
                margin-bottom: 0.5rem;
                color: #fff;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
                @media (max-width: 767px){
                  font-size: 1.5rem;
                  padding-top: 0;
                }
              }
              .account-user-certs{
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                color: #fff;
              }
              .account-user-subscribe{
                position: absolute;
                top: 0;
                right: 2rem;
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
                  padding: 2px 6px;
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
        .account-nav-center{
          text-align: left;
          padding-left: 0;
          @media(max-width: 767px) {
            text-align: center;
            padding-left: 15px;
          }
        }
        @accountNavHeight: 5rem;
        width: 100%;
        height: @accountNavHeight;
        .account-nav-box{
          height: @accountNavHeight;
          .pull-right .account-nav-item{
            .account-nav-item-name{
              font-size: 1.2rem;
            }
          }
          .account-nav-item{
            height: @accountNavHeight;
            display: inline-block;
            cursor: pointer;
            &.active{
              &>*{
                color: @primary!important;
              }
            }
            .account-nav-item-name{
              text-align: center;
              font-size: 1.3rem;
              font-weight: 700;
              padding-top: 1.2rem;
            }
            .account-nav-item-value{
              text-align: center;
              font-size: 1rem;
              font-style: oblique;
            }
          }
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
            text-align: right;
            @media (max-width: 991px){
              text-align: center;
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
import {getUrl, timeFormat} from "../../../../lib/js/tools";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {screenTopWarning} from "../../../../lib/js/topAlert";
import {getState} from "../../../../lib/js/state";
import {objToStr} from "../../../../lib/js/tools";
import {subUsers} from "../../../../lib/js/subscribe";
import {EventBus} from "../../../eventBus";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import UserLevel from "./UserLevel";
import AdminManage from "./AdminManage";
import {marked} from 'marked'
import FromNow from "../../../../lib/vue/FromNow";
const state = getState();
export default {
  props: ['targetUserScores', "fansCount",  "followersCount", "code"],
  data: () => ({
    uid: null,
    websiteCode: (state.websiteCode || '').toUpperCase(),
    selfUid: state.uid,
    panelPermission: null,
    targetUser: null,
    subscribeBtn: false,
    subscribeBtnType: false,
    usersBlUid: [],
    stopInAndOut: false,
  }),
  components: {
    'from-now': FromNow,
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
    },
    userDescription() {
      return marked(this.targetUser.description || '未填写');
    }
  },
  mounted() {
  },
  methods: {
    objToStr: objToStr,
    timeFormat,
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
        if(res.user && res.userSubscribeUsersId.some((value)=>{ return value === res.targetUser.uid })){
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
