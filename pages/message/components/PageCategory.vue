<template lang="pug">
  .message-category-container.message-container
    ModuleHeader(
      :title="title"
      :leftIcon="'fa fa-angle-left'"
      :rightIcon="rightIcon"
      @onClickLeftButton="closePage"
      @onClickRightButton="clickHeaderRightButton"
    )
    .category-info
      div(v-if="category && !showForm")
        .category-name {{category.name}}
        .category-description {{category.description}}
        .category-users
          .category-user(v-for="u in selectedUsers" @click="onClickUser(u.uid)")
            .category-user-avatar
              img(:src="u.avatar")
            .category-user-name {{u.username}}
      div(v-if="newCategory && showForm")
        .form
          .form-group
            label 分组名称
            input.form-control(type="text" v-model="newCategory.name")
          .form-group
            label 分组简介
            textarea.form-control(rows=3 v-model="newCategory.description")
          .form-group
            .row
              .col-xs-6
                span 全部好友
                .category-edit-users-container
                  .category-edit-users(v-for="userGroup in users")
                    .category-edit-header {{userGroup.title.toUpperCase()}}
                    .category-edit-user(v-for="u in userGroup.data" @click="addUser(u.uid)")
                      .category-edit-user-avatar
                        img(:src="u.avatar")
                      .category-edit-user-name {{u.username}}
                      .category-edit-option
                        .fa.fa-angle-right
              .col-xs-6
                span 已选好友
                .category-edit-users-container
                  .category-edit-users
                    .category-edit-user(v-for="u in selectedUsers" @click="removeUser(u.uid)")
                      .category-edit-user-avatar
                        img(:src="u.avatar")
                      .category-edit-user-name {{u.username}}
                      .category-edit-option
                        .fa.fa-remove
          .form-group(v-if="category")
            button.btn.btn-block.btn-danger(@click="removeCategory") 删除
</template>

<style lang="less">
  @import "../message.2.0.less";
  .message-category-container{
    .category-info{
      position: absolute;
      top: @headerHeight;
      bottom: 0;
      left: 0;
      width: 100%;
      overflow-y: auto;
      padding: 2rem;
      .category-name{
        font-weight: 700;
        font-size: 1.6rem;
        margin-bottom: 0.5rem;
      }
      .category-description{
        margin-bottom: 0.5rem;
        word-break: break-all;
      }
      .category-users{
        .category-user{
          cursor: pointer;
          @height: 5rem;
          width: @height;
          text-align: center;
          display: inline-block;
          margin: 0 1rem 1rem 0;
          .category-user-avatar{
            img{
              height: @height;
              width: @height;
              border-radius: 50%;
            }
          }
          .category-user-name{
            height: 1.6rem;
            line-height: 1.6rem;
            font-size: 1rem;
            width: 100%;
            overflow: hidden;
            .hideText(@line: 1);
          }
        }
      }
    }
    .category-edit-users-container{
      height: 24rem;
      overflow-y: auto;
      //padding: 0.5rem;
      background-color: #fff;
      border: 1px solid #aaa;
    }
    .category-edit-users{
      @height: 2rem;
      .category-edit-header{
        background-color: #eee;
        height: @height;
        line-height: @height;
        padding-left: 0.5rem;
      }
      .category-edit-user{
        height: @height;
        margin: 0.2rem 0;
        position: relative;
        padding-left: @height + 1rem;
        padding-right: @height;
        cursor: pointer;
        &:hover, &:active{
          background-color: rgba(0, 0, 0, 0.05);
        }
        .category-edit-user-name{
          overflow: hidden;
          height: @height;
          line-height: @height;
          .hideText(@line: 1);
        }
        .category-edit-option{
          position: absolute;
          top: 0;
          right: 0;
          height: @height;
          width: @height;
          text-align: center;
        }
        .category-edit-user-avatar{
          position: absolute;
          left: 0.5rem;
          top: 0;
          display: inline-block;
          height: @height;
          width: @height;
          img{
            height: 100%;
            width: 100%;
            border-radius: 50%;
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
    openUserPage,
  } from '../message.2.0.js';
  export default {
    data: () => ({
      category: null,
      newCategory: null,
      users: [],
      showForm: false,
    }),
    computed: {
      rightIcon() {
        const {showForm} = this;
        return showForm? 'fa fa-save': 'fa fa-edit';
      },
      title() {
        const {category, showForm} = this;
        if(showForm) {
          return category? '编辑分组': '新建分组';
        } else {
          return '分组详情';
        }
      },
      usersObj() {
        const obj = {};
        for(const item of this.users) {
          for(const u of item.data) {
            obj[u.uid] = u;
          }
        }
        return obj;
      },
      selectedUsers() {
        const {showForm, usersObj, newCategory, category} = this;
        const friendsId = showForm? newCategory.friendsId: category.friendsId;
        const users = [];
        for(const uid of friendsId) {
          const user = usersObj[uid];
          if(!user) continue;
          users.push(user);
        }
        return users;
      }
    },
    components: {
      ModuleHeader
    },
    methods: {
      reset() {
        this.category = null;
        this.users = [];
        this.showForm = false;
      },
      reload(id) {
        this.reset();
        this.init(id)
      },
      setNewCategory() {
        const {category} = this;
        if(!category) {
          this.newCategory = {
            _id: null,
            name: '新建分组',
            description: '',
            friendsId: [],
          }
        } else {
          this.newCategory = JSON.parse(JSON.stringify(category));
        }
      },
      init(id) {
        const app = this;
        app.reset();
        let url;
        if(id) {
          url = `/message/category?cid=${id}`;
        } else {
          url = `/message/category`;
        }
        nkcAPI(url, 'GET')
          .then(data => {
            const {category, users} = data;
            app.users = users;
            if(id) {
              app.category = category
            } else {
              app.editCategory();
            }
          })
          .catch(sweetError);
      },
      editCategory() {
        this.clickHeaderRightButton();
      },
      closePage() {
        this.reset();
        closePage(this);
      },
      clickHeaderRightButton() {
        if(!this.showForm) {
          this.setNewCategory();
          this.showForm = true;
        } else {
          this.saveForm();
        }
      },
      onClickUser(uid) {
        openUserPage(this, 'UTU', uid);
      },
      addUser(uid) {
        const {newCategory} = this;
        if(!newCategory.friendsId.includes(uid)) {
          newCategory.friendsId.push(uid);
        }
      },
      removeUser(uid) {
        const {newCategory} = this;
        const index = newCategory.friendsId.indexOf(uid);
        if(index !== -1) {
          newCategory.friendsId.splice(index, 1);
        }
      },
      saveForm() {
        const {newCategory} = this;
        const {_id, name, description, friendsId} = newCategory;
        const type = _id? 'modifyCategory': 'createCategory';
        const app = this;
        nkcAPI(`/message/category`, 'POST', {
          type,
          _id,
          name,
          description,
          friendsId
        })
          .then((data) => {
            const {categoryId} = data;
            app.reload(categoryId);
          })
          .catch(sweetError);
      },
      removeCategory() {
        const {category} = this;
        const app = this;
        sweetQuestion(`确定要删除当前分类？`)
          .then(() => {
            return nkcAPI(`/message/category?cid=${category._id}`, 'DELETE')
          })
          .then(() => {
            app.closePage();
          })
          .catch(sweetError);
      }
    }
  }
</script>