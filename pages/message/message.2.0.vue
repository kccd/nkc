<template lang="pug">
  .nkc-message-2
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
</template>

<style scoped lang="less">
  .nkc-message-2{
    background-color: #fff;
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
    data: () => ({
      // 页面名称
      activePageId: '', // PageList, PageMessage, PageSetting
      // 页面历史
      activePageIdHistories: [],
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
    }),
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
    },
    methods: {
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
        console.log(props)
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
        console.log(`来自子组件的事件 事件名：${type} 参数：${props}`)
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