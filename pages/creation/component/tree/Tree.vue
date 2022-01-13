<template>
  <div>
      <template v-for="(child,j) in data">
        <!-- // 点击最外层 可以 但是如果点击 里层的这样子只会传入  最外层的状态 -->
        <RootTree  :key="j" :data='child' :childrenDisable="child.isMove" :childIndex="j.toString()" :level="0" :operations="operations" :bid="bid" ></RootTree>
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
    // disable:{
    //   type:Object,
    //   default:()=>({})
    // },
    bid:String
  },
  created(){
    // console.log(this.$props.data)

  },
  updated(){
    // console.log(this.$props.data.isMove,'this.$props.data.isMove')
    // if(this.childDisable)
    // this.childDisable= this.$props.data.isMove
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