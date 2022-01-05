<template lang="pug">
  .user-list-container
    ul.user-drawer-list
      li
        a(:href="'/u/' + user.uid + '/profile'")
          span.fa.fa-user-circle-o &nbsp;个人主页
          span.pull-right.fa.fa-angle-right
      li(v-if="column")
        a(:href="'/m/' + column._id")
          span.fa.fa-columns &nbsp;专栏
          span.pull-right.fa.fa-angle-right
      li(v-else-if="user && permission" )
        a(href=`/column/apply`)
          span.fa.fa-columns &nbsp;开设专栏
          span.pull-right.fa.fa-angle-right
      li
        a(onclick='messageApp.toChat()')
          span.fa.fa-envelope-o &nbsp;消息中心
            span.user-drawer-message.user-drawer-link.message-switch-div.message-count-container(class="hidden" )
              span.message-switch.message-count(class="hidden")
          span.pull-right.fa.fa-angle-right

      li
        a(:href="'/u/' + user.uid + '/profile/draft'")
          span.fa.fa-inbox &nbsp;我的草稿
            span(v-if="user && user.draftCount > 0") ({{user.draftCount}})
          span.pull-right.fa.fa-angle-right
      li
        a(:href="'/u/' + user.uid + '/profile/finance?t=all'")
          span.fa.fa-file-text-o &nbsp;我的账单
          span.pull-right.fa.fa-angle-right
    ul.user-drawer-list
      li
        a(:href="'/u/' + user.uid + '/settings'")
          span.fa.fa-cog &nbsp;设置
          span.pull-right.fa.fa-angle-right
    ul.user-drawer-list
      li
        a(href=`/shop/order/order`)
          span.fa.fa-file-text-o &nbsp;我的订单
          span.pull-right.fa.fa-angle-right
      li
        a(href=`/shop/manage/order`)
          span.fa.fa-archive &nbsp;我出售的
          span.pull-right.fa.fa-angle-right
      li
        a(href=`/shop/cart`)
          span.fa.fa-shopping-cart &nbsp;购物车
          span.pull-right.fa.fa-angle-right
</template>

<script>
export default {
  props: ['user', 'column', 'permission'],
  data: () => ({
  }),
  components: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.user-list-container{
  .user-drawer-list{
    padding: 1rem 0 0 0;
    margin-bottom: 0;
    li{
      list-style: none;
      a{
        margin: 0 1rem;
        padding: 0 1rem;
        font-weight: 700;
        display: block;
        height: 3.4rem;
        line-height: 3.4rem;
        font-size: 1.2rem;
        color: #282c37;
        .fa.pull-right {
          margin-left: 0.3em;
          height: 3.4rem;
          line-height: 3.4rem;
        }
        .fa{
          display: inline-block;
          font: normal normal normal 14px/1 FontAwesome;
          font-size: inherit;
          text-rendering: auto;
          -webkit-font-smoothing: antialiased;
        }
  }
}
}
}
</style>
