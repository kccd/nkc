<template lang="pug">
  .page-list-container.message-container
    // 侧滑面板
    .nav-left-container-mask(v-if="showOptions" @click="switchLeftContainer")
    .nav-left-container(:class="{'show': showOptions}" v-if="mUser")
      .nav-left-header
        .fa.fa-arrow-left(@click="switchLeftContainer")
      .nav-left-banner-container
        img.nav-left-banner(:src="mUser.bannerUrl")
        img.nav-left-avatar(:src="mUser.avatarUrl")
      ul.nav-left-list
        li(@click="clickNavItem('search')")
          .fa.fa-search
          .item 搜索用户
        li(@click="clickNavItem('createCategory')")
          .fa.fa-users
          .item 创建分组
        li(@click="clickNavItem('setting')")
          .fa.fa-cog
          .item 设置
      .nav-left-footer NKC MESSAGE 2.0
    // 列表导航
    .list-nav-bar
      .nav-options(@click="showOptions = !showOptions")
        .fa.fa-bars
      .nav-item(
        v-for="l in list"
        :class="{'active': l.id === activeListId}"
        @click="clickNav(l)"
      ) {{l.name}}
    // socket 状态
    .list-socket-status(v-if="socketStatus") {{socketStatus}}
    // 对话列表
    .list-container(:class="{'socket-status': !!socketStatus}")
      .list-item-container(v-show="activeListId === listId.chat")
        .list-info(v-if="chatListData.length === 0") 空空如也
        .list-item(:key="chatData.type + chatData.uid" v-for="chatData in chatListDataShow" @click="clickChatItem(chatData.type, chatData.uid)")
          .list-item-avatar
            img(:src="chatData.icon")
          .list-item-right
            .list-item-right-top
              .list-item-username {{chatData.name}}
              .list-item-time {{chatData.timeStr}}
            .list-item-right-bottom
              .list-item-status(v-if="chatData.status") [{{chatData.status}}]
              .list-item-abstract {{chatData.abstract}}
              .list-item-number(v-if="chatData.count > 0") {{chatData.count}}
          .list-item-options(@click.stop="toRemoveChat(chatData.type, chatData.uid)" title="删除对话")
            .fa.fa-trash-o
      .list-item-container(v-show="activeListId === listId.user")
        .list-info(v-if="userListData.length === 0") 空空如也
        .list-item-users(v-for="usersData in userListData")
          .list-item-header {{usersData.title.toUpperCase()}}
          .list-item(:key="usersData._id" v-for="userData in usersData.data" @click="clickUserItem(userData.type, userData.uid)")
            .list-item-avatar
              img(:src="userData.icon")
            .list-item-right
              .list-item-right-top
                .list-item-username {{userData.name}}
              .list-item-right-bottom
                .list-item-status(v-if="userData.status") [{{userData.status}}]
                .list-item-abstract {{userData.abstract}}
      .list-item-container(v-show="activeListId === listId.category")
        .list-info(v-if="categoryListData.length === 0") 空空如也
        .list-item(:key="categoryData._id" v-for="categoryData in categoryListData" @click="clickCategoryItem(categoryData._id)")
          .list-item-avatar.category
            img(:src="i" v-for="i in categoryData.icon" v-if="!!i")
          .list-item-right
            .list-item-right-top
              .list-item-username {{categoryData.name}}
            .list-item-right-bottom
              .list-item-abstract {{categoryData.abstract}}
</template>


