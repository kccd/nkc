<template lang="pug">
  .thread-categories
    .thread-category(v-for='c in threadCategories' v-if='c.nodes.length > 0')
      .thread-category-name(:title='c.description')
        span {{c.name}}（
        span(v-if="c.selectedNode === null") 未选择
        span(v-else-if="c.selectedNode === 'default'") 已选择：{{c.nodeName}}
        span(v-else) 已选择：{{c.selectedNode.name}}
        span ）
      .thread-category-nodes
        .thread-category-node(
          @click='selectThreadCategory(c, "default")'
          :class='{"active": c.selectedNode === "default"}'
        )
          span {{c.nodeName}}
        .thread-category-node(
          v-for='n in c.nodes'
          @click='selectThreadCategory(c, n)'
          :class='{"active": c.selectedNode === n}'
          :title='n.description'
        )
          span {{n.name}}
    span.text-danger 注意：仅更改已选择类别的文章属性
</template>

<style lang="less" scoped>
  @import '../base';
  @nodeHeight: 2.6rem;
  .thread-categories{
    user-select: none;
  }
  .thread-category{
    //margin-bottom: 0.5rem;
  }
  .thread-category-name{
    margin-bottom: 0.5rem;
  }
  .thread-category-node{
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
    &.active{
      color: #fff;
      background-color: @primary;
      border-color: @primary;
    }
}
</style>

<script>
  export default {
    props: ['categories', 'tcid'],
    data: () => ({
      onlySelected: true,
      threadCategories: []
    }),
    mounted() {
      this.initCategories();
    },
    computed: {
      selectedCategoriesId() {
        const categoriesId = [];
        for(const c of this.threadCategories) {
          if(c.selectedNode === null) continue;
          categoriesId.push({
            cid: c._id,
            nodeId: c.selectedNode === 'default'? 'default': c.selectedNode._id
          });
        }
        return categoriesId;
      }
    },
    watch: {
    },
    methods: {
      initCategories() {
        let {tcid = [], categories = []} = this;
        categories = JSON.parse(JSON.stringify(categories));
        for(const c of categories) {
          c.selectedNode = null; // null: 未选择, 'default': 默认, {Number}: 具体的属性 ID
          for(const n of c.nodes) {
            const category = {
              id:n._id,
              boolean:tcid.includes(n._id,)
            }
            if(tcid.includes(n._id)){
              c.selectedNode = n;
              break;
            }
          }
        }
        this.threadCategories = categories;
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
      }
    }
  }
</script>