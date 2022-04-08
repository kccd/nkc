<template lang="pug">
  .userInfo
    .avatar( title="头像" )
      img(:src="setUrl( userData.avatar )")
    .describe
      .name( title="姓名" )
        a( :href="'/u/' + userData.uid" target="_blank") {{ userData.username }}
      .grade( title="等级" ) {{ userData.info?userData.info.certsName:'' }}
      .introduce( title="简介" ) {{ userData.description || "暂未填写个人简介"}}
    .follow-button( title="取消关注" @click="subscribe( userData.uid )" ) {{ setBtnText() }}
</template>
<script>
import { getUrl } from "../../../js/tools";
import { sweetError } from "../../../js/tools";
export default {
  data: () => ({
    userData: [],
    type: ""
  }),
  props: {
    user: {
      type: Object,
      required: true
    },
    pageType: {
      type: String,
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
    },
    pageType: {
      immediate: true,
      handler(n) {
        if (typeof n === "undefined") {
          console.error("pageType is undefined");
          return;
        }
        this.type = n;
      }
    }
  },
  created() {},
  methods: {
    setBtnText(){
      if ( this.type === "follow" ){
        this.reqMethod = "DELETE"
        return "取关"
      }else if (this.type === "fans"){
        if(this.user.mutualAttention){
          this.reqMethod = "DELETE"
          return "取关"
        }else{
          this.reqMethod = "POST"
          return "关注"
        }
      }
    },
    subscribe(id) {
      // var method = this.type === "follow" ? "DELETE" : "POST";
      nkcAPI("/u/" + id + "/subscribe", this.reqMethod, { cid: [] })
        .then(() => {
          this.$parent.getUserCardInfo()
        })
        .catch(e => {
          sweetError(e);
        });
    },
    setUrl(avatar) {
      return getUrl("userAvatar", avatar);
    }
  },
};
</script>
<style scoped lang="less">
.userInfo {
  height: 6rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  position: relative;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px 1px #f1d196 ;
  transition: all .5s linear;
  // &:hover{
    // box-shadow: 0 2px 5px 1px #bdac8e;
    // transform: translateY(-7px);
  // }
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
  // height: 1.6rem;
  padding: 0.25rem 1rem;
  // line-height: 1.6rem;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  color: #fff;
  border-radius: 5px;
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
