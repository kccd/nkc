<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title {{mode === 'selector'? '选择专业': '移动文章'}}
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .text-center.m-t-1.m-b-1(v-if="loading") 加载专业列表中...
      div(v-else)
        .move-thread-selected-forums
          h5 已选择的专业：
            span(v-if="!selectedForums.length") 无
          .move-thread-forum-name(
            :style="'background-color: ' + forum.color" v-for="forum, index in selectedForums"
          )
            span(@click="showThreadType(forum)") {{forum.displayName}}
              span(v-if="forum.selectedThreadType") ：{{forum.selectedThreadType.name}}
            .fa.fa-remove(@click="removeForum(index)")
          .move-thread-thread-types(v-if="forum && forum.threadTypes && forum.threadTypes.length && mode === 'move'")
            .move-thread-thread-type(@click="resetThreadType") 不分类
            .move-thread-thread-type(v-for="t in forum.threadTypes" @click="selectThreadType(t)") {{t.name}}
          .m-t-05(v-if="mode === 'move'")
            div
              b 移动方式：
              .radio.inline-block.m-t-0
                label.m-r-1
                  input(type="radio" value="add" v-model="moveType")
                  | 添加专业
                label
                  input(type="radio" value="replace" v-model="moveType")
                  | 删除原有专业
          .m-t-05(v-if="showAnonymousCheckbox")
            span
              b 只显示允许匿名发表的专业：
              .radio.inline-block.m-t-0
                label.m-r-1
                  input(type="radio" :value="true" v-model="onlyAnonymous")
                  | 是
                label
                  input(type="radio" :value="false" v-model="onlyAnonymous")
                  | 否

        .move-thread-select-forums-button
          .paging-button
            //forumCategories
            a.button(v-for='c in forumCategories' @click="forumType = c._id" :class="{'active': forumType===c._id}") {{c.name}}
            //a.button.radius-left(@click="forumType = 'topic'" :class="{'active': forumType==='topic'}") 话题
            //a.button.radius-right(@click="forumType = 'discipline'" :class="{'active': forumType==='discipline'}") 学科
        .move-thread-select-forums(:class="{'topic': forumType === 'topic'}")
          .move-thread-forum-body(v-for="forum in showForums")
            .move-thread-forum-name {{forum.displayName}}
              .fa.fa-plus(v-if="!forum.childrenForums || forum.childrenForums.length === 0" @click="selectForum(forum)")
            .move-thread-child-forums(v-if="forum.allChildForums && forum.allChildForums.length")
              .move-thread-forum-name(
                :style="'background-color: ' + f.color" v-for="f in forum.allChildForums"
                v-if="!onlyAnonymous || f.allowedAnonymousPost"
                @click="selectForum(f)"
              )
                //img(:src='getUrl("forumLogo", f.logo)')
                | {{f.displayName}}
                .fa.fa-plus
        .move-thread-category(v-if='mode === "move"')
          strong 更改属性
          thread-category-list(
            :categories='threadCategories'
            :tcid='selectedThreadCategoriesId'
            ref='threadCategoryList'
          )
        .move-thread-options(v-if='mode === "move"')
          .checkbox
            label
              input(type='checkbox' :value='true' v-model='remindUser')
              span 通知用户
          textarea.form-control(placeholder='请输入原因' rows=3 v-model='reason' v-if='remindUser')
          .checkbox
            label
              input(type='checkbox' :value='true' v-model='violation')
              span 标记为违规
      .modal-footer
        .display-i-b(v-if="submitting") 处理中，请稍候...
        button(type="button" class="btn btn-default btn-sm" data-dismiss="modal") 关闭
        button(v-if="submitting" type="button" class="btn btn-primary btn-sm" disabled) 确定
        button(v-else type="button" class="btn btn-primary btn-sm" @click="submit") 确定
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.module-dialog-body {
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

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;

    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }

  .module-dialog-content {
    padding: 0 1rem;
  }
}
.forum-body{
  overflow: hidden;
}
.forum-name{
  font-size: 1.3rem;
}
.move-thread-forum-name{
  display: block;
  height: 2.2rem;
  line-height: 2.2rem;
  font-weight: 700;
}
.move-thread-forum-name img{
  height: 1.4rem;
  width: 1.4rem;
  border-radius: 2px;
  vertical-align: text-bottom;
  margin-right: 0.5rem;
}
.move-thread-select-forums-button{
  background-color: #eee;
  padding: 0 0.5rem;
}
.move-thread-child-forums .move-thread-forum-name, .move-thread-selected-forums .move-thread-forum-name {
  display: inline-block;
  font-size: 1rem;
  padding: 0 0.5rem;
  font-weight: normal;
  border-radius: 3px;
  cursor: pointer;
  margin: 0 0.5rem 0.5rem 0;
  color: #fff;
}
.move-thread-selected-forums h5{
  font-weight: 700;
}
.move-thread-selected-forums{
  margin-bottom: 0;
  padding: 0.5rem 0.5rem 0 0.5rem;
  background-color: #eee;
}
.move-thread-select-forums{
  max-height: 40rem;
  overflow-y: scroll;
  background-color: #eee;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 3px;
}
.move-thread-select-forums.topic{
  background-color: #d9e1e8;
}
@media (max-width: 767px) {
  .move-thread-select-forums{
    max-height: 30rem;
  }
}
.move-thread-thread-type{
  display: inline-block;
  margin: 0 0.5rem 0.5rem 0;
  height: 2rem;
  line-height: 2rem;
  padding: 0 0.5rem;
  cursor: pointer;
  border-radius: 3px;
  background-color: #999;
  color: #fff;
}

