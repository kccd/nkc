<template lang="pug">
  div
    move-category(
      :selected-cid='tcId'
      ref='moveCategoryList'
      @selectedCategories="selectedCategories"
    )
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";

</style>
<script>
import MoveCategory from "./MoveCategory";
export default {

  props: {
    tcId:{
      require: true,
      type: Array
    }
  },
  components: {
    'move-category':MoveCategory
  },
  data: () => ({
  }),
  computed:{

  },
  mounted() {
    this.$refs.moveCategoryList.open(()=>{},{source:'article'})
  },
  methods: {
    selectionStatus(tcId, articleCategories) {
      if(!tcId && articleCategories) return articleCategories
      if(!articleCategories && !articleCategories.length) return
      const newThreadCategories = JSON.parse(JSON.stringify(articleCategories))
      for( let obj of newThreadCategories) {
        obj.selectedNode = ''
        for (let node of obj.nodes) {
          if(tcId.includes(node._id)) {
            obj.selectedNode = node
          }
        }
      }
      return newThreadCategories;
    },

    selectedCategories(data){
      const selectedCategoriesIdList = data.map(item=>{
        if(item.nodeId === 'default'){
          return false
        }else {
          return item.nodeId
        }
      }).filter(Boolean);
      this.$emit('outSelectedCategoriesId', selectedCategoriesIdList)
    }
  },
}
</script>
