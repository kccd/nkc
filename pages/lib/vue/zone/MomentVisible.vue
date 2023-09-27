<template>
  <Draggable ref="draggable" title="电文设置" maxWidth="20rem">
    <template slot="content">
      <div class="moment-visible">
        <header class="m-b-1">
          <label>
            <input type="radio" value="own" v-model="visibleType"></input>
            仅自己可见
          </label>
          <label>
            <input type="radio" value="attention" v-model="visibleType"></input>
            关注可见
          </label>
          <label>
            <input type="radio" value="everyone" v-model="visibleType"></input>
            所有人可见
          </label>
        </header>
        <footer>
          <button class="btn-secondary btn btn-xs m-r-05 btn-default" @click="cancel">取消</button>
          <button class="btn-primary btn btn-xs btn-default" @click="submit">确定</button>
        </footer>
      </div>
    </template>
  </Draggable>
</template>

<script>
import Draggable from "../publicVue/draggable.vue";
import Footer from "../publicVue/footer/Footer.vue";
import { nkcAPI } from "../../js/netAPI"
import { sweetError } from '../../js/sweetAlert'
export default {
  name: "MomentVisible.vue",
  data:()=>({
    disabled:false,
    visibleType:"everyone",
    mid:''
  }),

  components:{
    Footer,
    Draggable
  },
  computed:{
    draggable(){
      return this.$refs.draggable
    }
  },
  methods:{
    //初始化数据
    getInit(){
      nkcAPI()
    },
    open(mid){
      this.mid = mid
      nkcAPI(`/moment/${mid}/visible`,'GET').then((res)=>{
        this.visibleType = res.visibleType
      }).catch((error)=>{
        sweetError(error)
      })
      this.draggable.open()
    },
    close(){
      this.draggable.close()
    },
    submit(){
      nkcAPI(`/moment/${this.mid}/visible?visibleType=${this.visibleType}`,'PUT').then(()=>{
        this.close()
      }).catch((error)=>{
        sweetError(error)
      })
    },
    cancel(){
      this.close()
    }
  }
};
</script>

<style scoped lang="less">

.moment-visible {
  padding: 0.5rem;
  header {
    &>label {
      display: block;
      font-weight: normal;
      &>input {
        margin-right: 0.5rem;
        cursor: pointer;
      }
    }
  }
  nav {
    &>span{
      font-weight: bold;
    }
    &>label {
      font-weight: normal;
      &>input {
        margin-right: 0.5rem;
        cursor: pointer;
      }
    }
  }

  footer {
    text-align: right;
  }
}

</style>
