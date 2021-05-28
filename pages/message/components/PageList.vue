<template lang="pug">
  div
    .list-nav-bar
      .nav-item(
        v-for="l in list"
        :class="{'active': l.id === activeListId}"
        @click="clickNav(l)"
        ) {{l.name}}
    .list-container
      .list-item-container(v-if="activeListId === listId.chat")
        .list-item(v-for="chatData in chatListData" @click="clickChatItem(chatData.type, chatData.uid)")
          .list-item-avatar
            img(:src="chatData.icon")
          .list-item-right
            .list-item-right-top
              .list-item-username {{chatData.name}}
              .list-item-time {{briefTime(chatData.time)}}
            .list-item-right-bottom
              .list-item-status(v-if="chatData.status") [{{chatData.status}}]
              .list-item-abstract {{chatData.abstract}}
              .list-item-number(v-if="chatData.count > 0") {{chatData.count}}
      .list-item-container(v-if="activeListId === listId.user")
        .list-item-users(v-for="usersData in userListData")
          .list-item-header {{usersData.title.toUpperCase()}}
          .list-item(v-for="userData in usersData.data")
            .list-item-avatar
              img(:src="userData.icon")
            .list-item-right
              .list-item-right-top
                .list-item-username {{userData.name}}
              .list-item-right-bottom
                .list-item-status(v-if="userData.status") [{{userData.status}}]
                .list-item-abstract {{userData.abstract}}
      .list-item-container(v-if="activeListId === listId.category")
        .list-item(v-for="categoryData in categoryListData")
          .list-item-avatar.category
            img(:src="i" v-for="i in categoryData.icon" v-if="!!i")
          .list-item-right
            .list-item-right-top
              .list-item-username {{categoryData.name}}
            .list-item-right-bottom
              .list-item-abstract {{categoryData.abstract}}
</template>


<style lang="less" scoped>
  @import '../../publicModules/base';
  @listHeight: 3.5rem;
  @listPaddingTop: 0.8rem;
  @listRightTopHeight: 1.8rem;
  @listRightBottomHeight: @listHeight - @listRightTopHeight;
  .list-nav-bar{
    @height: 4rem;
    height: @height;
    user-select: none;
    box-shadow: 1px 1px 13px -7px rgba(0,0,0,0.66);
    .nav-item{
      height: @height;
      line-height: @height;
      cursor: pointer;
      width: 33.3%;
      display: inline-block;
      text-align: center;
      &:hover, &:active{
        background-color: #f6f6f6;
      }
      &.active{
        background-color: #f4f4f4;
      }
    }
  }
  .list-container{
    height: 50rem;
    overflow-y: auto;
  }
  .list-item{
    height: @listHeight + 2 * @listPaddingTop;
    padding: @listPaddingTop @listPaddingTop @listPaddingTop @listHeight + 2 * @listPaddingTop;
    position: relative;
    overflow: hidden;
    &:active, &:hover{
      background-color: rgba(0, 0, 0, 0.05);
    }
    .list-item-right{
      @timeWidth: 6.5rem;
      .list-item-right-top{
        height: @listRightTopHeight;
        position: relative;
        padding-right: @timeWidth;
        .list-item-username{
          font-size: 1.3rem;
          color: #333;
          .hideText(@line: 1);
        }
        .list-item-time{
          position: absolute;
          top: 0;
          font-size: 1.1rem;
          right: 0;
          height: 100%;
          text-align: right;
          width: @timeWidth;
        }
      }
      .list-item-right-bottom{
        height: @listRightBottomHeight;
        position: relative;
        font-size: 1.2rem;
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
          @height: 1.3rem;
          position: absolute;
          top: 0;
          right: 0;
          height: @height;
          line-height: @height;
          padding: 0 0.4rem;
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
  export default {
    props: ['chatListData', 'userListData', 'categoryListData'],
    data: () => ({
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
      ]
    }),
    computed: {
      listId() {
        const obj = {};
        for(const l of this.list) {
          obj[l.id] = l.id;
        }
        return obj;
      }
    },
    mounted() {

    },
    methods: {
      // 格式化时间
      briefTime(time) {
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
        console.log(type, uid)
      }
    }
  }
</script>