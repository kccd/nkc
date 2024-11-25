<template lang="pug">
  .module-dialog-body
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 位置选择
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      //- 资源分组列表
      .folders.loading(v-if="loading" ref="folders") 加载中...
      .folders(v-else="!loading" ref="folders")
        .folder-name(@click="selectCategory('default')" :class="{active:selectCid === 'default'}")
          span 默认
        .folder-name.folder-categories(v-for="item in categories" @click="selectCategory(item._id)" :data-cid="item._id" :class="{active:selectCid === item._id}")
          .fa.fa-bars.m-r-1.move-handle.folders-category-master-handles
          span {{item.name}}
          .folder-option
            .fa.fa-edit(@click.stop="editCategory(item, 'modify')" title="编辑")
            .fa.fa-trash-o(@click.stop="editCategory(item, 'delete')" title="删除")
    .modal-footer
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
    padding-right: 3rem;
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
        .move-handle {
          cursor: move;
        }
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
import Sortable from 'sortablejs';
import {nkcAPI} from "../js/netAPI";
import {debounce} from "../js/execution";
export default {
  props: [],
  data: () => ({
    show: false,
    loading: true,
    selectCid: '',
    callback: '',
    categories: [],
  }),
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  computed: {
  },
  methods: {
    getUrl: getUrl,
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
      if(this.draggableElement) {
        this.initSortable();
      }
    },
    //创建可拖动dom
    initSortable() {
      new Sortable(this.$refs.folders, {
        group: 'master',
        invertSwap: true,
        handle: '.folders-category-master-handles',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: this.saveOrder
      });
    },
    //获取用户资源分组
    getCategories: debounce(function () {
      const self = this;
      nkcAPI(`/rc`, 'GET', {})
        .then(res => {
          self.categories = res.categories;
        })
        .catch(err => {
          console.log(err);
          sweetError(err);
        })
    }, 300),
    //保存拖动后的顺序,并发送请求更改顺序
    saveOrder() {
      const self = this;
      const categories = $('.folder-categories');
      const orders = [];
      for(let i = 0;i < categories.length; i ++ ) {
        const m = categories.eq(i);
        let cid = m.attr('data-cid');
        if(!cid) continue;
        orders.push({
          cid,
          order: i
        });
      }
      nkcAPI('/rc/order', 'POST', {
        orders
      })
      .then((res) => {
        console.log('更改顺序成功！');
        self.$emit('order-change');
      })
      .catch(err => {
        sweetError(err);
      })
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
      self.$emit('edit-category', item, type, () => {
        self.getCategories();
      })
    },
    open(callback, options = {}) {
      const {categories} = options;
      this.categories = categories;
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
