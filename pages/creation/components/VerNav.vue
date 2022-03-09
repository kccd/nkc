<template lang="pug">
  .creation-nav(ref="creationNav")
    //- :class="{'creation-nav-header-isApp': isApp}"
    a.creation-nav-header(@click.prevent="selectType('home', '/creation')" url='/creation') 创作中心
    button.collapsed(@click='openMenu()')
      span.sr-only
      span.icon-bar
      span.icon-bar
      span.icon-bar
    .creation-nav-contaior(ref="CNC")
      .creation-nav-item(v-for="item in list")
        .item(
          :class="selected.includes(item.type)? 'active':''"
          )
          .icon.left-icon
            .fa(:class="item.icon")
          .icon.right-icon
            .fa(
              :class="item.hidden?'fa-angle-down': 'fa-angle-up'"
              v-if="item.children && item.children.length > 0"
              )
          a.parent-title(:href="item.url"  @click.prevent="selectParentItem(item)") {{item.title}}
        .children(v-if="!item.hidden && item.children && item.children.length > 0")
          .item(
            v-for="childrenItem in item.children"
            :class="selected.includes(childrenItem.type)? 'active':''"
            )
            a.title(:href="childrenItem.url" @click.prevent="selectItem(childrenItem)") {{childrenItem.title}}
</template>

<style scoped lang="less">
  @import '../../publicModules/base';
  @max-width: 1000px;
  //  @media screen and (max-width: @max-width) {
    // .bottom{
    //   position: fixed;
    //   bottom: 0;
    //   background: rgba(135, 132, 132, 0.33);
    // }
    // .to-top{
    //   top: 0;
    // }
    // .showHeight{
    //   overflow: initial!important;
    // }
  //  }
  
  a{
    color: black;
    text-decoration: none;
  }
  button{
    display: none;
    border: none;
    background: transparent;
    @media screen and (max-width: @max-width) {
      .icon-bar{
        margin-top: 6px;
        background-color: black;
        width: 22px;
        height: 2px;
        border-radius: 1px;
        display: block;
      }
      display: block;
      position: absolute;
      top: -1.5rem;
      right: .5rem;
    }
  }
  .creation-nav{
    @media screen and (max-width: @max-width) {
      overflow: hidden;
      height: 0;
      transition: height .3s ease-in-out;
    }
    .creation-nav-header{
      @headerHeight: 4rem;
      height: @headerHeight;
      line-height: @headerHeight;
      font-size: 2rem;
      font-weight: 700;
      color: @accent;
      text-align: center;
      width: 100%;
      display: inline-block;
      cursor: pointer;
      user-select: none;
      @media screen and (max-width: @max-width){
        position: absolute;
        top: -1rem;
        left: 15px;
        font-size:1.5rem;
        font-weight: 600;
        height: 1.3rem;
        line-height: 1.3rem;
        margin-bottom: 0;
        float: left;
        text-align: left;
        width: auto;
      }
    }
    .item{
      @media screen and (max-width: @max-width){
        font-size:1rem;
        height: 1.3rem;
        color: #878484;
        line-height: 1.3rem;
        .icon{
          width: 0;
          height: 0;
        }
        .parent-title{
          color: #878484;
        }
      } 
      margin: 0 3rem 0 3rem;
      @itemHeight: 3rem;
      height: @itemHeight;
      line-height: @itemHeight;
      text-align: center;
      position: relative;
      font-size: 1.35rem;
      cursor: pointer;
      user-select: none;
      &:hover{
        color: @primary;
      }
      .icon{
        @media screen and (max-width: @max-width){
          display: none;
        }
        color: #555;
        height: @itemHeight;
        width: @itemHeight;
        line-height: @itemHeight;
        text-align: center;
        position: absolute;
        top: 0;
        &.left-icon{
          left: 0;
        }
        &.right-icon{
          right: 0;
        }
      }
      &.active{
        .title{
          color: @primary;
        }
      }
    }
    .children{
      @media screen and (max-width: @max-width){
        max-width: 35rem;
        margin: auto;
        margin-bottom: 10px;
      }
      .item{
        @media screen and (max-width: @max-width){
          margin: 0 1rem 0 1rem;
          height: 2rem;
          line-height: 2rem;
          display: inline-block;
          font-size: 1.3rem;
          color: black;
        }
        font-size: 1.2rem;
      }
    }
  }
  // .creation-nav-header-isApp{
  //   top: 1.7rem !important;
  // }
</style>

<script>
import { getState } from "../../lib/js/state";

  export default {
    name:'VerNav',
    data: () => ({
      showMenu: false,
      selected: [],
      isApp: false,
      list: [
        {
          type: 'creatContent',
          title: '内容创作',
          icon: 'fa-pencil',
          hidden: false,
          url:'',
          children: [
            {
              type: 'zoneEditor',
              title: '空间创作',
              url: '/creation/editor/zone',
              
            },
            {
              type: 'columnArticleEditor',
              title: '专栏创作',
              url: '/creation/editor/column',
            },
            {
              type: 'communityThreadEditor',
              title: '社区创作',
              url: '/creation/editor/community'
            },
            {
              type: 'bookEditor',
              title: '专题制作',
              url: '/creation/books/editor',
            },
            {
              type: 'draftEditor',
              title: '片段创作',
              url: '/creation/editor/draft'
            }
          ]
        },
        {
          type: 'manageContent',
          title: '内容管理',
          icon: 'fa-th-list',
          hidden: false,
          children: [
            {
              type: 'zone',
              title: '空间内容',
              url: '/creation/zone'
            },
            {
              type: 'column',
              title: '专栏内容',
              url: '/creation/column',
            },
            {
              type: 'community',
              title: '社区内容',
              url: '/creation/community'
            },
            {
              type: 'books',
              title: '专题内容',
              url: '/creation/books'
            },
            {
              type: 'drafts',
              title: '片段内容',
              url: '/creation/drafts'
            }
            /*{
              type: 'articles',
              title: '文章管理'
            },
            {
              type: 'manageComment',
              title: '评论管理'
            }*/
          ]
        },
        {
          type: 'categories',
          title: '媒体管理',
          icon: 'fa-image',
          url: '/creation/categories'
        },
        /*{
          type: 'drafts',
          title: '草稿管理',
          icon: 'fa-file-text-o'
        }*/
      ]
    }),
    watch: {
      $route: 'setNavActive'
    },
    created(){
      
    },
    mounted() {
      const { isApp } = getState();
      this.isApp = isApp;
      this.setNavActive()
    },
    methods: {
      openMenu(){
        // console.dir(this.$refs.CNC.clientHeight)
        this.$refs.creationNav.style.height = !this.showMenu ? this.$refs.CNC.clientHeight + 'px' : 0;
        // console.dir(this.$refs.creationNav.style.height)
        this.showMenu = !this.showMenu;
      },
      setNavActive() {
        const name = [];
        for(const m of this.$route.matched) {
          name.push(m.name);
        }
        this.selected = name;
      },
      selectParentItem(item){
        if(item.title !== "媒体管理"){
          if (/Mobi|Android|iPhone/i.test(navigator.userAgent) || document.body.clientWidth < 1000) {
                    // 当前设备是移动设备
            return
          }
        }
        
        this.selectItem(item)
      },
      selectItem(item) {
        
        if(item.children && item.children.length > 0) {
          item.hidden = !item.hidden;
        } else {
          this.selectType(item.type, item.url);
        }
      },
      selectType(type, url) {
        this.$emit('select', type, url);
      }
    }
  }
</script>