<style lang="less" scoped>
  @import '../message.2.0.less';
  @listHeight: 3rem;
  @listPaddingTop: 0.8rem;
  @listRightTopHeight: 1.8rem;
  @listRightBottomHeight: @listHeight - @listRightTopHeight;
  @listSocketStatusHeight: 2rem;
  .list-item-container{
    padding: 0.5rem 0;
  }
  .page-list-container{
    position: relative;
    overflow: hidden;
  }
  .list-info{
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    color: #555;
  }
  .nav-left-container-mask{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 200;
  }
  .nav-left-container{
    background-color: #fff;
    position: absolute;
    left: -70%;
    top: 0;
    width: 60%;
    height: 100%;
    z-index: 300;
    box-shadow: 1px 1px 13px -7px rgba(0,0,0,0.66);
    border: 1px solid #f4f4f4;
    border-radius: 3px;
    transition: left 200ms;
    &.show{
      left: 0;
    }
    .nav-left-header{
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      height: @headerHeight;
      text-align: right;
      .fa{
        cursor: pointer;
        height: @headerHeight;
        line-height: @headerHeight;
        width: @headerHeight;
        text-align: center;
        &:hover, &:active{
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
      z-index: 400;
      color: #fff;
      font-size: 1.2rem;
    }
    .nav-left-banner-container{
      width: 100%;
      z-index: 300;
      position: relative;
      .nav-left-banner{
        width: 100%;
      }
      &:before{
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 200;
        content: '';
      }
    }
    .nav-left-avatar{
      height: 3.4rem;
      width: 3.4rem;
      border-radius: 50%;
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      z-index: 300;
    }
    .nav-left-footer{
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: @headerHeight;
      line-height: @headerHeight;
      text-align: center;
      font-size: 1rem;
      color: #aaa;
    }
    .nav-left-list{
      padding: 0;
      margin: 0;
      @liHeight: 3rem;
      li{
        list-style: none;
        padding-left: @liHeight;
        height: @liHeight;
        position: relative;
        .fa{
          position: absolute;
          top: 0;
          left: 0;
          height: @liHeight;
          width: @liHeight;
          text-align: center;
          line-height: @liHeight;
          font-size: 1.2rem;
        }
        .item{
          font-size: 1rem;
          height: @liHeight;
          line-height: @liHeight;
          border-bottom: 1px solid #e2e2e2;
          padding-left: 0.5rem;
          cursor: pointer;
          &:hover, &.active{
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
  }
  .list-socket-status{
    height: @listSocketStatusHeight;
    line-height: @listSocketStatusHeight;
    background-color: #ff7373;
    color: #fff;
    font-size: 1rem;
    text-align: center;
  }
  .list-nav-bar{
    @height: @headerHeight;
    height: @height;
    user-select: none;
    //box-shadow: 1px 1px 13px -7px rgba(0,0,0,0.66);
    border-bottom: 1px solid #e7e7e7;
    text-align: center;
    position: relative;
    .nav-options{
      position: absolute;
      top: 0;
      left: 0;
      height: @height;
      width: @height;
      font-size: 1.2rem;
      line-height: @height;
      text-align: center;
      cursor: pointer;
      &:hover, &:active{
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    .nav-item{
      height: @height;
      line-height: @height;
      cursor: pointer;
      width: 4.4rem;
      display: inline-block;
      text-align: center;
      font-weight: 700;
      font-size: 1.16rem;
      position: relative;
      &:hover{
        background-color: #f4f4f4;
      }
      &.active{
        color: @primary;
      }
    }
  }
  .list-container{
    position: absolute;
    top: @headerHeight;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow-y: auto;
    &.socket-status{
      top: @headerHeight + @listSocketStatusHeight;
    }
  }
  .list-item{
    @optionWidth: 2rem;
    height: @listHeight + 2 * @listPaddingTop;
    padding: @listPaddingTop @listPaddingTop @listPaddingTop @listHeight + 2 * @listPaddingTop;
    position: relative;
    overflow: hidden;
    transition: padding-right 100ms;
    &:active, &:hover{
      background-color: rgba(0, 0, 0, 0.05);
    }
    &:hover{
      padding-right:  @optionWidth;
      .list-item-options{
        display: block;
      }
    }
    .list-item-options{
      position: absolute;
      top: 0.6rem;
      right: 0;
      width: @optionWidth;
      text-align: center;
      color: #777;
      display: none;
    }
    .list-item-right{
      @timeWidth: 6.5rem;
      .list-item-right-top{
        height: @listRightTopHeight;
        position: relative;
        padding-right: @timeWidth;
        .list-item-username{
          font-size: 1.2rem;
          color: #000;
          .hideText(@line: 1);
        }
        .list-item-time{
          position: absolute;
          top: 0;
          font-size: 1rem;
          right: 0;
          height: 100%;
          text-align: right;
          width: @timeWidth;
        }
      }
      .list-item-right-bottom{
        height: @listRightBottomHeight;
        position: relative;
        font-size: 1rem;
        color: #7f7f7f;
        @numberHeight: 1.4rem;
        padding-right: @numberHeight + 0.5rem;
        .hideText(@line: 1);
        .list-item-status{
          display: inline;
          margin-right: 0.5rem;
        }
        .list-item-abstract{
          display: inline;
          word-break: break-all;
        }
        .list-item-number{
          @height: 1.2rem;
          position: absolute;
          top: 0;
          right: 0;
          height: @height;
          line-height: @height;
          padding: 0 0.35rem;
          background-color: red;
          color: #fff;
          text-align: center;
          font-size: 1rem;
          border-radius: @height / 2;
          z-index: 100;
        }
      }
    }
  }
  .list-item-avatar{
    position: absolute;
    top: @listPaddingTop;
    left: @listPaddingTop;
    height: @listHeight;
    width: @listHeight;
    img{
      height: 100%;
      width: 100%;
    }
  }
  // 分组头像
  .list-item-avatar.category{
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    box-sizing: content-box;
    line-height: 0;
    & img{
      width: 33.3%;
      height: 33.3%;
      border-radius: 0;
      border: 1px solid #f4f4f4;
    }
  }
  .list-item-header{
    height: 2rem;
    line-height: 2rem;
    padding-left: 1rem;
    border-left: 4px solid @primary;
    //background-color: rgba(0, 0, 0, 0.1);
  }
</style>


<script>
  import {
    openChatPage,
    openUserPage,
    openCategoryPage,
    openSettingPage,
    openSearchPage,
    sendNewMessageCount,
    removeChat
  } from '../message.2.0.js';
  import {briefTime} from '../../lib/js/time.js';
  export default {
    data: () => ({
      showOptions: false,
      chatListData: [],
      userListData: [],
      categoryListData: [],
      activeListId: 'chat', // chat, user, category
      list: [
        {
          id: 'chat',
          name: '消息',
        },
        {
          id: 'user',
          name: '联系人',
        },
        {
          id: 'category',
          name: '分组',
        }
      ],
      mUser: null,

      socketStatus: '',
    }),
    computed: {
      chatListDataShow() {
        const {chatListData} = this;
        return chatListData.map(chat => {
          chat.timeStr = briefTime(chat.time);
          return chat
        });
      },
      newMessageCount() {
        const {chatListData} = this;
        let count = 0;
        for(const chat of chatListData) {
          count += chat.count || 0;
        }
        return count;
      },
      listId() {
        const obj = {};
        for(const l of this.list) {
          obj[l.id] = l.id;
        }
        return obj;
      }
    },
    watch: {
      newMessageCount() {
        sendNewMessageCount(this, this.newMessageCount);
      }
    },
    mounted() {
      this.getList();
    },
    methods: {
      // 格式化时间
      setSocketStatus(socketStatus) {
        this.socketStatus = socketStatus;
      },
      getList() {
        const app = this;
        nkcAPI('/message/list', 'GET')
          .then(data => {
            const {mUser, chatList, userList, categoryList} = data;
            app.chatListData = chatList;
            app.userListData = userList;
            app.categoryListData = categoryList;
            app.mUser = mUser;
          })
          .catch(sweetError);
      },
      briefTime(time) {
        return briefTime(time);
        time = new Date(time);
        const addZero = (num) => {
          return num > 9? num + '': '0' + num;
        }
        const month = time.getMonth() + 1;
        const day = time.getDate();
        const hour = time.getHours();
        const minute = time.getMinutes();
        return `${addZero(month)}/${addZero(day)} ${addZero(hour)}:${addZero(minute)}`;
      },
      clickNav(l) {
        this.activeListId = l.id;
      },
      // 点击列表中的某一项 type: chat、user、category id: uid、uid、categoryId
      clickChatItem(type, uid) {
        openChatPage(this, type, uid);
      },
      // 点击联系人列表中的某一项
      clickUserItem(type, uid) {
        openUserPage(this, type, uid)
      },
      clickCategoryItem(id) {
        openCategoryPage(this, id);
      },
      switchLeftContainer(show) {
        this.showOptions = !this.showOptions;
      },
      clickNavItem(name) {
        if(name === 'search') {
          openSearchPage(this);
        } else if(name === 'createCategory') {
          openCategoryPage(this, null);
        } else if(name === 'setting') {
          this.$emit('onClickSettingItem');
          openSettingPage(this);
        }
        this.switchLeftContainer();
      },
      updateUserStatus(type, uid, status) {
        const {chatListData, userListData} = this;
        for(const chat of chatListData) {
          if(chat.type === type && chat.uid === uid) {
            chat.status = status;
            break;
          }
        }
        loop:
          for(const arr of userListData) {
            for(const userData of arr.data) {
              if(userData.type === type && userData.uid === uid) {
                userData.status = status;
                break loop;
              }
            }
        }
      },
      // 移除对话
      toRemoveChat(type, uid) {
        removeChat(type, uid);
      },
      removeChat(type, uid) {
        const {chatListData} = this;
        for(let i = 0; i < chatListData.length; i ++) {
          const chat = chatListData[i];
          if(chat.type === type && chat.uid === uid) {
            chatListData.splice(i, 1);
          }
        }
      },
      // 移除好友
      removeFriend(type, uid) {
        const {userListData} = this;
        loop:
          for (let i = 0; i < userListData.length; i++) {
            const arr = userListData[i];
            for (let j = 0; j < arr.data.length; j++) {
              const userData = arr.data[j];
              if (userData.type === type && userData.uid === uid) {
                if (arr.data.length === 1) {
                  userListData.splice(i, 1);
                } else {
                  arr.data.splice(j, 1);
                }
                break loop;
              }
            }
          }
        this.removeChat(type, uid);
      },
      // 移除分组
      removeCategory(cid) {
        const {categoryListData} = this;
        for(let i = 0; i < categoryListData.length; i++) {
          const categoryData = categoryListData[i];
          if(categoryData._id === cid) {
            categoryListData.splice(i, 1);
            break;
          }
        }
      },
      // 更新整个分组列表
      updateCategoryList(categoryList) {
        this.categoryListData = categoryList;
      },
      // 更新用户（联系人）列表
      updateUserList(userList) {
        this.userListData = userList;
      },
      // 更新对话列表
      updateChatList(chatList) {
        this.chatListData = chatList;
      },
      // 标记为已读
      markAsRead(type, uid) {
        const {chatListData} = this;
        for(const chat of chatListData) {
          if(chat.type === type && chat.uid === uid) {
            chat.count = 0;
            break;
          }
        }
      },
      // 添加对话并置顶
      updateChat(chat) {
        const {type, uid} = chat;
        for(let i = 0; i < this.chatListData.length; i++) {
          const chat_ = this.chatListData[i];
          if(chat_.type === type && chat_.uid === uid) {
            this.chatListData.splice(i, 1);
            break;
          }
        }
        this.chatListData.unshift(chat);
      },
      // socket 重新连接后
      reconnect() {
        this.getList();
      }
    }
  }
</script>