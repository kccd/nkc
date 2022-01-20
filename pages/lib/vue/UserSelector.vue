<template lang="pug">
  .user-selector
    .module-header(ref="draggableHandle")
      .module-title 选择用户
      .module-close.fa.fa-close(@click="close")
    .module-body
      .selected-users
        span 已选择用户({{selectedUsersId.length + '/' + userCount}})：
        span(v-if="!selectedUsers.length") 无
        .selected-user(v-for="(u, index) in selectedUsers")
          .selected-user-avatar
            img(:src="getUrl('userAvatar', u.avatar, 'sm')")
          .selected-user-name {{u.username}}
            .fa.fa-remove(@click="removeUser(index)")
      .input-group
        .input-group-btn
          button.btn.btn-default.dropdown-toggle(data-toggle="dropdown" aria-haspopup="true" aria-expanded=false)
            | {{getTypeName(type)}}&nbsp;
            span.caret
          ul.dropdown-menu
            li.pointer
              a(@click="selectType('username')") {{getTypeName("username")}}
            li.pointer
              a(@click="selectType('uid')") {{getTypeName("uid")}}
        input.form-control.search-input(type="text" v-model.trim="keyword" @keyup.enter="search")
        button.search-button(@click="search")
          .fa.fa-search
      .search-results
        h5.text-danger(v-if="searchInfo") {{searchInfo}}
        .search-user(v-for="u in searchUsers" @click="selectUser(u)")
          .search-user-avatar
            img(:src="getUrl('userAvatar', u.avatar, 'sm')")
          .search-user-info
            .search-user-name {{u.username}}
              //.button.fa.fa-plus-circle(@click="selectUser(u)")
            .search-user-description {{u.description}}
    .module-footer
      button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
      button(type="button" class="btn btn-primary btn-sm" disabled=true v-if="!selectedUsersId.length") 确定
      button(type="button" class="btn btn-primary btn-sm" @click="done" v-else) 确定
</template>

