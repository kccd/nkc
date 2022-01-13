<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 位置选择
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      //- 资源分组列表
      .folders.loading(v-if="loading") 加载中...
      .folders(v-else="!loading")
        .folder-name(@click="selectCategory('default')" :class="{active:selectCid === 'default'}")
          span 默认
        .folder-name(v-for="item in categories" @click="selectCategory(item._id)" :class="{active:selectCid === item._id}")
          span {{item.name}}
          .folder-option
            .fa.fa-edit(@click="editCategory(item, 'modify')" title="编辑")
            .fa.fa-trash-o(@click="editCategory(item, 'delete')" title="删除")
    .modal-footer
      //- .nav-info(v-if="path") {{path}}
      .options-button.option-add
        a.active(@click="editCategory('', 'create')") 添加
      .options-button
        a(data-dismiss="modal" @click="close") 关闭
        a.active(@click="submit" :class="{'disabled': !selectCid}") 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 30rem;
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
    .folders {
      user-select: none;
      margin: 0.5rem 0 1rem 0;
      height: 15rem;
      overflow-y: auto;
      .active {
        background: #bbd5e8;
        border-radius: 2px;
      }
      .folder-name {
        cursor: pointer;
        position: relative;
        height: 2.5rem;
        padding-right: 4.5rem;
        line-height: 2.5rem;
        padding-left: 2.5rem;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        .folder-option {
          position: absolute;
          top: 0;
          right: 1rem;
          height: 100%;
          text-align: right;
          font-size: 1.5rem;
          color: #9baec8;
          .fa {
            position: relative;
            height: 2.5rem;
            width: 1.75rem;
            text-align: center;
            transition: color 100ms;
            display: inline-block;
            &:hover {
              color: #337ab7;
            }
          }
        }
        &:hover {

        }
      }
    }
  }
  .modal-footer {
    text-align: right;
    .option-add {
      float: left;
    }
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";
import {getUrl} from "../js/tools";
import {nkcAPI} from "../js/netAPI";
export default {
  props: ['categories'],
  data: () => ({
    show: false,
    loading: true,
    selectCid: '',
    callback: ''
  }),
  mounted() {
    this.initDraggableElement();
  },
  computed: {
  },
  methods: {
    getUrl: getUrl,
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
    },
    // 点击确定
    submit() {
      if(!this.selectCid) return;
      if(!this.callback) this.close();
      this.callback(this.selectCid);
    },
    // 选择文件夹
    selectFolder(f) {
      this.folder = f;
    },
    // 加载文件夹列表
    // 默认只加载顶层文件夹
    // 可通过lid加载指定的文件夹，并自动定位、展开上级目录
    initFolders(lid) {
    },
    //选中分组
    selectCategory(cid) {
      this.selectCid = cid;
    },
    //编辑分组
    editCategory(item, type) {
      const self = this;
      self.$emit('edit-category', item, type)
    },
    open(callback, options = {}) {
      const {categories} = options;
      this.callback = callback;
      this.draggableElement.show();
      this.show = true;
      this.loading = false;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      setTimeout(() => {
        this.selectCid = '';
      }, 500)
    }
  }
}
</script>
