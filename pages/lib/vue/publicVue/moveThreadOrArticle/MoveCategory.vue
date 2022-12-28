<template lang="pug">
  .move-category
      .thread-categories(v-if="processCategories && processCategories.length > 0" )
        .thread-category(v-for='c in processCategories')
          div(v-if='c.nodes.length > 0')
            .thread-category-name(:title='c.description')
              span {{c.name}}（
              span(v-if="c.selectedNode === null") 未选择
              span(v-else-if="c.selectedNode === 'default'") 已选择：{{c.nodeName}}
              span(v-else) 已选择：{{c.selectedNode.name}}
              span ）
            .editor-thread-category-description.m-b-05(v-if="c.description && isShowWarn") {{ c.description }}
            .editor-thread-category-warning.bg-warning.text-warning.p-a-05.bg-border.m-b-05(
              v-if="c.warning && isShowWarn"
            ) 注意事项：{{ c.warning}}
            .thread-category-nodes
              .thread-category-node(
                @click='selectThreadCategory(c, "default")'
                :class="{ active: !c.selectedNode || c.selectedNode === 'default' }"
              )
                span {{c.nodeName}}
              .thread-category-node(
                v-for='n in c.nodes'
                @click='selectThreadCategory(c, n)'
                :class='{"active": c.selectedNode === n}'
                :title='n.description'
              )
                span {{n.name}}
            .editor-thread-category-warning.bg-warning.text-warning.p-a-05.bg-border(
              v-if="c.selectedNode && c.selectedNode.warning && isShowWarn"
            ) 注意事项：{{ c.selectedNode.warning }}
        span.text-danger 注意：仅更改已选择类别的文章属性
      .thread-categories(v-else) 暂无~~


</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.move-category {
  padding: 0.5rem;
  background-color: #eee;

  .thread-categories {
    user-select: none;

    .thread-category {
      .thread-category-name {
        margin-bottom: 0.5rem;
      }

      .thread-category-node {
        display: inline-block;
        box-sizing: border-box;
        height: 2.6rem;;
        line-height: 2.6rem;;
        padding: 0 1rem;
        background-color: #fff;
        border: 1px solid #aaa;
        border-radius: 3px;
        color: #555;
        margin: 0 0.8rem 0.8rem 0;
        cursor: pointer;

        &.active {
          color: #fff;
          background-color: @primary;
          border-color: @primary;
        }
      }
    }
  }
}
</style>
<script>
export default {
  props: {
    selectedCid: {
      type: Array
    },
    // 用于弹窗不显示注意事项 'dialog',不传或其他字符会显示
    componentType: {
      type: String
    }
  },
  data: () => ({
    source: "", // thread, article
    categories: [],
    processCategories: [],
    callback: null,
    isShowWarn: true,
  }),
  created() {
    if(this.componentType && this.componentType === 'dialog'){
      this.isShowWarn = false;
    }
  },
  computed: {
    selectedCategoriesId() {
      const categoriesId = [];
      for(const c of this.processCategories) {
        if(c.selectedNode === null) continue;
        categoriesId.push({
          cid: c._id,
          nodeId: c.selectedNode === 'default'? 'default': c.selectedNode._id
        });
      }
      return categoriesId;
    }
  },
  mounted() {
  },
  methods: {
    initCategories() {
      let {selectedCid = [], categories = []} = this;
      categories = JSON.parse(JSON.stringify(categories));
      for(const c of categories) {
        c.selectedNode = null; // null: 未选择, 'default': 默认, {Number}: 具体的属性 ID
        for(const n of c.nodes) {
          if(selectedCid.includes(n._id)){
            c.selectedNode = n;
            break;
          }
        }
      }
      this.processCategories = categories;
    },
    getSelectedCategoriesId() {
      return this.selectedCategoriesId;
    },
    selectThreadCategory(c, n) {
      if(c.selectedNode === n) {
        c.selectedNode = null;
      } else {
        c.selectedNode = n;
      }
      this.callback(this.selectedCategoriesId);
      this.$emit('selectedCategories',this.selectedCategoriesId)
    },
    open(callback, options = {}) {
      this.callback = callback;
      const self = this;
      self.source = options.source;
      nkcAPI(`/e/settings/threadCategory/source/${options.source}`, "GET")
        .then(function(data) {
          self.categories = data.categoryTree;
        })
        .then(()=>{
          self.initCategories();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
  },
}
</script>
