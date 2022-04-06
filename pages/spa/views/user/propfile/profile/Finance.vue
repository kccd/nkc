<template lang="pug">
  .finance-box.b-s-10
    .finance-head
      a(href=`/shop/order`).finance-head-link
        .fa.fa-file-text-o
        | 我的订单
      a(href=`/shop/manage/order`).finance-head-link
        .fa.fa-archive
        | 我出售的
      a(href=`/shop/cart`).finance-head-link
        .fa.fa-shopping-cart
        | 购物车
    .finance-context
      h4 我的资产
        small(v-for="item in targetUserScores").p-l-1.text-success
          strong.h4.text-danger {{item.number / 100}}
          span {{item.unit}}

</template>
<style lang="less" scoped>
.finance-box{
  padding: 15px;
  .finance-head{
    .finance-head-link{
      display: inline-block;
      width: 33.33%;
      color: #555;
      text-align: center;
      height: 3rem;
      line-height: 3rem;
      cursor: pointer;
      transition: background-color 100ms;
      &:hover{
        background-color: #f4f4f4;
      }
      .fa{
        margin-right: 0.3rem;
        color: #555;
      }
    }
  }
}
</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {getState} from "../../../../../lib/js/state";
export default {
  data: () => ({
    targetUserScores: null,
  }),
  created() {
    const uid = getState().uid
    this.uid = uid
    this.getUserAccountInfo()
  },
  methods: {
    getUserAccountInfo(){
      const self = this;
      nkcAPI(`/u/${this.uid}/p/finance`, 'GET')
          .then(res => {
            self.targetUserScores = res.targetUserScores;
          })
          .catch(err => {
            sweetError(err);
          })
    }
  }
}
</script>