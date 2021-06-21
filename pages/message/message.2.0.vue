<template lang="pug">
  .nkc-message-2
    .mode-container.narrow(v-if="mode === modes.narrow")
      PageList(
        ref="PageList"
        v-show='activePageId === pageId.PageList'
        @event="eventListener"
      )
      PageChat(
        ref="PageChat"
        v-show='activePageId === pageId.PageChat'
        @event="eventListener"
      )
      PageUser(
        ref="PageUser"
        v-show="activePageId === pageId.PageUser"
        @event="eventListener"
      )
      PageCategory(
        ref="PageCategory"
        v-show="activePageId === pageId.PageCategory"
        @event="eventListener"
      )
      PageSearch(
        ref="PageSearch"
        v-show="activePageId === pageId.PageSearch"
        @event="eventListener"
      )
      PageSetting(
        ref="PageSetting"
        v-show="activePageId === pageId.PageSetting"
        @event="eventListener"
      )
    .mode-container.wide(v-else)
      .container-left
        PageList(
          ref="PageList"
          @event="eventListener"
        )
      .container-right
        .empty-page(v-show="activePageId === pageId.PageList")
          .fa.fa-comments
        PageChat(
          ref="PageChat"
          v-show='activePageId === pageId.PageChat'
          @event="eventListener"
        )
        PageUser(
          ref="PageUser"
          v-show="activePageId === pageId.PageUser"
          @event="eventListener"
        )
        PageCategory(
          ref="PageCategory"
          v-show="activePageId === pageId.PageCategory"
          @event="eventListener"
        )
        PageSearch(
          ref="PageSearch"
          v-show="activePageId === pageId.PageSearch"
          @event="eventListener"
        )
        PageSetting(
          ref="PageSetting"
          v-show="activePageId === pageId.PageSetting"
          @event="eventListener"
        )
</template>

<style scoped lang="less">
  @wideLeftWidth: 21rem;
  .nkc-message-2{
    height: 100%;
    width: 100%;
    background-color: #fff;
    & /deep/ .message-container{
      height: 100%;
      width: 100%;
      position: relative;
    }
    .mode-container{
      height: 100%;
      width: 100%;
      position: relative;
      &.wide{
        padding-left: @wideLeftWidth;
      }
    }
    .container-left{
      width: @wideLeftWidth;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }
    .container-right{
      height: 100%;
      border-left: 1px solid #e7e7e7;
      position: relative;
      .empty-page{
        @height: 10rem;
        top: 0;
        left: 0;
        bottom: 0;
        position: absolute;
        right: 0;
        height: @height;
        width: @height;
        text-align: center;
        line-height: @height;
        margin: auto;
        font-size: 5rem;
        color: #dfdfdf;
      }
    }

    // 滚动条优化 chrome
    & /deep/ *::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    & /deep/ *::-webkit-scrollbar-track {
      background: #f4f4f4;
      border-radius: 2px;
    }

    & /deep/ *::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }

    & /deep/ *::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }

    & /deep/ *::-webkit-scrollbar-corner {
      background: #ccc;
    }


    // 滚动条优化 fireFox
    & /deep/ *{
      scrollbar-color: #ccc #f4f4f4;
      scrollbar-width: thin;
    }

  }
</style>

