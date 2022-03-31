<template lang="pug">
  //关注的用户
  .subscribe-user(v-cloak)
    .subscribe-types
      .main-type 主分类：
        .box-shadow-panel
          button.subscribe-type(:class="{'active':Object.keys(checkClassification).length===0}" @click="typeClick()") 全部
        .box-shadow-panel(v-for="t in subscribeTypes" @click="typeClick(t._id)")
          button.subscribe-type {{t.name}}
      .subscribe-type-edit 管理分类
    .subscribe-divide-lines
    .subscribe-user-content
      .null(v-if="subscribes.length==0" ) 空空如也~~
      .subscribe-user-box(v-else)
        .subscribe-user-lists(v-for="(followedUser,index) in subscribes")
          .subscribe-user-list
            .subscribe-user-list-avatar
              img.img(:src="getUrl('userAvatar',followedUser.targetUser.avatar, 'sm')")
            .subscribe-user-list-content
              .account-follower-name
                a(:href="`/u/${followedUser.tUid}`" ) {{followedUser.targetUser.username}}
                .account-follower-buttons
                  button.category(v-if="subUsersId.indexOf(followedUser.tUid)+1") 分类
                  //button.category 分类
                  button.subscribe(:class="subUsersId.indexOf(followedUser.tUid)+1 ?'cancel':'focus'" @click="unfollow(followedUser.tUid,index)") {{active?'取关':'关注'}}
                  //button.subscribe(class='cancel') {{'取关'}}
              .account-follower-level
              .account-follower-description
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
    background: #fff59d;
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
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl} from "../../../../lib/js/tools";
export default {
  data: () => ({
    uid: '',
    users: [],
    subscribeTypes: [],//关注分类
    subscribes: [],//被关注用户列表
    checkClassification:{},
    t:'',
    subUsersId:[],//被关注的tuid
  }),
  components: {

  },
  created() {
    this.initData()
    this.getSubUser();
  },
  mounted() {
  },
  methods: {
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
      console.log('url', url);
      nkcAPI(url, 'GET')
      .then(res => {
        self.subscribeTypes = res.subscribeTypes;
        self.subscribes = res.subscribes;
        self.subUsersId = res.subUsersId
      })
      .catch(err => {
        sweetError(err);
      })
    },
    typeClick(t){
      this.t=t;
      this.getSubUser()
    },
    //取消关注
    unfollow(tUid,index){
      this.subUsersId.splice(index,1)
    }
  }
}
</script>
