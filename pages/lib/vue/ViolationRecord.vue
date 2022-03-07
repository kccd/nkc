<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 违规记录
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .modal-body
        p 拉黑数：{{blacklistCount.count}}, 被拉黑数：{{blacklistCount.tCount}}
        //- 加载完了并且有至少一条记录
        div(v-if="!loading && list.length")
          p(v-for="res, index of list")
            span.time {{timeFormat(res.toc)}}
            span.type {{res.type}}
            span.reason {{res.reason}}
        //- 加载完了并且没有违规记录
        span(v-else-if="!loading && !list.length") 无违规记录
        //- 没加载完
        span(v-else) 加载中...
      .modal-footer
        button.btn.btn-primary.btn-sm(@click='close()') 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  text-align: left;
  display: none;
  position: fixed;
  width: 46rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
    span{
      margin-right: 0.5rem;
      &.time{
        font-style: oblique;
        color: #555;
      }
      &.type{
        color: @accent;
      }
    }
  }
}
</style>

<script>
import {nkcAPI} from "../js/netAPI";
import {DraggableElement} from "../js/draggable";
import {timeFormat} from "../js/tools";
export default {
  data: () => ({
    show: false,
    list: [],
    loading: true,
    blacklistCount: {},
  }),
  mounted() {
    this.initDraggableElement();
  },
  methods: {
    timeFormat: timeFormat,
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
    },
    submit: function() {
    },
    open(props) {
      const {uid} = props;
      if(!uid) return;
      const self = this;
      self.list = [];
      self.loading = true;
      nkcAPI("/u/" + uid + "/violationRecord", "GET")
        .then(function(res){
          self.loading = false;
          self.list = res.record;
          self.blacklistCount = res.blacklistCount;
        })
      .catch(err => {
        sweetError(err);
      })
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
    },
  }
}
</script>