.move-thread-category{
  padding: 0.5rem;
  background-color: #eee;
}
</style>
<script>
import List from "../../../publicModules/threadCategory/list";
import {DraggableElement} from "../../js/draggable";
import {getUrl} from "../../js/tools";
export default {
  data: () => ({
    show: false,
    mode: 'move', // move, selector
    forums: [],
    selectForumCategory: true,
    selectedForums: [],
    loading: true,
    moveType: "replace", // replace, add
    forumType: "", // discipline, topic
    forum: "",
    hideMoveType: false,
    forumCategories: [],
    showAnonymousCheckbox: false,
    onlyAnonymous: false,
    forumCountLimit: 20,
    submitting: false,
    showRecycle: false,
    threadCategories: [],
    selectedThreadCategoriesId: [],

    recycleId: '',

    violation: false,
    remindUser: true,
    reason: ''
  }),
  components: {
    'thread-category-list': List,
  },
  computed: {
    canSelectForums: function() {
      var forums = this.forums;
      var arr = [];
      for(var i = 0; i < forums.length; i++) {
        arr = arr.concat(forums[i].allChildForums || []);
      }
      return arr;
    },

    selectedForumsId: function() {
      var arr = [];
      for(var i = 0; i < this.selectedForums.length; i++) {
        arr.push(this.selectedForums[i].fid);
      }
      return arr;
    },
    showForums: function() {
      var arr = [];
      for(var i = 0 ; i < this.forums.length; i++) {
        var forum = this.forums[i];
        // if(forum.forumType === this.forumType) {
        if(forum.categoryId === this.forumType) {
          if(!this.onlyAnonymous) {
            arr.push(forum);
            continue;
          }
          for(var ii = 0; ii < forum.allChildForums.length; ii++) {
            var ff = forum.allChildForums[ii];
            if(ff.allowedAnonymousPost) {
              arr.push(forum);
              break;
            }
          }
        }
      }
      return arr;
    }
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  mounted() {
    this.initDraggableElement();
  },
  methods: {
    getUrl: getUrl,
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()
    },
    getCategory: function(forum, categoriesId) {
      var threadTypes = forum.threadTypes;
      for(var i = 0; i < threadTypes.length; i++) {
        var threadType = threadTypes[i];
        if(categoriesId.indexOf(threadType.cid + "") !== -1 || categoriesId.indexOf(threadType.cid) !== -1) {
          return threadType;
        }
      }
    },
    getForumsById: function(fid) {
      var canSelectForums = this.canSelectForums;
      for(var i = 0; i < canSelectForums.length; i++) {
        if(fid === canSelectForums[i].fid) return canSelectForums[i];
      }
    },
    getAllChildForums: function(forum, arr) {
      if(forum.childrenForums && forum.childrenForums.length > 0) {
        for(var i = 0; i < forum.childrenForums.length; i++) {
          var f = forum.childrenForums[i];
          if(!f.childrenForums || f.childrenForums.length === 0) {
            if(this.showRecycle || f.fid !== this.recycleId) {
              f.selectedThreadType = "";
              arr.push(f);
            }
          }
          this.getAllChildForums(f, arr);
        }
      }
      return arr;
    },
    selectForum: function(f) {
      if(this.selectedForumsId.indexOf(f.fid) !== -1) return;
      if(this.selectedForums.length >= this.forumCountLimit) return sweetWarning("最多只能选择" + this.forumCountLimit + "个专业");
      this.selectedForums.push(f);
      this.forum = "";
    },
    removeForum: function(index) {
      this.selectedForums.splice(index, 1);
      this.forum = "";
    },
    submit: function() {
      var forums = [];
      for(var i = 0; i < this.selectedForums.length;i ++) {
        var f = this.selectedForums[i];
        forums.push({
          fid: f.fid,
          cid: f.selectedThreadType? f.selectedThreadType.cid: "",
          fName: f.displayName,
          description: f.description,
          iconFileName: f.iconFileName,
          logo: f.logo,
          banner: f.banner,
          cName: f.selectedThreadType? f.selectedThreadType.name: "",
          color: f.color
        });
      }
      if(forums.length === 0 && this.moveType === 'replace') return screenTopWarning("请至少选择一个专业");
      let selectedThreadCategoriesId = [];
      if(this.mode === 'move') {
        selectedThreadCategoriesId = this.getSelectedThreadCategoriesId();
      }
      this.callback({
        forumsId: this.selectedForumsId,
        forums: forums,
        moveType: this.moveType,
        originForums: this.selectedForums,
        violation: this.violation,
        reason: this.reason,
        remindUser: this.remindUser,
        threadCategoriesId: selectedThreadCategoriesId
      });
    },
    getSelectedThreadCategoriesId() {
      return this.$refs.threadCategoryList.getSelectedCategoriesId();
    },
    showThreadType: function(forum) {
      this.forum = forum;
    },
    selectThreadType: function(t) {
      this.forum.selectedThreadType = t;
      this.forum = "";
    },
    resetThreadType: function() {
      this.forum.selectedThreadType = "";
      this.forum = "";
    },
    open(callback, options = {}) {
      this.callback = callback;
      const self = this;
      nkcAPI("/f", "GET")
        .then(function(data) {
          self.recycleId = data.recycleId;
          for(var i = 0; i < data.forums.length; i++) {
            self.forum = data.forums[i];
            forum.allChildForums = self.getAllChildForums(forum, []);
          }
          self.forums = data.forums;
          self.loading = false;
          self.forumCategories = data.forumCategories;
          self.threadCategories = data.threadCategories;
          self.selectForumCategory = options.selectForumCategory;
          self.selectedThreadCategoriesId = options.selectedThreadCategoriesId || [];
          self.mode = options.mode || 'move';
          if(!self.forumType) self.forumType = self.forumCategories[0]._id;
          self.forumCountLimit = 20;
          if(options) {
            self.showRecycle = options.showRecycle || false;
            if(options.selectedForumsId && options.selectedForumsId.length > 0) {
              var selectedForums = [];
              var forumsId = options.selectedForumsId;
              for(var i = 0; i < forumsId.length; i++) {
                var f = self.getForumsById(forumsId[i]);
                if(f) {
                  if(options.selectedCategoriesId) {
                    f.selectedThreadType = self.getCategory(f, options.selectedCategoriesId);
                  }
                  selectedForums.push(f);
                }
              }
              self.selectedForums = selectedForums;
            }
            if(options.hideMoveType) {
              self.hideMoveType = true;
              self.mode = 'selector';
            }
            self.showAnonymousCheckbox = options.showAnonymousCheckbox || false;
            if(options.forumCountLimit) self.forumCountLimit = options.forumCountLimit;
          }
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      setTimeout(function() {
        this.selectedForums = [];
        this.moveType = "replace";
        this.showAnonymousCheckbox = false;
        this.onlyAnonymous = false;
        this.forumType = "";
        this.unlock();
      }, 500);
    },
    lock() {
      this.submitting = true;
    },
    unlock() {
      this.submitting = false;
    },
  },
}
</script>
