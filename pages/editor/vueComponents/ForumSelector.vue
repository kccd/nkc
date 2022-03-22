<template lang="pug">
div()
  .moduleForumSelectorApp(v-show="show" ref="selectForum")
    .draggable-panel-header
      .draggable-panel-title( ref="title") 选择专业
      .draggable-panel-right-button(@click='close')
        .fa.fa-remove
    .draggable-panel-body
      .draggable-panel-loading(v-if='loading') 加载中...
      .draggable-panel-content(v-else)
        .forum-selector
          div(v-if='!showThreadTypes')
            .forum-selector-forums
              .forum-selector-forum-item
                .forum-selector-forum(
                  :class="{'active': selectedForumCategory === c, 'disabled': disabledForumCategoriesId.includes(c._id)}"
                  v-for='c in forumData'
                  @click='selectForumCategory(c)'
                  :title='c.name + (c.description? "：" + c.description:"")'
                )
                  span {{c.name}}
              .forum-selector-forum-item
                .forum-selector-forum(
                  :class="{'active': selectedParentForum === pf, 'disabled': disabledAllForumsId.includes(pf.fid)}"
                  v-for='pf in selectedForumCategory.forums'
                  @click='selectParentForum(pf)'
                  :title='pf.displayName + (pf.description? "：" + pf.description:"")'
                  )
                  span {{pf.displayName}}
              .forum-selector-forum-item
                .forum-selector-forum(
                  :class="{'active': selectedForum === pf, 'disabled': disabledAllForumsId.includes(pf.fid)}"
                  v-if='selectedParentForum'
                  v-for='pf in selectedParentForum.childForums'
                  @click='selectForum(pf)'
                  :title='pf.displayName + (pf.description? "：" + pf.description:"")'
                )
                  span {{pf.displayName}}
          div(v-else)
            .forum-selector-forum-info
              div
                .forum-selector-forum-avatar
                  img.forum-selector-forum-avatar-img(v-if='selectedForum.logo'
                    :src="getUrl('forumLogo', selectedForum.logo)")
                  .forum-selector-forum-avatar-img(v-else :style='"background-color: " + selectedForum.color')
                .forum-selector-forum-name-container
                  .forum-selector-forum-name {{selectedForum.displayName}}
                  .forum-selector-forum-description
                    span(:title='selectedForum.description') {{selectedForum.description || '暂无简介'}}
              .forum-selector-forum-content
                .forum-selector-forum-thread-types
                  h5.text-danger 文章分类：
                  .forum-selector-forum-type(v-for='tt in selectedForum.threadTypes'
                    @click='selectThreadType(tt)'
                    :class="{'active': selectedThreadType === tt}"
                  ) {{tt.name}}
                  .forum-selector-forum-type(
                    @click='selectThreadType("none")' :class="{'active': selectedThreadType === 'none'}"
                  ) 不分类
                .forum-selector-forum-post-description.m-b-05
                  h5.text-danger 注意事项：
                  span {{selectedForum.noteOfPost || '暂无'}}
          .forum-selector-button
            span(v-if='!needThreadType')
              button.btn.btn-primary.btn-sm(v-if='selectedForum' @click='fastSubmit') 确定
              button.btn.btn-primary.btn-sm(v-else disabled title='请选择专业') 确定
            span(v-else-if='!showThreadTypes')
              button.btn.btn-default.btn-sm(v-if='!selectedForum' disabled) 下一步
              button.btn.btn-primary.btn-sm(v-else @click='next') 下一步
            span(v-else)
              button.btn.btn-default.btn-sm(@click='previous') 上一步
              button.btn.btn-primary.btn-sm(v-if='selectedThreadType' @click='submit') 确定
              button.btn.btn-primary.btn-sm(v-else disabled title='请选择文章分类') 确定
</template>

<script>
import { DraggableElement } from "../../lib/js/draggable";

