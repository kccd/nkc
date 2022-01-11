<template>
  <div>
      <template v-for="(child,j) in data">
        <RootTree  :key="j" :data='child' :childIndex="j.toString()" :level="0" :operations="operations" :funcs="funcs" :disable="disable"></RootTree>
      </template>
    </div>
</template>
<script>
import RootTree from "./index.vue";
export default {
  components: {
    RootTree,
  },
  props: {
    data: Array,
    operations: {
      type: Boolean,
      default: true,
    },
    funcs:Object,
    disable:{
      type:Object,
      default:()=>({})
    }
  },
  data() {
    return{
      isOpen: false,
    }
  },
  methods: {
    toggle() {
       this.isOpen = !this.isOpen;
    },
  }
};
</script>
<style scoped>

</style>