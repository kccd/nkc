<template lang="pug">
  .finance-box.b-s-10
    .finance-head
      .fa.fa-sliders.option-icon(@click.stop="operationShow")
      .finance-head-link(v-show="show")
        a(href=`/shop/order`)
          .fa.fa-file-text-o
          | 我的订单
        a(href=`/shop/manage/order`)
          .fa.fa-archive
          | 我出售的
        a(href=`/shop/cart`)
          .fa.fa-shopping-cart
          | 购物车
    .finance-context
      h4 我的资产
        small(v-for="item in targetUserScores").p-l-1.text-success {{item.name}}
          strong.h4.text-danger {{item.number / 100}}
          span {{item.unit}}
      .m-b-1
        a.btn.btn-success.btn-sm(href="/account/finance/recharge" target="_blank") 充值
        span &nbsp;
        a.btn.btn-default.btn-sm(href="/account/finance/withdraw" target="_blank") 提现
        span &nbsp;
        a.btn.btn-default.btn-sm(href="/account/finance/exchange" target="_blank") 兑换
      .finance-context-nav
        li(:class="navType==='all'?'active':''" @click="navTypeChange('all')") 所有
        li(:class="navType==='in' ?'active':''" @click="navTypeChange('in')") 收入
        li(:class="navType==='payout'?'active':''" @click="navTypeChange('payout')") 支出
      .finance-context-table.table-responsive
        table.table.table-bordered(v-if="navType !== 'all'" )
          thead
            tr
              th 时间
              th 账单ID
              th 积分名
              th 类型
              th 说明
              th
                span(v-if="t === 'in'" ) 支付者
                span(v-else-if="t === 'payout'" ) 收款人
              th 金额
              th 其他
          tbody(v-if="kcbsRecords && kcbsRecords.length >0 ")
            tr(v-for="item in kcbsRecords")
              th {{timeFormat("YYYY-MM-DD HH:mm:ss", item.toc)}}
              th {{item._id}}
              th {{item.scoreName}}
              th {{item.lang}}
              th
                .table-content(:title="item.description") {{item.description}}
              th
                span(v-if="t === 'in'" ) {{item.toUser.username || nkcBankName}}
                span(v-else-if="t === 'payout'" ) {{item.fromUser.username || nkcBankName}}
              th {{item.num / 100}}
              th
                a(:href="item.post.url" target="_blank" v-if="item.post" ) {{'文号（'+item.pid+'）'}}
                span(v-if="item.ordersId && item.ordersId.length !== 0" ) {{'订单号（'+item.ordersId.join(', ')}}
        table.table.table-bordered(v-else)
          thead
            tr
              th 时间
              th 账单ID
              th 积分名
              th 类型
              th 说明
              th 交易对象
              th 收入
              th 支出
              th 其他
          tbody(v-if="kcbsRecords && kcbsRecords.length >0 ")
              tr(v-for="item in kcbsRecords")
                th {{timeFormat("YYYY-MM-DD HH:mm:ss", item.toc)}}
                th {{item._id}}
                th {{item.scoreName}}
                th {{item.lang}}
                th
                  .table-content(:title="item.description") {{item.description}}
                th
                  span(v-if="(item.to === targetUser.uid) && !item.fromUser" ) {{nkcBankName}}
                  a(v-else-if="(item.to === targetUser.uid) && item.fromUser" :href="`/u/${item.from}`" target="_blank") {{item.fromUser.username}}
                  span(v-else-if="(item.to !== targetUser.uid) && !item.toUser" ) {{nkcBankName}}
                  a(v-else-if="(item.to !== targetUser.uid) && item.toUser" :href="`/u/${item.to}`" target="_blank") {{item.toUser.username}}
                th
                    span(v-if="item.to === targetUser.uid" ) {{item.num / 100}}
                th
                    span(v-if="item.from === targetUser.uid" ) {{item.num / 100}}
                th
                  a(:href="item.post.url" target="_blank" v-if="item.post" ) {{'文号（'+item.pid+'）'}}
                  span(v-if="item.ordersId && item.ordersId.length !== 0" ) {{'订单号（'+item.ordersId.join(', ')+'）'}}
        .text-center(v-if="kcbsRecords && kcbsRecords.length === 0") 暂无记录

</template>
<style lang="less" scoped>
.finance-box{
  padding: 15px;
  .finance-head{
    user-select: none;
    position: relative;
    text-align: right;
    .fa {
      font-size: 1.2rem;
      cursor: pointer;
    }
    .finance-head-link{
      position: absolute;
      right: 0;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
      padding: 15px;
      background-color: #fff;
      border-radius: 3px;
      a{
        display: block;
        color: #555;
        text-align: center;
        padding: 0 15px;
        height: 3rem;
        line-height: 3rem;
        cursor: pointer;
        transition: background-color 100ms;
        &:hover{
          background-color: #f4f4f4;
          text-decoration: none;
        }
      }
    }

  }
  .finance-context{
    background: #fff;
    .finance-context-nav{
      border-bottom: 1px solid #ddd;
      &::after{
        content: "";
        display: block;
        height: 0;
        visibility: hidden;
        clear: both;
      }
      li{
        list-style:none;
        float: left;
        margin: 0 1px -2px 1px;
        cursor: pointer;
        padding: 10px 15px;
        color: #337ab7;
        &:hover{
          background: #DCDCDC;
          border-radius: 2px;
        }
      }
      .active{
        color: #555;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 2px;
        border-bottom-color: transparent;
        &:hover{
          background-color: #fff;
        }
      }
    }
    .finance-context-table{
      margin-top: 1rem;
      font-size: 1rem;
    }
  }
}

</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {timeFormat} from "../../../../../lib/js/time";
import {getState} from "../../../../../lib/js/state";
export default {
  data: () => ({
    targetUserScores: null,
    show: false,
    navType:'all',
    nkcBankName: null,
    kcbsRecords: null,
    t: null,
    targetUser: null
  }),
  created() {
    this.uid = getState().uid;
    this.getUserAccountInfo();
  },
  mounted() {
    window.addEventListener("click", this.clickOther);
  },
  methods: {
    timeFormat: timeFormat,
    getUserAccountInfo(type){
      const self = this;
      let url = `/u/${this.uid}/profile/finance`;
      if(type){
        url += `?t=${type}`;
      }
      nkcAPI(url, 'GET')
        .then(res => {
          self.targetUserScores = res.targetUserScores;
          self.kcbsRecords = res.kcbsRecords;
          self.nkcBankName = res.nkcBankName;
          self.t = res.t;
          self.targetUser = res.targetUser;
          // self.nkcBankName = res.nkcBankName;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //打开操作框
    operationShow(){
      this.show = !this.show;
    },
    //点击其他地方关闭操作
    clickOther() {
      const showType = this.show;
      if(showType){
        this.show = false;
      }else {
        return;
      }
    },
    navTypeChange(type){
      this.navType = type;
      this.getUserAccountInfo(type);
    }
  },
  beforeDestroy() {  // 实例销毁之前对点击事件进行解绑
    window.removeEventListener('click', this.clickOther);
  }
}
</script>
