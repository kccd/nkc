<template lang="pug">
  .page-search.message-container
    ModuleHeader(
      :title="'搜索用户'"
      :leftIcon="'fa fa-angle-left'"
      @onClickLeftButton="toClosePage"
    )
    .page-search-container
      .page-search-form
        input(type="text" placeholder="请输入UID或用户名" v-model="content" @keyup.enter="searchUsers")
        button(@click="searchUsers") 搜索
      .page-search-users
        .page-search-info(v-if="searching") 搜索中...
        .page-search-info(v-else-if="users.length === 0") 空空如也~
        .page-search-user(v-for="u in users" v-else)
          .user-avatar
            img(:src="getUrl('userAvatar', u.avatar)")
          .user-info
            a(:href="getUrl('userHome',  u.uid)" target="_blank").user-name {{u.username}}
            .user-description {{u.description || '暂无简介'}}
          .user-options
            div(@click="toChat(u.uid)") 发送消息
            div(@click="toAddFriend(u.uid)" v-if="friendsUid.indexOf(u.uid) === -1") 添加好友
</template>

<style lang="less" scoped>
  @import "../message.2.0.less";
  .page-search-container{
    width: 100%;
    top: @headerHeight;
    position: absolute;
    bottom: 0;
    left: 0;
    overflow-y: auto;
    @searchFormHeight: 3.6rem;
    @searchButtonWidth: 5rem;
    padding: 2rem;
    .page-search-form{
      height: @searchFormHeight;
      padding-right: @searchButtonWidth;
      position: relative;
      input{
        width: 100%;
        height: 100%;
        border: 1px solid #aaa;
        border-radius: 3px 0 0 3px;
        outline: none;
        font-size: 1.25rem;
        padding: 0 1rem;
      }
      button{
        position: absolute;
        top: 0;
        right: 0;
        width: @searchButtonWidth;
        height: 100%;
        background-color: @primary;
        border:  none;
        color: #fff;
        font-size: 1.25rem;
        border-radius: 0 3px 3px 0;
        &:hover, &:active{
          opacity: 0.7;
        }
      }
    }
    .page-search-users{
      @avatarHeight: 4rem;
      @iconWidth: 3rem;
      .page-search-info{
        height: 3rem;
        line-height: 3rem;
        text-align: center;
      }
      .page-search-user{
        margin: 1rem 0;
        position: relative;
        padding-left: @avatarHeight + 1rem;
        padding-right: 2 * @iconWidth;
        .user-avatar{
          height: @avatarHeight;
          width: @avatarHeight;
          position: absolute;
          top: 0;
          left: 0;
          img{
            height: 100%;
            width: 100%;
            border-radius: 3px;
          }
        }
        .user-info{
          .user-name{
            font-size: 1.4rem;
            margin-bottom: 0.3rem;
            display: inline-block;
            height: 2rem;
            .hideText(@line: 1);
          }
          .user-description{
            height: 1.8rem;
            .hideText(@line: 1);
          }
        }
        .user-options{
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 2 * @iconWidth;
          &>*{
            line-height: @avatarHeight / 2;
            height: @avatarHeight / 2;
            text-align: center;
            cursor: pointer;
            &:hover, &:active{
              opacity: 0.7;
            }
          }
        }
      }
    }
  }
</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {
    closePage,
    addFriend,
    openChatPage
  } from '../message.2.0.js';
  export default {
    data: () => ({
      content: '',
      users: [],
      friendsUid: [],
      searching: false,
    }),
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      init() {
        const app = this;
        nkcAPI(`/message/friend?type=friendsUid`, 'GET')
          .then(data => {
            data.friendsUid.push(NKC.configs.uid);
            app.friendsUid = data.friendsUid;
          })
          .catch(sweetError);
      },
      toClosePage() {
        closePage(this);
      },
      toChat(uid) {
        openChatPage(this, 'UTU', uid);
      },
      getUsers(page = 0) {
        const {content} = this;
        const app = this;
        return Promise.resolve()
          .then(() => {
            if(!content) throw new Error(`请输入搜索内容`);
            app.searching = true;
            return nkcAPI(`/u?uid=${content}&username=${content}`, 'GET');
          })

          .then(data => {
            const {targetUsers} = data;
            app.users = app.users.concat(targetUsers);
            app.searching = false;
          })
          .catch(err => {
            sweetError(err);
            app.searching = false;
          });
      },
      searchUsers() {
        this.users = [];
        this.getUsers();
      },
      toAddFriend(uid) {
        addFriend(uid);
      }
    },
    components: {
      ModuleHeader,
    }
  }
</script>