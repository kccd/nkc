<template>
  <draggable ref="draggable" :title="draggableTitle" max-width="28rem">
    <div slot="content" class="memo-editor-container">
      <div v-if="!loading">
        <div class="form">
          <div class="form-group">
            <label>提示信息（在用户名后显示）</label>
            <input type="text" class="form-control" v-model="nickname">
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea rows="4" class="form-control" v-model="desc"></textarea>
          </div>
          <div class="form-group m-b-0 text-right">
            <button class="btn btn-default btn-sm" @click="close">取消</button>
            <button class="btn btn-primary btn-sm" @click="submit">提交</button>
          </div>
        </div>
      </div>
    </div>
  </draggable>
</template>


<script>
import Draggable from './publicVue/draggable.vue'
import {nkcAPI} from "../js/netAPI";
import {sweetError} from '../js/sweetAlert'

export default {
  components: {
    'draggable': Draggable,
  },
  data: () => ({
    uid: '',
    username: '',
    nickname: '',
    desc: '',
    loading: true,
    callback: null,
  }),
  computed: {
    draggable() {
      return this.$refs.draggable
    },
    draggableTitle() {
      return `用户备注（${this.username}）`
    }
  },
  methods: {
    open(props) {
      const {callback, uid} = props;
      if(callback) this.callback = callback;
      this.uid = uid;
      this.draggable.open();
      nkcAPI(`/api/v1/users/memo?uid=${uid}`, 'GET', {})
        .then((res) => {
          if(res.data.memo) {
            this.nickname = res.data.memo.nickname;
            this.desc = res.data.memo.desc;
          }
          return nkcAPI(`/api/v1/user/${uid}/public-info`, 'GET')
        })
        .then((res) => {
          this.username = res.data.user.name;
        })
        .catch(sweetError)
        .finally(() => {
          this.loading = false;
        })
    },
    close() {
      this.draggable.close();
    },
    submit() {
      const {uid, nickname = '', desc = ''} = this;
      nkcAPI(`/api/v1/users/memo`, 'PUT', {
        uid,
        nickname,
        desc
      })
        .then(() => {
          this.close();
          sweetSuccess('提交成功')
        })
        .catch(sweetError)
    }
  }
}
</script>

<style lang="less">
  .memo-editor-container{
    padding: 1rem;
  }
</style>