<script>

  import PageList from './components/PageList.vue';
  import PageChat from './components/PageChat.vue';
  import PageUser from './components/PageUser.vue';
  import PageCategory from './components/PageCategory.vue';
  import PageSearch from './components/PageSearch.vue';
  import PageSetting from './components/PageSetting.vue';

  import {
    receiveMessage,
    markAsRead,
    withdrawn,
  } from './socketEvents/message.js';
  import {
    updateChat,
    removeChat,
    updateChatList
  } from './socketEvents/chat.js';
  import {
    removeCategory,
    updateCategoryList
  } from './socketEvents/category.js'
  import {
    updateUserOnlineStatus,
    removeFriend,
    updateUserList
  } from './socketEvents/user.js'
  import {addSocketStatusChangedEvent, getSocketStatus} from "../lib/js/socket";
  import {sendNewMessageCount} from "./message.2.0";

  export default {
    props: ['mode', 'socket'],
    data: function() {
      return {
        // 页面名称
        activePageId: '', // PageList, PageMessage, PageSetting
        // 页面历史
        activePageIdHistories: [],
        modes: {
          narrow: 'narrow',
          wide: 'wide'
        },
        pages: [
          {
            id: 'PageList',
            name: '聊天、用户以及分组列表'
          },
          {
            id: 'PageChat',
            name: '聊天窗口',
          },
          {
            id: 'PageList',
            name: '对话列表'
          },
          {
            id: 'PageUser',
            name: '用户信息'
          },
          {
            id: 'PageCategory',
            name: '分组'
          },
          {
            id: 'PageSearch',
            name: '搜索'
          },
          {
            id: 'PageSetting',
            name: '设置'
          }
        ],
        socketApp: null,
      }
    },
    watch: {
      mode() {
        this.selectPage(this.pageId.PageList);
      }
    },
    computed: {
      pageId() {
        const obj = {};
        for(const p of this.pages) {
          obj[p.id] = p.id;
        }
        return obj;
      }
    },
    components: {
      PageList,
      PageChat,
      PageUser,
      PageCategory,
      PageSearch,
      PageSetting
    },
    mounted() {
      this.selectPage(this.pageId.PageList);
      // this.openUserPage({type: 'UTU', uid: '74230'})
      this.initSocket(this.socket);
      const socketStatus = getSocketStatus(this.socketApp);
      this.setSocketStatus(socketStatus);
    },
    methods: {
      initSocket(socketApp) {
        if(this.socketApp === socketApp) return;
        this.socketApp = socketApp;
        // 接收消息
        socketApp.on('receiveMessage', receiveMessage.bind(this));
        // 标记消息为已读
        socketApp.on('markAsRead', markAsRead.bind(this));
        // 撤回消息
        socketApp.on('withdrawn', withdrawn.bind(this));

        // 更新用户状态
        socketApp.on('updateUserOnlineStatus', updateUserOnlineStatus.bind(this));

        // 删除对话
        socketApp.on('removeChat', removeChat.bind(this));
        // 删除好友
        socketApp.on('removeFriend', removeFriend.bind(this));
        // 删除分组
        socketApp.on('removeCategory', removeCategory.bind(this));

        socketApp.on('updateChat', updateChat.bind(this));

        // 更新对话列表
        socketApp.on('updateChatList', updateChatList.bind(this));
        // 更新用户（联系人）列表
        socketApp.on('updateUserList', updateUserList.bind(this));
        // 更新分组信息
        socketApp.on('updateCategoryList', updateCategoryList.bind(this));

        addSocketStatusChangedEvent(socketApp, this.setSocketStatus)
      },
      setSocketStatus(data) {
        const {type, name} = data;
        const socketStatus = type !== 'connect'? name: '';
        const PageList = this.$refs[this.pageId.PageList];
        if(PageList) PageList.setSocketStatus(socketStatus);
      },
      selectPage(t) {
        this.activePageId = t;
        const index = this.activePageIdHistories.indexOf(t);
        if(index !== -1) {
          this.activePageIdHistories.splice(index, 1);
        }
        this.activePageIdHistories.push(t);
      },
      closePage() {
        if(this.activePageIdHistories.length === 1) {
          return sweetError(`已经是最后一页了`);
        }
        this.activePageIdHistories.pop();
        this.activePageId = this.activePageIdHistories[this.activePageIdHistories.length - 1];
      },
      updateNewMessageCount(count) {
        this.$emit('update-new-message-count', count);
      },
      openPage(props) {
        const {pageId, data} = props;
        this.selectPage(this.pageId[pageId]);
        const app = this;
        setTimeout(() => {
          if(app.$refs[pageId].init) {
            app.$refs[pageId].init(data);
          }
        });
      },
      eventListener(type, props) {
        if(this[type] && typeof this[type] === 'function') {
          this[type](props);
        }
      }
    }
  }

  window._messageFriendApplication = (uid, type) => {
    nkcAPI(`/message/friend`, 'POST', {
      uid,
      type
    })
    .catch(sweetError);
  };

</script>