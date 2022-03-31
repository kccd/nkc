<template lang="pug">
  //关注的用户
  .subscribe-user
    .subscribe-types
      .main-type 主分类：
        .box-shadow-panel
          button.subscribe-type(:class="{'active':Object.keys(checkClassification).length===0}") 全部
        .box-shadow-panel(v-for="t in subscribeTypes")
          button.subscribe-type {{t.name}}
      .subscribe-type-edit 管理分类
    .subscribe-divide-lines
    .subscribe-user-content
      .null(v-if="users.length==0" ) 空空如也~~
      .subscribe-user-box
        .subscribe-user-lists(v-for="t in users")
          .subscribe-user-list
            .subscribe-user-list-avatar
              img.img
            .subscribe-user-list-content
              .account-follower-name
                
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

export default {
  data: () => ({
    uid: NKC.configs.uid,
    users: [],//被关注数组
    subscribeTypes: [],//关注分类
    checkClassification:{}
  }),
  components: {

  },
  mounted() {
    this.getSubUser();
  },
  methods: {
    //获取关注的用户
    getSubUser() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/subscribe/user`, 'GET')
      .then(res => {
        console.log(res);
        self.subscribeTypes = res.subscribeTypes;
        self.users = res.subForumsId;

      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
