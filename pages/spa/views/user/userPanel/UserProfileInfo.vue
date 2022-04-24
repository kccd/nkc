<template lang="pug">
  .user-info(v-if="targetUser")
    .user-column(v-if="targetUser.column")
      .panel-header 他的专栏
      .m-b-2
        .column-item
          .column-avatar
            img(:src="getUrl('columnAvatar', targetUser.column.avatar)")
          .column-content
            a.column-title(:href="`/m/${targetUser.column._id}`") {{targetUser.column.name}}
            .column-focus-count {{targetUser.column.subCount}}人关注
    .user-information
      .panel-header 个人简介
      .m-b-2
        .information-item
          .description(v-if="targetUser.description" v-html="description")
          .description(v-else) 暂无简介
          .register-time {{timeFormat('YYYY/MM/DD', targetUser.toc)}}注册， 活动于{{fromNow(targetUser.tlv)}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.user-info {
  .code {
    text-align: center;
    height: 3rem;
    line-height: 3rem;
    font-size: 1.5rem;
  }
  .user-column {
    .column-item {
      .column-avatar {
        display: table-cell;
        vertical-align: top;
        background-color: #fff;
        img {
          box-sizing: border-box;
          width: 4rem;
          height: 4rem;
          margin-right: 1rem;
          border-radius: 15%;
        }
      }
      .column-content {
        display: table-cell;
        vertical-align: top;
        width: 100%;
        a {
          vertical-align: top;
          font-size: 1.4rem;
          color: #0e0e0e;
          font-weight: bold;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
        }
        .column-focus-count {
          font-size: 1.2rem;
          font-weight: 600;
          color: #999;
          vertical-align: bottom;
        }
      }
    }
  }
  .user-information {
    .information-item {
      .description {
        font-size: 1.3rem;
        font-weight: 500;
        margin-bottom: 1rem;
        line-height: 1.5rem;
      }
      .register-time {
      }
    }
  }
}
</style>
<script>
import {getUrl, fromNow} from "../../../../lib/js/tools";
import {timeFormat} from "../../../../lib/js/time";
import {marked} from 'marked';
export default {
  props: ['targetUser'],
  data: () => ({
    uid: '',
    userColumn: null,
    userInformation: null,
  }),
  computed: {
    description() {
      const {description} = this.targetUser;
      const content = marked(description);
      return content;
    }
  },
  methods: {
    getUrl: getUrl,
    timeFormat: timeFormat,
    fromNow: fromNow,
  }
}
</script>
