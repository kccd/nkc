<template lang="pug">
  .finance-box
    .finance-context
      h4 我的资产
        small(v-for="item in targetUserScores").p-l-1.text-success {{item.name}}
          strong.h4.text-danger &nbsp;{{item.number / 100}}&nbsp;
          span {{item.unit}}
      .m-b-1
        a.btn.btn-success.btn-sm(href="/account/finance/recharge" target="_blank") 充值
        span &nbsp;
        a.btn.btn-default.btn-sm(href="/account/finance/withdraw" target="_blank") 提现
        span &nbsp;
        a.btn.btn-default.btn-sm(href="/account/finance/exchange" target="_blank") 兑换
      .finance-context-nav.m-b-1
        li(:class="navType==='all'?'active':''" @click="navTypeChange('all')") 所有
        li(:class="navType==='in' ?'active':''" @click="navTypeChange('in')") 收入
        li(:class="navType==='payout'?'active':''" @click="navTypeChange('payout')") 支出
      .m-b-1(v-if="pageButtons.length > 0")
        paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
      .finance-context-table.table-responsive
        table.table.table-bordered.table-striped(v-if="navType !== 'all'" )
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
                span(v-if="t === 'in'" )
                  span(v-if="item.from === 'bank'" ) {{nkcBankName}}
                  a(:href='getUrl("userHome", item.fromUser.uid)' target="_blank" v-else-if="item.fromUser") {{item.fromUser.username}}
                  span(v-else) {{item.from}}
                span(v-else-if="t === 'payout'" )
                  span(v-if="item.to === 'bank'" ) {{nkcBankName}}
                  a(:href='getUrl("userHome", item.toUser.uid)' target="_blank" v-else-if="item.toUser") {{item.toUser.username}}
                  span(v-else) {{item.to}}
              th {{item.num / 100}}
              th
                a(:href="item.url" target="_blank" v-if="item.url" ) 查看详情
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
                  a(:href="item.url" target="_blank" v-if="item.url" ) 查看详情
                  span(v-if="item.ordersId && item.ordersId.length !== 0" ) {{'订单号（'+item.ordersId.join(', ')+'）'}}
        .text-center(v-if="kcbsRecords && kcbsRecords.length === 0") 暂无记录
      .m-b-1(v-if="pageButtons.length > 0")
        paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")

</template>
<style lang="less" scoped>
.finance-box {
  .finance-head {
    user-select: none;
    position: relative;
    text-align: right;
    .fa {
      font-size: 1.2rem;
      cursor: pointer;
    }
    .finance-head-link {
      position: absolute;
      right: 0;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
      padding: 15px;
      background-color: #fff;
      border-radius: 3px;
      a {
        display: block;
        color: #555;
        text-align: center;
        padding: 0 15px;
        height: 3rem;
        line-height: 3rem;
        cursor: pointer;
        transition: background-color 100ms;
        &:hover {
          background-color: #f4f4f4;
          text-decoration: none;
        }
      }
    }
  }
  .finance-context {
    background: #fff;
    .finance-context-nav {
      border-bottom: 1px solid #ddd;
      &::after {
        content: '';
        display: block;
        height: 0;
        visibility: hidden;
        clear: both;
      }
      li {
        list-style: none;
        float: left;
        margin: 0 1px -2px 1px;
        cursor: pointer;
        padding: 10px 15px;
        color: #337ab7;
        &:hover {
          background: #dcdcdc;
          border-radius: 2px;
        }
      }
      .active {
        color: #555;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 2px;
        border-bottom-color: transparent;
        &:hover {
          background-color: #fff;
        }
      }
    }
    .finance-context-table {
      margin-top: 1rem;
      font-size: 1rem;
    }
  }
  .table-content {
    max-width: 10rem;
  }
}
</style>
<script>
import { nkcAPI } from '../../../../../lib/js/netAPI';
import { timeFormat } from '../../../../../lib/js/time';
import { getState } from '../../../../../lib/js/state';
import Paging from '../../../../../lib/vue/Paging';
import { getUrl } from '../../../../../lib/js/tools';
const { uid: visitUserId } = getState();

export default {
  props: ['targetUid'],
  data: () => ({
    targetUserScores: null,
    show: false,
    navType: 'all',
    nkcBankName: null,
    kcbsRecords: null,
    t: null,
    targetUser: null,
    paging: null,
    uid: null,
  }),
  components: {
    paging: Paging,
  },
  created() {
    const { uid } = this.$route.params;
    this.uid = this.targetUid || uid || visitUserId;
    this.getUserAccountInfo();
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue
        ? this.paging.buttonValue
        : [];
    },
  },
  mounted() {
    window.addEventListener('click', this.clickOther);
  },
  methods: {
    getUrl,
    timeFormat: timeFormat,
    getUserAccountInfo(page = 0, type = '') {
      const self = this;
      let url = `/u/${self.uid}/profile/financeData?page=${page}`;
      if (type) {
        url += `&t=${type}`;
      }
      nkcAPI(url, 'GET')
        .then((res) => {
          self.targetUserScores = res.targetUserScores;
          self.kcbsRecords = res.kcbsRecords;
          self.nkcBankName = res.nkcBankName;
          self.t = res.t;
          self.paging = res.paging;
          self.targetUser = res.targetUser;
          // self.nkcBankName = res.nkcBankName;
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    //打开操作框
    operationShow() {
      this.show = !this.show;
    },
    //点击其他地方关闭操作
    clickOther() {
      const showType = this.show;
      if (showType) {
        this.show = false;
      } else {
        return;
      }
    },
    navTypeChange(type) {
      this.navType = type;
      // this.getUserAccountInfo(this.paging.page, type);
      this.getUserAccountInfo(0, type);
    },
    clickBtn(num) {
      this.getUserAccountInfo(num, this.t);
    },
  },
  beforeDestroy() {
    // 实例销毁之前对点击事件进行解绑
    window.removeEventListener('click', this.clickOther);
  },
};
</script>