<script>
  import {checkString} from "../js/checkData";
  import {getUrl} from "../js/tools";
  import {DraggableElement} from "../js/draggable";
  export default {
    data: () => ({
      users: [],
      searchUsers: [],
      selectedUsersId: [],
      userCount: 0,
      searchInfo: "",
      type: "username", // username, uid
      keyword: "",
      paging: ""
    }),
    mounted() {
      this.initDraggableElement();
    },
    destroyed() {

    },
    computed: {
      selectedUsers: function() {
        var selectedUsersId = this.selectedUsersId;
        var users = [];
        for(var i = 0; i < selectedUsersId.length; i++) {
          var u = this.getUserById(selectedUsersId[i]);
          if(u) users.push(u);
        }
        return users;
      }
    },
    methods: {
      checkString: checkString,
      getUrl: getUrl,
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      },
      removeUser: function(index) {
        this.selectedUsersId.splice(index, 1);
      },
      getUserById: function(id) {
        var users = this.users;
        for(var i = 0; i < users.length; i++) {
          var u = users[i];
          if(u.uid === id) return u;
        }
      },
      selectUser: function(u) {
        if(this.selectedUsersId.indexOf(u.uid) === -1) {
          var selectedUserCount = this.selectedUsersId.length;
          if(selectedUserCount < this.userCount) {
            this.selectedUsersId.push(u.uid);
          }
        }
      },
      search: function() {
        var app = this;
        this.searchInfo = "";
        Promise.resolve()
          .then(function() {
            var keyword = app.keyword;
            app.checkString(keyword, {
              name: "输入的关键词",
              minLength: 1
            });
            var url = "/u";
            if(app.type === "username") {
              url += "?username=" + keyword;
            } else {
              url += "?uid=" + keyword;
            }
            return nkcAPI(url, "GET");
          })
          .then(function(data) {
            app.searchUsers = data.targetUsers;
            app.users = app.users.concat(app.searchUsers);
            if(!data.targetUsers.length) app.searchInfo = "未找到相关用户";
          })
          .catch(function(err) {
            sweetError(err);
          })
      },
      getTypeName: function(type) {
        return {
          "uid": "用户ID",
          "username": "用户名"
        }[type];
      },
      selectType: function(type) {
        this.type = type;
      },
      open: function(callback, options) {
        options = options || {};
        this.userCount = options.userCount || 99;
        this.callback = callback;
        this.draggableElement.show();
      },
      close: function() {
        this.draggableElement.hide();
        const self = this;
        setTimeout(function() {
          self.searchUsers = [];
          self.type = "username";
          self.selectedUsersId = [];
          self.userCount = 0;
        }, 1000);
      },
      done: function() {
        this.callback({
          usersId: this.selectedUsersId,
          users: this.selectedUsers
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .user-selector{
    display: none;
    position: fixed;
    width: 30rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
    padding-bottom: 1rem;
    .null{
      margin-top: 5rem;
      margin-bottom: 5rem;
      text-align: center;
    }
    .module-header{
      height: 3rem;
      line-height: 3rem;
      background-color: #f6f6f6;
      position: relative;
      .module-title{
        margin-left: 1rem;
        color: #666;
        cursor: move;
      }
      .module-close{
        height: 3rem;
        width: 3rem;
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        line-height: 3rem;
        color: #888;
        cursor: pointer;
        &:hover{
          color: #777;
          background-color: #ddd;
        }
      }
    }
    .module-body{
      padding: 0.5rem 1rem;
    }
    .module-footer{
      padding: 0 1rem;
      text-align: right;
      button{
        margin-left: 0.5rem;
      }
    }
  }
  .user-selector .modal-header{
    border-bottom: none;
  }
  .user-selector .modal-body{
    padding-top: 0;
    padding-bottom: 0;
  }
  .user-selector .modal-footer{
    border-top: none;
  }

  .user-selector .search-button{
    position: absolute;
    top: 0;
    right: 0;
    height: 34px;
    width: 34px;
    z-index: 100;
    border: none;
    background-color: rgba(255, 255, 255, 0);
    color: #282c37;
  }
  .user-selector .search-input{
    padding-right: 34px;
    border-radius: 0 4px 4px 0;
    border-left: none;
  }
  .user-selector .search-user{
    cursor: pointer;
    margin: 0.5rem 0;
    height: 4rem;
    padding: 0.5rem;
    background-color: #f4f4f4;
  }
  .user-selector .search-user-avatar img{
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 3px;
  }
  .user-selector .search-user-avatar{
    display: table-cell;
    width: 3.5rem;
  }
  .user-selector .search-user-info{
    display: table-cell;
    vertical-align: top;
    padding-left: 1rem;
  }
  .user-selector .search-user-name{
    height: 1.5rem;
    font-size: 1.3rem;
    font-weight: 700;
    /*padding-right: 3rem;*/
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    position: relative;
  }
  .user-selector .search-user-name .button{
    font-size: 1.4rem;
    color: #2b90d9;
    position: absolute;
    top: 0;
    right: 0;
    height: 1.5rem;
    width: 2rem;
  }
  .user-selector .search-user-description{
    margin-top: 0.5rem;
    height: 1.5rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    font-size: 1rem;
    overflow: hidden;
  }
  .user-selector .selected-users{
    padding: 0.5rem 0;
  }
  .user-selector .selected-user{
    font-size: 0;
    display: inline-block;
    margin: 0 0.5rem 0.5rem 0;
    vertical-align: top;
  }
  .user-selector .selected-user-avatar img{
    height: 2rem;
    width: 2rem;
    border-radius: 3px 0 0 3px;
  }
  .user-selector .selected-user-avatar{
    display: inline-block;
    vertical-align: top;
  }
  .user-selector .selected-user-name{
    vertical-align: top;
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.5rem;
    border-radius: 0 3px 3px 0;
    font-size: 1.2rem;
    background-color: #999;
    color: #fff;
  }
  .user-selector .selected-user-name .fa{
    cursor: pointer;
  }
</style>