export default {
  data: () => ({
    loading: true,
    // 专业数组
    forums: [],
    forumCategories: [],
    subscribeForumsId: [],
    selectedForumCategory: "",
    selectedParentForum: "",
    selectedForum: "",
    selectedThreadType: "",

    // 外部传入 已选择的专业ID 用于禁止选择已选专业 且参与专业分类的互斥判断
    selectedForumsId: [],
    // 外部传入 屏蔽的专业 同上
    disabledForumsId: [],
    // 外部传入 高亮的专业
    highlightForumId: "",
    show: false,
    needThreadType: true,
    showThreadTypes: false
  }),
  computed: {
    forumData() {
      const { forumCategories, forums } = this;
      const results = [];
      const forumsObj = [];
      for (const f of forums) {
        if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
        forumsObj[f.categoryId].push(f);
      }
      for (const c of forumCategories) {
        const f = forumsObj[c._id];
        if (!f) continue;
        c.forums = f;
        results.push(c);
      }
      return results;
    },
    subscribeForums() {
      const { forums, subscribeForumsId } = this;
      if (!subscribeForumsId.length) return [];
      const results = [];
      for (const f of forums) {
        for (const cf of f.childForums) {
          if (!subscribeForumsId.includes(cf.fid)) continue;
          results.push(cf);
        }
      }
      return results;
    },
    forumsObj() {
      const { forums } = this;
      const obj = {};
      for (const f of forums) {
        obj[f.fid] = f;
        for (const ff of f.childForums) {
          obj[ff.fid] = ff;
        }
      }
      return obj;
    },
    disabledForumCategoriesId() {
      const {
        selectedForumsId,
        forumsObj,
        forumCategoriesId,
        forumCategoriesObj
      } = this;
      let arr = [];
      let excludedForumCategoriesId = [];
      for (const fid of selectedForumsId) {
        const forum = forumsObj[fid];
        if (!forum) continue;
        const index = arr.indexOf(forum.categoryId);
        if (index !== -1) continue;
        const category = forumCategoriesObj[forum.categoryId];
        if (!category) continue;
        const { excludedCategoriesId } = category;
        excludedForumCategoriesId = excludedForumCategoriesId.concat(
          excludedCategoriesId
        );
      }
      arr = [];
      for (const cid of excludedForumCategoriesId) {
        if (arr.includes(cid)) continue;
        arr.push(cid);
      }

      return arr;
    },
    disabledAllForumsId() {
      return this.disabledForumsId.concat(this.selectedForumsId);
    },
    forumCategoriesId() {
      return this.forumCategories.map(fc => fc._id);
    },
    forumCategoriesObj() {
      const { forumCategories } = this;
      const obj = {};
      for (const fc of forumCategories) {
        obj[fc._id] = fc;
      }
      return obj;
    }
  },
  mounted() {
    this.$nextTick(()=>{
      this.draggable = new DraggableElement(this.$refs.selectForum, this.$refs.title)
    })
  },
  destroyed(){
    this.draggable.destroy()
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    open(callback, options = {}) {
      this.show = true;
      
      this.callback = callback;
      const {
        disabledForumsId = [],
        selectedForumsId = [],
        from = "writable",
        needThreadType = true,
        highlightForumId = ""
      } = options;
      this.disabledForumsId = disabledForumsId;
      this.selectedForumsId = selectedForumsId;
      this.needThreadType = needThreadType;
      this.highlightForumId = highlightForumId;
      this.resetSelector();
      // this.showPanel();
      nkcAPI(`/f?t=selector&f=${from}`, "GET")
        .then(data => {
          this.loading = false;
          this.initForums(data);
        })
        .catch(err => {
          console.log(err);
          sweetError(err);
        });
    },
    close() {
      this.show = false;
      this.resetSelector();
    },
    selectForumCategory(c) {
      if (this.disabledForumCategoriesId.includes(c._id)) return;
      this.selectedForumCategory = c;
      this.selectedForum = "";
      this.selectedParentForum = "";
      this.selectedThreadType = "";
    },
    initForums(data) {
      const { forumCategories, forums, subscribeForumsId } = data;
      const forumsObj = [];
      for (const f of forums) {
        if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
        forumsObj[f.categoryId].push(f);
      }
      for (const c of forumCategories) {
        c.forums = forumsObj[c._id] || [];
      }
      this.forums = forums;
      this.forumCategories = forumCategories;
      this.subscribeForumsId = subscribeForumsId;
      let category = null;
      for (let i = forumCategories.length - 1; i >= 0; i--) {
        const c = forumCategories[i];
        if (this.disabledForumCategoriesId.includes(c._id)) continue;
        category = c;
        if (
          this.selectedForumCategory &&
          this.selectedForumCategory._id === c._id
        ) {
          break;
        }
      }
      if (category) {
        this.selectForumCategory(category);
      } else {
        this.resetSelector();
      }
      this.highlightForum();
    },
    highlightForum() {
      const { forumData, highlightForumId } = this;
      if (!highlightForumId) return;
      let _selectedCategory, _selectedParentForum, _selectedForum;
      loop1: for (const c of forumData) {
        _selectedCategory = c;
        for (const pf of c.forums) {
          _selectedParentForum = pf;
          for (const f of pf.childForums) {
            if (highlightForumId === f.fid) {
              _selectedForum = f;
              break loop1;
            }
          }
        }
      }
      if (_selectedForum) {
        this.selectedForumCategory = _selectedCategory;
        this.selectedParentForum = _selectedParentForum;
        this.selectedForum = _selectedForum;
      }
    },
    selectParentForum(pf) {
      if (this.disabledAllForumsId.includes(pf.fid)) return;
      this.selectedParentForum = pf;
      this.selectedForum = "";
      this.selectedThreadType = "";
      if (this.selectedParentForum.childForums.length === 1) {
        this.selectForum(this.selectedParentForum.childForums[0]);
      } else if (this.selectedParentForum.childForums.length === 0) {
        this.selectForum(this.selectedParentForum);
      }
    },
    selectForum(f) {
      if (this.disabledAllForumsId.includes(f.fid)) return;
      this.selectedThreadType = "";
      this.selectedForum = f;
      if (f.threadTypes.length === 0) {
        this.selectThreadType("none");
      }
    },
    selectThreadType(tt) {
      this.selectedThreadType = tt;
    },
    next() {
      this.showThreadTypes = true;
    },
    previous() {
      this.showThreadTypes = false;
      this.selectedThreadType = "";
    },
    resetSelector() {
      this.selectedForumCategory = "";
      this.selectedForum = "";
      this.selectedParentForum = "";
      this.selectedThreadType = "";
      this.showThreadTypes = false;
    },
    submit() {
      const { selectedForum, selectedThreadType } = this;
      if (!selectedForum) return sweetError(`请选择专业`);
      if (!selectedThreadType) return sweetError(`请选择文章分类`);
      this.callback({
        forum: selectedForum,
        threadType: selectedThreadType === "none" ? null : selectedThreadType,
        fid: selectedForum.fid,
        cid: selectedThreadType === "none" ? "" : selectedThreadType.cid
      });
      this.close();
    },
    fastSubmit() {
      const { selectedForum } = this;
      if (!selectedForum) return sweetError(`请选择专业`);
      this.callback({
        forum: selectedForum,
        fid: selectedForum.fid
      });
      this.close();
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../publicModules/base";

.moduleForumSelectorApp {
  will-change: auto;  top: calc(50% - 22rem);
  left: calc(50% - 18rem);
  height: 43rem;
  min-height: 43rem;
  position: fixed;
  width: 36rem;
  box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.1);
  z-index: 5000;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  box-sizing: border-box;
  border-radius: 3px;
  // display: none;
  .draggable-panel-header {
    @headerHeight: 2.8rem;
    height: @headerHeight;
    position: relative;
    background-color: #dadada;
    padding-right: @headerHeight;
    border-radius: 3px 3px 0 0;
    user-select: none;
    .draggable-panel-title {
      line-height: @headerHeight;
      color: #000;
      padding: 0 0.5rem;
      cursor: all-scroll;
    }
    .draggable-panel-right-button {
      position: absolute;
      top: 0;
      right: 0;
      height: @headerHeight;
      width: @headerHeight;
      line-height: @headerHeight;
      text-align: center;
      font-size: 1.3rem;
      &:hover {
        background-color: red;
        color: #fff;
      }
    }
  }
  .draggable-panel-loading {
    margin-top: 3rem;
    text-align: center;
  }
}

.forum-selector {
  position: relative;
}
@categoryHeight: 3.6rem;
@forumsHeight: 33rem;
@buttonHeight: 3.4rem;
.forum-selector-categories {
  position: absolute;
  top: 0;
  left: 0;
  height: @categoryHeight;
  .forum-selector-category {
    display: inline-block;
    height: @categoryHeight / 2;
    line-height: @categoryHeight / 2;
    padding: 0 0.5rem;
    cursor: pointer;
    user-select: none;
    &.active,
    &:hover {
      color: @primary;
    }
  }
}
.forum-selector-forums {
  width: 100%;
  height: @forumsHeight + @categoryHeight;
  position: absolute;
  top: 0;
  left: 0;
  border-top: 1px solid #f4f4f4;
  border-bottom: 1px solid #f4f4f4;
  .forum-selector-forum-item {
    height: 100%;
    overflow-y: auto;
    float: left;
    width: 33.3%;
    border-right: 1px solid #f4f4f4;
    .forum-selector-forum {
      cursor: pointer;
      height: 2rem;
      line-height: 2rem;
      overflow: hidden;
      word-break: break-word;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      user-select: none;
      padding: 0 0.5rem;
      &:hover,
      &.active {
        background-color: @primary;
        color: #fff;
      }
      &.disabled,
      &.disabled:hover {
        background-color: #eaeaea;
        color: #b5b5b5;
        cursor: not-allowed;
      }
    }
  }
}
.forum-selector-button {
  height: @buttonHeight;
  line-height: @buttonHeight;
  width: 100%;
  top: @categoryHeight + @forumsHeight;
  left: 0;
  position: absolute;
  padding: 0 0.5rem;
  text-align: right;
}

.forum-selector-forum-info {
  padding: 0.5rem;
  .forum-selector-forum-avatar {
    display: table-cell;
    .forum-selector-forum-avatar-img {
      width: 4rem;
      height: 4rem;
      border-radius: 3px;
      margin-right: 1rem;
    }
  }
  .forum-selector-forum-name-container {
    display: table-cell;
    vertical-align: top;
    .forum-selector-forum-name {
      font-size: 1.4rem;
      font-weight: 700;
    }
  }
  .forum-selector-forum-content {
    height: 32rem;
    overflow-y: auto;
  }
  .forum-selector-forum-post-description {
    margin-top: 1rem;
  }
  .forum-selector-forum-post-description span {
    font-size: 1.35rem;
  }
  .forum-selector-forum-description {
    margin-top: 0.5rem;
    height: 1.8rem;
    overflow: hidden;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .forum-selector-forum-thread-types {
    //background-color: #f4f4f4;
    //padding: 0.5rem;
  }
  .forum-selector-forum-type {
    user-select: none;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.5rem;
    display: inline-block;
    background-color: #f4f4f4;
    margin: 0 0.5rem 0.5rem 0;
    border-radius: 2px;
    cursor: pointer;
    &:hover,
    &.active {
      background-color: @primary;
      color: #fff;
    }
  }
}</style
>>
