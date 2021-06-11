<template lang="pug">
  .nkc-message-2
    .mode-container.narrow(v-if="mode === modes.narrow")
      PageList(
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
      border-left: 1px solid #ccc;
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
      this.initSocket(socket);
    },
    methods: {
      initSocket(socketApp) {
        if(this.socketApp === socketApp) return;
        this.socketApp = socketApp;
        socket.on('message', data => {
          console.log(data);
        });
        socket.on('markAsRead', data => {

        });
        socket.on('userConnection', data => {

        });
        socket.on('userDisconnection', data => {

        });
        socket.on('removeChat', data => {

        });
        socket.on('removeFriend', data => {

        });
        socket.on('modifyCategory', data => {

        });
        socket.on('modifyFriendInfo', data => {

        });
        socket.on('withdraw', data => {

        });

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