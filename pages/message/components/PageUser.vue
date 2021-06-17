<template lang="pug">
  .page-user.message-container
    ModuleHeader(
      :title="'用户详情'"
      :leftIcon="'fa fa-angle-left'"
      :rightIcon="rightIcon"
      @onClickRightButton="removeFriend"
      @onClickLeftButton="closePage"
    )
    .chat-user
      div(v-if="tUser")
        .chat-user-base
          .chat-user-avatar
            img(:src="tUser.avatar")
          .chat-user-info
            a.chat-user-name(:href="tUser.homeUrl" target="_blank") {{displayName}}
            .chat-user-level
              img.chat-user-grade(:src="tUser.gradeIcon")
              span.chat-user-cert {{tUser.certsName}}
            .chat-user-description {{tUser.description}}
        hr
        .chat-user-options
          a(:href="tUser.homeUrl" target="_blank").btn.btn-block.btn-default 动态
          button.btn.btn-block.btn-default(@click="clickChatButton") 发消息
          button.btn.btn-block.btn-default(v-if="friend" @click="showFriendInfo = !showFriendInfo") 备注信息
          .form.friend-info(v-if="showFriendInfo")
            .form-group
              label 备注：
              input.form-control(type="text" v-model="friend.info.name")
            .form-group
              label 分组：
              .checkbox
                label.m-r-1(v-for="c in categories" :key="c._id")
                  input(type="checkbox" :value="c._id" v-model="friend.cid")
                  span {{c.name}}
            .form-group
              label 简介：
              textarea.form-control(rows="4" v-model="friend.info.description")
            .form-group
              label 地区：
              input.form-control(type="text" v-model="friend.info.location")
            .form-group
              label 电话：
              .m-b-05(v-for="(p, index) in phoneNumbers")
                .row
                  .col-xs-9
                    input.form-control(type="text" v-model="p.number")
                  .col-xs-3
                    button.btn.btn-default.btn-sm(@click="removeFromArr(phoneNumbers, index)") 删除
              button.btn.btn-block.btn-default(@click="addPhone") 添加电话
            .form-group
              label 图片
              .friend-image
                img(:src="imageUrl" v-if="imageUrl")
              button.btn.btn-block.btn-default(v-if="imageUrl" @click="removeImage") 删除图片
              button.btn.btn-block.btn-default(@click="selectImage") 选择图片
              input.hidden(ref="imageInput" type="file" accept="image/*" @change="selectedImage")
            .form-group
              button.btn.btn-primary.btn-sm.m-r-05(@click="saveFriendInfo") 保存
              button.btn.btn-default.btn-sm(@click="showFriendInfo = false") 取消
          button.btn.btn-block.btn-default(@click="toRemoveChat") 移除对话
          button.btn.btn-block.btn-default(v-if="!friend" @click="addFriend") 添加好友
          button.btn.btn-block.btn-default(v-if="friend" @click="removeFriend") 移除好友
          button.btn.btn-block.btn-default(v-if="!tUser.inBlacklist" @click="addToBlacklist") 加入黑名单
          button.btn.btn-block.btn-danger(v-else @click="removeFromBlacklist") 从黑名单移出

</template>
<style scoped lang="less">
  @import '../message.2.0.less';
  .chat-user{
    padding: 2rem;
    position: absolute;
    top: @headerHeight;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
  }
  .chat-user-base{
    @avatarHeight: 6rem;
    position: relative;
    padding-left: @avatarHeight + 1rem;
    min-height: @avatarHeight;
    .chat-user-avatar{
      position: absolute;
      width: @avatarHeight;
      height: @avatarHeight;
      top: 0;
      left: 0;
      img{
        height: 100%;
        width: 100%;
        border-radius: 3px;
      }
    }
  }
  .chat-user-name{
    font-size: 1.4rem;
  }
  .chat-user-info{
    .chat-user-grade{
      height: 1rem;
      width: 1rem;
      margin-right: 0.5rem;
    }
    .chat-user-cert{

    }
  }
  .friend-info{
    padding: 1rem 0.5rem 0.5rem 0.5rem;
    background-color: #f4f4f4;
    margin: 1rem 0;
  }
  .friend-image{
    img{
      max-width: 100%;
      margin-bottom: 1rem;
    }
  }
