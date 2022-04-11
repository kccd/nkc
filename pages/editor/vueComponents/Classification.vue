<template lang="pug">
.m-b-2(v-if="['newThread'].indexOf(type) !== -1")
  .editor-header 专业分类
  .m-b-1
    .editor-main-forums
      h5 主分类（必选）
      .editor-main-forum(v-if="mainForum")
        .editor-main-forum-avatar(
          :style="'background-color: ' + mainForum.color",
          v-if="!mainForum.logo",
          :data-float-fid="mainForum.fid"
        )
        img.editor-main-forum-avatar(
          :src="setUrl('forumLogo', mainForum.logo)",
          v-else,
          :data-float-fid="mainForum.fid"
        )
        .editor-main-forum-name
          span(:data-float-fid="mainForum.fid") {{ mainForum.fName }}
          | :
          select(v-model="mainForum.cid")
            option(:value="null") 请选择分类
            option(v-for="tt in mainForum.forum.threadTypes", :value="tt.cid") {{ tt.name }}
            option(:value="''") 不分类
      button.btn.btn-default.btn-sm(@click="selectForumsByType('mainForum')") {{ mainForum ? '修改' : '选择' }}
      .editor-main-forum-note.bg-warning.text-warning.p-a-05.bg-border(
        v-if="mainForum && mainForum.forum.noteOfPost"
      ) 注意事项：{{ mainForum.forum.noteOfPost }}
  .m-b-1(v-if="minorForumCount.max > 0")
    .editor-main-forums
      h5 辅分类
        | &nbsp;(
        span(v-if="minorForumCount.min === 0") 可选
        span(v-else) 最少{{ minorForumCount.min }}个
        | ，最多{{ minorForumCount.max }}个）
      .editor-minor-forum-container(v-for="(mf, index) in minorForums")
        .editor-main-forum
          .editor-main-forum-avatar(
            :style="'background-color: ' + mf.color",
            v-if="!mf.logo",
            :data-float-fid="mf.fid"
          )
          img.editor-main-forum-avatar(
            :src="getUrl('forumLogo', mf.logo)",
            v-else,
            :data-float-fid="mf.fid"
          )
          .editor-main-forum-name
            span(:data-float-fid="mf.fid") {{ mf.forum.displayName }}
            | :
            select(v-model="mf.cid")
              option(:value="null") 请选择分类
              option(v-for="tt in mf.forum.threadTypes", :value="tt.cid") {{ tt.name }}
              option(:value="''") 不分类
            //span(v-if="mf.cName") ：{{mf.cName}}
          .fa.fa-trash-o(@click="removeSelectedForums(index + 1)", title="移除")
        .editor-main-forum-note.bg-warning.text-warning.p-a-05.bg-border(
          v-if="mf && mf.forum.noteOfPost"
        ) 注意事项：{{ mf.forum.noteOfPost }}
      button.btn.btn-default.btn-sm(
        v-if="!mainForum",
        disabled,
        title="请先选择主分类"
      ) 添加
      button.btn.btn-default.btn-sm(
        v-else-if="minorForums.length >= minorForumCount.max",
        disabled,
        title="辅分类数量已达上限"
      ) 添加
      button.btn.btn-default.btn-sm(
        v-else,
        @click="selectForumsByType('minorForum')"
      ) 添加
  div(v-if="threadCategories.length > 0")
    .editor-thread-category(
      v-for="c in threadCategories",
      v-if="c.nodes.length > 0"
    )
      .editor-header(:title="c.description") {{ c.name }}
      .editor-thread-category-description(v-if="c.description") {{ c.description }}
      .editor-thread-category-warning.bg-warning.text-warning.p-a-05.bg-border.m-b-05(
        v-if="c.warning"
      ) 注意事项：{{ c.warning }}
      .editor-thread-category-nodes
        .editor-thread-category-node(
          v-for="n in c.nodes",
          @click="selectThreadCategory(c, n)",
          :class="{ active: c.selectedNode === n }",
          :title="n.description"
        )
          span {{ n.name }} 
        .editor-thread-category-node(
          @click="selectThreadCategory(c, 'default')",
          :class="{ active: c.selectedNode === 'default' }"
        )
          span {{ c.nodeName }}
      .editor-thread-category-warning.bg-warning.text-warning.p-a-05.bg-border(
        v-if="c.selectedNode && c.selectedNode.warning"
      ) 注意事项：{{ c.selectedNode.warning }}
  forum-selector(ref="forumSelector")
</template>

<script>
import { getUrl } from "../../lib/js/tools";
// import { nkcAPI } from "../../lib/js/netAPI";
import ForumSelector from "./ForumSelector.vue";

export default {
  data: () => ({
    selectedForums: [],
    threadCategories: [],
    type: "newThread",
    minorForumCount: "",
    show: false
  }),
  components: {
    "forum-selector": ForumSelector
  },
  props: {
    data: {
      require: true,
      type: Object
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(n) {
        this.threadCategories = n.threadCategories || [];
        this.minorForumCount = n.minorForumCount || [];
        this.selectedForums = n.mainForums || [];
      }
    }
  },
  computed: {
    mainForum: function() {
      return this.selectedForums[0];
    },
    minorForums: function() {
      let arr = [].concat(this.selectedForums);
      arr.shift();
      return arr;
    },
    selectedForumsId() {
      let arr = [];
      let selectedForums = this.selectedForums;
      for (let i = 0; i < selectedForums.length; i++) {
        let forum = selectedForums[i];
        if (forum.fid) arr.push(forum.fid);
      }
      return arr;
    },
    selectedCategoriesId() {
      let arr = [];
      let selectedForums = this.selectedForums;
      for (let i = 0; i < selectedForums.length; i++) {
        let forum = selectedForums[i];
        if (forum.cid) arr.push(forum.cid);
      }
      return arr;
    }
  },
  methods: {
    getThreadCategoriesId() {
      const tcId = [];
      for (const tc of this.threadCategories) {
        if ([null, "default"].includes(tc.selectedNode)) continue;
        tc.selectedNode && tcId.push(tc.selectedNode._id);
      }
      return tcId;
    },
    setUrl(type, id) {
      return getUrl(type, id);
    },
    selectThreadCategory(c, n) {
      c.selectedNode = n;
      this.$forceUpdate();
    },
    selectForumsByType(type) {
      let self = this;
      // if (!window.ForumSelector)
      // window.ForumSelector = new NKC.modules.ForumSelector();
      let selectedForumsId = [].concat(self.selectedForumsId);
      let highlightForumId = "";
      if (type === "mainForum") {
        highlightForumId = selectedForumsId.shift();
      }
      this.$refs.forumSelector.open(
        r => {
          r.logo = r.forum.logo;
          r.color = r.forum.color;
          r.fName = r.forum.displayName;
          r.cName = r.threadType ? r.threadType.name : "";
          if (type === "mainForum") {
            Vue.set(self.selectedForums, 0, r);
          } else {
            if (self.selectedForumsId.indexOf(r.fid) !== -1) return;
            self.selectedForums.push(r);
          }
          this.$emit("selected-forumids", this.selectedForumsId);
        },
        {
          highlightForumId: highlightForumId,
          selectedForumsId: selectedForumsId,
          disabledForumsId: []
        }
      );
    },
    getData() {
      return {
        fids: this.selectedForumsId,
        cids: this.selectedCategoriesId,
        tcId: this.getThreadCategoriesId()
      };
    }
  }
};
</script>

<style scoped lang="less">
.editor-thread-category-nodes {
  @nodeHeight: 2.6rem;
  user-select: none;
  .editor-thread-category-warning {
    border-radius: 3px;
  }
  .editor-thread-category-node {
    display: inline-block;
    box-sizing: border-box;
    height: @nodeHeight;
    line-height: @nodeHeight;
    padding: 0 1rem;
    background-color: #fff;
    border: 1px solid #aaa;
    border-radius: 3px;
    color: #555;
    margin: 0 0.8rem 0.8rem 0;
    cursor: pointer;
    &.active {
      color: #fff;
      // background-color: @primary;
      // border-color: @primary;
    }
  }
}
.editor-thread-category-description {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}
.editor-main-forum-note {
  //background-color: #f4f4f4;
  padding: 0.5rem;
  border-radius: 3px;
  margin-bottom: 0.5rem;
}
.editor-main-forum-name {
  display: inline-block;
  font-size: 1rem;
  padding-left: 0.5rem;
  vertical-align: top;
}
.editor-main-forum-name select {
  border: 1px solid #dadada;
}
.editor-main-forum-avatar {
  height: 2.3rem;
  display: inline-block;
  width: 2.3rem;
  border-radius: 50%;
}
.editor-main-forum {
  display: inline-block;
  height: 2.4rem;
  color: #666;
  /* border: 1px solid #eee; */
  font-weight: 700;
  vertical-align: top;
  line-height: 2.4rem;
  border-radius: 1.2rem;
  vertical-align: top;
  padding-right: 2.4rem;
  position: relative;
  background-color: #f6f6f6;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  margin: 0 0.5rem 0.5rem 0;
  font-size: 0;
}
.editor-header {
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small {
  color: #88919d;
}
.editor-thread-category-nodes .editor-thread-category-node.active {
  color: #fff;
  background-color: #2b90d9;
  border-color: #2b90d9;
}
</style>
