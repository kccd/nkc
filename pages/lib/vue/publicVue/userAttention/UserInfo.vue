<template lang="pug">
  .userInfo
    .avatar( title="头像" )
      img(:src="setUrl( userData.avatar )")
    .describe
      .name( title="姓名" )
        a( :href="'/u/' + userData.uid" target="_blank") {{ userData.username }}
      .grade( title="等级" ) {{ userData.info.certsName }}
      .introduce( title="简介" ) {{ userData.description || "暂未填写个人简介"}}
    .follow-button( title="取消关注" @click="subscribe( userData.uid )" ) {{ this.pageType === "follow" ? "取关" : "关注" }}
</template>
<script>
import { getUrl } from "../../../js/tools";
import { sweetError } from "../../../js/tools";
import { EventBus } from "../eventBus";
export default {
  data: () => ({
    userData: [],
    pageType: ""
  }),
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(n) {
        if (typeof n === "undefined") {
          console.error("user is undefined");
          return;
        }
        this.userData = n;
      }
    }
  },
  created() {
    if (typeof this.$route.params.pageType === "undefined") {
      console.error("this.$route.params.pageType is undefined");
      return;
    }
    this.pageType = this.$route.params.pageType;
  },
  methods: {
    setButtonText() {
      switch (this.$route.params.pageType) {
        case "follow":
          return "取关";
        case "fans":
          return "关注";
        default:
          return "";
      }
    },
    subscribe(id) {
      var method = this.pageType === "follow" ? "DELETE" : "POST";
      nkcAPI("/u/" + id + "/subscribe", method, { cid: [] })
        .then(() => {
          EventBus.$emit("updateData", "follow");
        })
        .catch(e => {
          sweetError(e);
        });
    },
    setUrl(avatar) {
      return getUrl("userAvatar", avatar);
    }
  },
  destroyed() {
    EventBus.$off();
  }
};
</script>
<style scoped lang="less">
.userInfo {
  height: 6rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  position: relative;
  border: 1px solid #eee;
  /*display: -webkit-flex;*/
}
.userInfo .avatar {
  display: table-cell;
}
.userInfo .avatar img {
  height: 5rem;
  border-radius: 3px;
  width: 5rem;
}
.userInfo .describe {
  padding-left: 1rem;
  vertical-align: top;
  display: table-cell;
  /*flex-grow: 1;
  -webkit-flex: 1;*/
}
.userInfo .name {
  height: 1.6rem;
  font-size: 1.3rem;
  margin-right: 4rem;
  color: #2b90d9;
  display: inline-block;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.userInfo .follow-button {
  height: 1.6rem;
  padding: 0 1rem;
  line-height: 1.6rem;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  vertical-align: text-bottom;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
  background-color: #9baec8;
  border-color: #9baec8;
  float: right;
  font-size: 1rem;
}
.userInfo .grade {
  font-size: 1rem;
  height: 1.4rem;
  color: #e85a71;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.userInfo .introduce {
  height: 1.6rem;
  padding-top: 0.2rem;
  font-size: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
</style>
