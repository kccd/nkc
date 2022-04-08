<template lang="pug">
  //关注的用户
  .subscribe-user(v-if="targetUser")
    subscribe-types(ref="subscribeTypes")
    nav-types(ref="navTypes" :target-user="targetUser" :parent-type="parentType" type="collection" :subscribe-types="subscribeTypes" @click-type="typeClick"  @edit-type="editType")
    .subscribe-divide-lines
    paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    .subscribe-user-content
      .null(v-if="subscribes.length==0" ) 空空如也~~
      .subscribe-user-box(v-else)
        .subscribe-user-lists(v-for="(followedUser,index) in subscribes")
          .subscribe-user-list
            .subscribe-user-list-avatar
              img.img(
                :src="getUrl('userAvatar',followedUser.targetUser.avatar, 'sm')"
                data-global-mouseover="showUserPanel"
                data-global-mouseout="hideUserPanel"
                :data-global-data="objToStr({uid: followedUser.tUid})"
                )
            .subscribe-user-list-content
              .account-follower-name
                a(
                  :href="`/u/${followedUser.tUid}`"
                  data-global-mouseover="showUserPanel"
                  data-global-mouseout="hideUserPanel"
                  :data-global-data="objToStr({uid: followedUser.tUid})"
                  ) {{followedUser.targetUser.username}}
                .account-follower-buttons
                  button.category(v-if="subUsersId.indexOf(followedUser.tUid)+1" @click="openTypesModal(followedUser._id,followedUser.cid)") 分类
                  button.subscribe(:class="subUsersId.indexOf(followedUser.tUid)+1 ?'cancel':'focus'" @click="userFollowType(followedUser.tUid)") {{subUsersId.indexOf(followedUser.tUid)+1?'取关':'关注'}}
              .account-follower-level
                span(:style="{color:followedUser.targetUser.grade.color}") {{followedUser.targetUser.grade.displayName}}
                img.grade-icon(:src="getUrl('gradeIcon', followedUser.targetUser.grade._id)" :title="followedUser.targetUser.grade.displayName" )
                span.account-follower-certs {{followedUser.targetUser.info.certsName}}
              .account-follower-description {{followedUser.targetUser.description || "暂无简介"}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.subscribe-types{
  position: relative;
  padding-right: 6rem;
  .main-type {
    .box-shadow-panel{
      display: inline-block;
      .subscribe-type{
        height: 2.2rem;
        padding: 0 0.5rem;
        background-color: #fff;
        color: #282c37;
        margin-bottom: 0.4rem;
        margin-right: 0.5rem;
        line-height: 2.2rem;
        border-radius: 2px;
        border: 1px solid #d4d4d4;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
        &:hover {
          background-color: #f4f4f4;
        }
        &.active {
          background-color: #2b90d9;
          border: 1px solid #2b90d9;
          color: #fff;
        }
      }

    }

  }
  .subscribe-type-edit {
    position: absolute;
    top: 0.4rem;
    cursor: pointer;
    color: #2b90d9;
    right: 0;
  }

}
.subscribe-divide-lines{
  margin-top: 15px;
  width: 100%;
  border-top: 1px solid #F5F5F5;
  position: relative;
  &::after{
    content: '';
    position: absolute;
    left: -15px;
    bottom: 0;
    width: 15px;
    border-top: 1px solid #F5F5F5;
  }
  &::before{
    content: '';
    position: absolute;
    right: -15px;
    bottom: 0;
    width: 15px;
    border-top: 1px solid #F5F5F5;
  }
}
.subscribe-user-content{
  padding-top: 15px;
  .subscribe-user-lists{
    margin-bottom: 1.5rem;
    &:last-child{
      margin-bottom: 0;
    }
    .subscribe-user-list-avatar{
      display: table-cell;
      vertical-align: top;
      .img{
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        box-sizing: border-box;
        border: 2px solid #eee;
        margin-right: 1.3rem;
      }
    }
    .subscribe-user-list-content{
      display: table-cell;
      vertical-align: top;
      width: 100%;
      position: relative;
      .account-follower-name{
        height: 2.1rem;
        box-sizing: border-box;
        padding-right: 9rem;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        a{
          font-size: 1.4rem;
          color: #2b90d9;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
        }
        .account-follower-buttons{
          position: absolute;
          top: 0;
          right: 0;
          font-size: 1rem;
          button{
            background: #fff;
            height: 2rem;
            width: 4rem;
            border: 1px solid #ccc;
            border-radius: 2px;
            box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2);
            &.category:hover{
              background-color: #eee;
            }
          }
          .cancel{
            background-color: #e85a71;
            border: 1px solid #e85a71;
            color: #fff;
            margin-left: 3px;
            &:hover{
              background-color: #cb4c61;
            }
          }
          .focus{
            background-color: #2b90d9;
            border: 1px solid #2b90d9;
            color: #fff;
            &:hover{
              background-color: #2777b1;
            }
          }
        }

      }
      .account-follower-level{
        margin-top: 0.5rem;
        font-size: 1rem;
        .account-follower-certs{
          margin-left: 6px;
        }
      }
      .account-follower-description{
        margin-top: 0.5rem;
        height: 1.5rem;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        color: #777;
        font-size: 1.15rem;
      }
    }


  }
  .null {
    padding-top: 5rem;
    padding-bottom: 5rem;
    text-align: center;
  }
}
</style>
<script>
import NavTypes from "./NavTypes";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl} from "../../../../lib/js/tools";
import {subUsers, subTypesChange} from "../../../../lib/js/subscribe";
import {objToStr} from "../../../../lib/js/tools";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import Paging from "../../../../lib/vue/Paging";
export default {
  data: () => ({
    uid: '',
    users: [],
    subscribeTypes: [],//关注分类
    subscribes: null,//被关注用户列表
    t: '',//分类的_id
    subUsersId: [],//被关注的tuid
    cid: '',
    paging: null,
    targetUser: null,
    showCid:[],
    parentType: null,
  }),
  components: {
    'nav-types': NavTypes,
    "subscribe-types": SubscribeTypes,
    'paging': Paging
  },
  created() {
    this.initData()
    this.getSubUser();
  },
  mounted() {
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取关注的用户
    getSubUser(page) {
      const self = this;
      let url = `/u/${self.uid}/p/s/user`;
      if(self.t) {
        url += `?t=${self.t}`;
      }
      if(page) {
        if(url.indexOf('?') === -1) {
          url += `?page=${page}`;
        } else {
          url += `page=${page}`;
        }
      }
      nkcAPI(url, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.parentType = res.parentType;
        self.subscribeTypes = res.subscribeTypes;
        self.subscribes = res.subscribes;
        self.subUsersId = res.subUsersId
        self.paging = res.paging;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //分类选项查询和变化
    typeClick(t) {
      this.t = t;
      this.getSubUser()
    },
    //管理分类
    editType() {
      this.$refs.subscribeTypes.open(() => {
      },{
        editType: true
      })
    },
    //取消关注和关注
    userFollowType(uid) {
      const sub = !this.subUsersId.includes(uid);
      const self = this;
      const index = self.subUsersId.indexOf(uid);
      if(sub){
        self.$refs.subscribeTypes.open((cid) => {
          subUsers(uid, sub, [...cid])
              .then(() => {
                if(index === -1) self.subUsersId.push(uid);
                sweetSuccess('关注成功');
                self.$refs.subscribeTypes.close();
                this.getSubUser()
              })
              .catch(err => {
                sweetError(err);
              })
        }, {
        })
      }else{
        subUsers(uid,sub)
            .then((res)=>{
              sweetSuccess('取消关注');
              if(index !== -1) self.subUsersId.splice(index, 1);
            })
            .catch(err => {
              sweetError(err);
        })
      }

    },
    //分类弹窗操作
    openTypesModal(_id,cid) {
      const self = this;
      this.$refs.subscribeTypes.open((cid) => {
        self.showCid = cid
        subTypesChange([...cid],[_id])
        .then((res)=>{
          this.$refs.subscribeTypes.close();
          sweetSuccess("执行成功");
        })
      },{
        selectedTypesId: cid,//[]
        hideInfo: true,
        selectTypesWhenSubscribe: true
      });
    },
    //点击分页按钮
    clickBtn(num) {
      this.getSubUser(num);
    },
  }
}
</script>