</style>
<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {
    closePage,
    openChatPage,
    removeChat
  } from '../message.2.0.js';
  export default {
    data: () => ({
      tUser: null,
      friend: null,
      categories: [],
      type: '',
      uid: '',

      showFriendInfo: false,

      phoneNumbers: [],

      imageData: '',
      imageFile: '',
    }),
    components: {
      ModuleHeader
    },
    computed: {
      imageUrl() {
        const {friend, imageData} = this;
        return imageData || friend.info.imageUrl;
      },
      displayName() {
        const {tUser, friend} = this;
        if(tUser) {
          let name = tUser.name || tUser.uid;
          if(friend && friend.info.name) {
            name += `（${friend.info.name}）`;
          }
          return name;
        } else {
          return '未知';
        }
      },
      rightIcon() {
        const {friend} = this;
        return friend? 'fa fa-trash-o':'';
      },
      phone() {
        const arr = [];
        for(const p of this.phoneNumbers) {
          if(p.number) arr.push(p.number);
        }
        return arr;
      }
    },
    methods: {
      reset() {
        this.tUser = null;
        this.friend = null;
        this.showFriendInfo = false;
      },
      reload() {
        this.showFriendInfo = false;
        this.init({type: this.type, uid: this.uid});
      },
      setPhoneNumbers() {
        const {phone} = this.friend.info;
        const arr = [];
        for(const p of phone) {
          arr.push({number: p});
        }
        this.phoneNumbers = arr;
      },
      init({type, uid}) {
        // 暂仅支持UTU
        const app = this;
        app.type = type;
        app.uid = uid;
        nkcAPI(`/message/user?uid=${uid}`, 'GET')
          .then((data) => {
            const {tUser, friend, categories} = data;
            app.tUser = tUser;
            app.friend = friend;
            app.categories = categories;
            if(app.friend) app.setPhoneNumbers();
          })
          .catch(sweetError);
      },
      closePage() {
        this.reset();
        closePage(this);
      },
      clickChatButton() {
        openChatPage(this, this.type, this.uid);
      },
      removeFriend() {
        const {displayName} = this;
        const {uid} = this.tUser;
        const app = this;
        return sweetQuestion(`确定要删除好友「${displayName}」？`)
          .then(() => {
            return nkcAPI(`/message/friend?uid=${uid}`, 'DELETE')
          })
          .then(() => {
            app.reload();
          })
          .catch(sweetError)
      },
      addFriend() {
        const {uid} = this;
        const app = this;
        return sweetPrompt('请输入验证信息')
          .then((description) => {
            return nkcAPI('/message/friend/apply', 'POST', {
              uid,
              description
            });
          })
          .then(() => {
            app.reload();
          })
          .catch(sweetError);
      },
      addToBlacklist() {
        const {displayName} = this;
        const {uid} = this.tUser;
        const app = this;
        return sweetQuestion(`确定要将用户「${displayName}」添加到黑名单？`)
          .then(() => {
            return nkcAPI(`/blacklist`, 'POST', {
              tUid: uid,
              from: 'message'
            })
          })
          .then(() => {
            app.reload();
          })
          .catch(sweetError)
      },
      removeFromBlacklist() {
        const {uid} = this.tUser;
        const app = this;
        nkcAPI(`/blacklist?tUid=${uid}`, 'DELETE')
        .then(() => {
          app.reload();
        })
        .catch(sweetError);
      },
      addPhone() {
        this.phoneNumbers.push({number: ''})
      },
      removeFromArr(arr, index) {
        arr.splice(index, 1);
      },
      selectImage() {
        this.$refs.imageInput.click();
      },
      selectedImage(e) {
        const files = e.target.files;
        if(files.length === 0) return;
        const file = files[0];
        const app = this;
        NKC.methods.fileToUrl(file)
          .then(imageData => {
            app.imageData = imageData;
            app.imageFile = file;
          })
          .catch(sweetError);
      },
      removeImage() {
        this.imageData = '';
        this.imageFile = null;
        this.friend.info.imageUrl = '';
        this.friend.info.image = false;
      },
      saveFriendInfo() {
        const app = this;
        const {tUser, friend, imageFile, phone, imageUrl} = this;
        const {info, cid} = friend;
        const {name, description, location} = info;
        const formData = new FormData();
        formData.append('friend', JSON.stringify({
          cid,
          name,
          description,
          location,
          phone,
          image: !!imageUrl,
          uid: tUser.uid
        }));
        if(imageFile) {
          formData.append('file', imageFile);
        }
        nkcUploadFile(`/message/friend`, 'PUT', formData)
          .then(data => {
            app.friend.info.imageUrl = data.imageUrl;
            sweetSuccess('保存成功');
          })
          .catch(sweetError);
      },
      toRemoveChat() {
        const {tUser} = this;
        removeChat(tUser.uid);
      }
    }
  }
</script>
