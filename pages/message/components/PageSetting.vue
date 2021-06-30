<template lang="pug">
  .page-setting.message-container
    ModuleHeader(
      :title="'设置'"
      :leftIcon="'fa fa-angle-left'"
      :rightIcon="'fa fa-save'"
      @onClickLeftButton="closePage"
      @onClickRightButton="save"
    )
    .page-setting-container
      .form(v-if="messageSettings")
        .form-group
          label 声音提醒：
          .checkbox
            label.m-r-1
              input(type="checkbox" :value="true" v-model="messageSettings.beep.usersMessage")
              span 私信
            label.m-r-1
              input(type="checkbox" :value="true" v-model="messageSettings.beep.systemInfo")
              span 系统通知
            label.m-r-1
              input(type="checkbox" :value="true" v-model="messageSettings.beep.reminder")
              span 系统提醒
        .form-group
          label 出售商品时允许所有人向我发消息：
          .radio
            label.m-r-1
              input(type="radio" :value="true" v-model="messageSettings.allowAllMessageWhenSale")
              span 是
            label
              input(type="radio" :value="false" v-model="messageSettings.allowAllMessageWhenSale")
              span 否
        .form-group
          label 防骚扰：
          .radio
            label.m-r-1
              input(type="radio" :value="true" v-model="messageSettings.limit.status")
              span 开启
            label.m-r-1
              input(type="radio" :value="false" v-model="messageSettings.limit.status")
              span 关闭
        div(v-if="messageSettings.limit.status")
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="messageSettings.limit.timeLimit")
              span 注册时间大于 30 天
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="messageSettings.limit.xsfLimit")
              span 有学术分
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="messageSettings.limit.digestLimit")
              span 有精选文章
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="messageSettings.limit.volumeA")
              span 通过 A 卷考试
          .checkbox
            label
              input(type="checkbox" :value="true" v-model="messageSettings.limit.volumeB")
              span 通过 B 卷考试
          h5 可以向我发短消息的最低用户等级：
          .radio
            label.m-r-1(v-for="g in grades")
              input(type="radio" :value="g._id" v-model="messageSettings.limit.gradeLimit")
              span {{g._id === 0? '不限制': g.displayName}}
</template>

<style lang="less" scoped>
  @import "../message.2.0.less";
  .page-setting-container{
    padding: 2rem;
    position: absolute;
    top: @headerHeight;
    width: 100%;
    bottom: 0;
    left: 0;
    overflow-y: auto;
  }
</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {closePage} from '../message.2.0.js';
  export default {
    data: () => ({
      messageSettings: null,
      grades: []
    }),
    components: {
      ModuleHeader
    },
    methods: {
      init() {
        const app = this;
        nkcAPI(`/message/settings`, 'GET')
          .then(data => {
            app.messageSettings = data.messageSettings;
            app.grades = data.grades;
          })
          .catch(sweetError)
      },
      closePage() {
        closePage(this);
      },
      save() {
        const {messageSettings} = this;
        nkcAPI(`/message/settings`, 'PUT', {
          messageSettings
        })
          .then(() => {
            sweetSuccess('保存成功');
          })
          .catch(sweetError);
      }
    }
  }
</script>