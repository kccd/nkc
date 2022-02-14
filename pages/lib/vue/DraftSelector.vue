<template lang="pug">
  .draft-selector
    .module-header(ref="draggableHandle")
      .module-sd-title 草稿箱
      .module-sd-close.fa.fa-close(@click="close")
    .module-sd-body
      //-.module-content(v-if="loading")
        .null 加载中...
      .module-content
        .module-drafts
          .module-draft-warning.bg-warning.text-warning 此处只插入正文，如果要使用草稿中的其余内容，请点击继续创作。
          .paging-button
            a(:class="{'active': draftType === 'auto'}" @click="selectDraftType('auto')")
              .fa &nbsp;
              | 草稿
            a(:class="{'active': draftType === 'custom'}" @click="selectDraftType('custom')")
              .fa &nbsp;
              | 图文素材
          auto-drafts-box(ref="autoDraftsBox" v-if="draftType === 'auto'" @callback-data="insert")
          custom-drafts-box(ref="customDraftsBox" :type="true" v-else @callback-data="insert")

</template>
<style lang="less" scoped>
  .draft-selector{
    @import "../../publicModules/base";
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
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
      .module-sd-title{
        margin-left: 1rem;
        color: #666;
        cursor: move;
      }
      .module-sd-close{
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
    .module-sd-body{
      .module-content{
        .module-drafts{
          .paging-button{
            padding: 0.5rem 1rem 0 1rem;
          }
          .module-draft:last-child{
            border-bottom: none;
          }
          .module-draft-warning{
            font-size: 1rem;
            padding: 0.5rem 1rem;
          }
          .module-draft{
            padding: 0.3rem 1rem;
            border-bottom: 1px solid #eee;
            padding-right: 5.5rem;
            position: relative;
            &:hover{
              background-color: #f6f6f6;
            }
            .module-buttons{
              user-select: none;
              position: absolute;
              top: 0;
              right: 0.5rem;
              width: 5rem;
              div{
                font-size: 1rem;
                color: @primary;
                cursor: pointer;
                margin-bottom: 0.5rem;
                user-select: none;
              }
              div:first-child{
                margin-top: 0.7rem;
                margin-bottom: 0.5rem;
              }
              div:last-child{
                span:first-child{
                  color: @accent;
                }
                span:last-child{
                  font-weight: 700;
                }
                span.disabled{
                  color: #aaa;
                  cursor: not-allowed;
                }
              }
              div>span:hover{
                opacity: 0.7;
              }
            }
            .module-info{
              font-size: 1rem;
              font-style: oblique;
              height: 1.4rem;
              .hideText(@line: 1);
              &>div{
                display: inline;
              }
              .module-time{
                color: @accent;
                margin-right: 0.5rem;
              }
              .module-from{
                color: #666;
              }
            }
            .module-article-title{
              font-size: 1rem;
              color: #666;
              font-style: oblique;
              height: 1.4rem;
              .hideText(@line: 1);
              span{
                color: #333;
                font-style: normal;
              }
            }
            .module-article-content{
              font-size: 1rem;
              font-style: oblique;
              color: #666;
              max-height: 1.4rem;
              .hideText(@line: 1);
              overflow: hidden;
              span{
                font-style: normal;
                color: #333;
              }
            }
          }
        }
      }
    }
  }
</style>
<script>
  import AutoDraftsBox from "./drafts/AutoDraftsBox";
  import CustomDraftsBox from "./drafts/CustomDraftsBox";
  import {DraggableElement} from "../js/draggable";
  export default {
    data: () => ({
      draftType: 'auto',//选择草稿类型
      loading: true,
      draggableElement: null,
      callback: null,
    }),
    components: {
      'auto-drafts-box': AutoDraftsBox,
      'custom-drafts-box': CustomDraftsBox,
    },
    mounted() {
      this.initDraggableElement();
    },
    destroyed() {
      this.destroyDraggableElement();
    },
    methods: {
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      },
      destroyDraggableElement() {
        this.draggableElement.destroy();
      },
      selectDraftType(type) {
        this.draftType = type;
        const self = this;
        if(type === 'custom') {
          setTimeout(() => {
            self.$refs.customDraftsBox.getDrafts();
          }, 100)

        }
      },
      insert(data) {
        this.callback({content: data});
      },
      open(callback) {
        this.callback = callback;
        this.draggableElement.show();
      },
      close() {
        this.draggableElement.hide();
      }
    }
  }
</script>