<template>
  <Draggable ref="draggable" title="电文设置" maxWidth="20rem">
    <template slot="content">
      <div class="moment-visible">
        <header class="m-b-1">
          <label>
            <input type="radio" value="own" v-model="status"></input>
            仅自己可见
          </label>
          <label>
            <input type="radio" value="attention" v-model="status"></input>
            关注可见
          </label>
          <label>
            <input type="radio" value="everyone" v-model="status"></input>
            所有人可见
          </label>
        </header>
<!--        <nav class="m-b-1">-->
<!--          <span>锁定：</span>-->
<!--          <label class="m-r-1">-->
<!--            <input type="radio" :value=true v-model="lock"></input>-->
<!--            开启-->
<!--          </label>-->
<!--          <label>-->
<!--            <input type="radio" :value=false v-model="lock"></input>-->
<!--            关闭-->
<!--          </label>-->
<!--        </nav>-->

        <footer>
          <button class="btn-secondary btn btn-xs m-r-05" @click="cancel">取消</button>
          <button class="btn-primary btn btn-xs" @click="submit">确定</button>
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
    status: "everyone",
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
        console.log(res, 'res');``
      }).catch((error)=>{
        sweetError(error)
      })
      this.draggable.open()
    },
    close(){
      this.draggable.close()
    },
    submit(){
      console.log(this.status, 'status');
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
