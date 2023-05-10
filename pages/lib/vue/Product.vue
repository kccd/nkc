<template lang="pug">
  .product
    .row.m-b-2
      address-selector(ref="addressSelector")
      .col-xs-12.col-md-6
        .product-image-container
          .product-image-main-container
            img(:src="mainImage.normal" @click="openImage(mainImageIndex)" title="点击查看大图")
          .product-image-node-container
            .product-image-node(
              v-for="(image, index) in images"
              @click="setMainImage(index)"
              :class="{'active': mainImageIndex === index}"
              )
              .product-image-mask(v-if="mainImageIndex !== index")
              img(:src="image.normal")
      .col-xs-12.col-md-6
        .product-info-container(v-if="selectedProductParam")
          .product-desc(v-if="abstract.length > 0") {{abstract}}&nbsp;
            span.switch-handle(v-if="abstractIsLong" @click="switchAbstractStatus")
              span(v-if="!showFullAbstract") 展开
              span(v-else) 收起
          .product-keywords(v-if="store.keywords.length > 0")
            a(:href="'/search?c=' + keyword" v-for="keyword in store.keywords" target="_blank") {{keyword}}
          .product-price.m-b-1
            .user-price(v-if="limitVisitor")
              .new-price 售价：
                .money-type ¥
                .money-number 登录后可见
            .user-price(v-else-if="isStopSale && !showPriceWhenStopSale")
              .origin-price 售价：
                .money-type
                .money-number 商品已停售
            .user-price(v-else-if="vipPrice.enabled")
              .origin-price 原价：
                .money-type ¥
                .money-number {{originPrice}}
              .new-price 会员价：
                .money-type ¥
                .money-number {{vipPrice.price}}
            .discounted-price(v-else-if="discountedPrice.enabled")
              .origin-price 原价：
                .money-type ¥
                .money-number {{originPrice}}
              .new-price 优惠价：
                .money-type ¥
                .money-number {{transferPrice(selectedProductParam.price)}}
            .original-price(v-else)
              .new-price 售价：
                .money-type ¥
                .money-number {{originPrice}}

          .product-group.product-specification
            .product-option
              .product-option-name 规格
              .product-option-content
                .product-specification-item(
                  :class="{'active': selectedProductParamIndex === index}"
                  v-for="(param, index) in enabledParams"
                  @click="selectProductParam(index)"
                  )
                  span {{param.name}}
          .product-group.product-Inventory
            .product-option
              .product-option-name 库存
              .product-option-content
                span {{selectedProductParam.stocksSurplus}} 件
                span.user-count-limit(
                  v-if="purchaseLimitCount && purchaseLimitCount !== -1"
                  ) （此商品每人限购 {{purchaseLimitCount}} 件）
          .product-group.product-address
            .product-option
              .product-option-name.address-text 快递
              .product-option-content
                span.address-text {{productAddress}}&nbsp;至&nbsp;
                span.address-input(@click="selectAddress" placeholder="请选择收获地址")
                  input.address-input(disabled="disabled"  v-model="userAddress")
          .product-group.product-shippingCost
            .product-option
              .product-option-name 运费
              .product-option-content
                span(v-if="this.store.product.isFreePost") 免运费
                span(v-else)
                  select.product-shippingCost-select.m-r-1(v-model="userSelectedFreightIndex")
                    option(
                      v-for="(freight, index) in store.product.freightTemplates"
                      :value=`index`
                      ) {{freight.name}}
                  span ¥{{shippingCost}}
          .product-group.product-count
            .product-option
              .product-option-name 数量
              .product-option-content
                .count-icon(@click="changeUserSelectedCount(-1)")
                  minus-icon
                input.count-input(v-model.number="userSelectedCount")
                .count-icon(@click="changeUserSelectedCount(1)")
                  plus-icon
          .product-group.product-buttons
            .disabled-price.m-b-1(v-if="isStopSale") 商品已停售
            .disabled-price.m-b-1(v-else-if="isAdminBan") 商品被禁售
            span(v-else)
              button.m-r-1.btn.btn-danger(@click="buyNow" :disabled="isInventoryShortage") {{isInventoryShortage? "库存不足": "立即购买"}}
              button.m-r-1.btn.btn-default(@click="addToCar" :disabled="isInventoryShortage") 加入购物车
            button.btn.btn-default(v-if="permissions.banProduct" @click="disableProduct") {{isAdminBan?'取消禁售': '禁售'}}
    .row(v-if="store.product.dealInfo.dealAnnouncement").m-b-2
      .col-xs-12.col-md-12
        .product-notice
          .product-notice-title
            speaker-one-icon.product-notice-title-icon
            span 公告
          .product-notice-content {{store.product.dealInfo.dealAnnouncement}}

</template>


<script lang="ts">
import {getUrl} from '../js/tools.js';
import { openImageViewer } from "../js/imageViewer.js";
import {getState} from '../js/state.js';
import AddressSelector from "./AddressSelector.vue";
import {Plus as PlusIcon, Minus as MinusIcon, SpeakerOne as SpeakerOneIcon} from '@icon-park/vue'
import { addProductToCart, submitProductToBill, banSale } from "../js/product.js";
const {uid} = getState();
import {toLogin} from '../js/account.js';
const logged = !!uid;

import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  components: {
    'address-selector': AddressSelector,
    'plus-icon': PlusIcon,
    'minus-icon': MinusIcon,
    'speaker-one-icon': SpeakerOneIcon,
  },
  data: () => ({
    // 已选择的图片索引
    mainImageIndex: 0,
    // 已选择的规格索引
    selectedProductParamIndex: 0,
    timer: null,
    // 是否显示完整的商品简介
    showFullAbstract: false,
    // 用户选择的地址
    selectedUserAddress: '',
    // 用户输入的购买数量
    userSelectedCount: 1,
    // 用户选择的快递索引
    userSelectedFreightIndex: 0,
  }),
  computed: {
    // 商品停售时是否显示价格
    showPriceWhenStopSale() {
      return this.store.product.productSettings.priceShowAfterStop;
    },
    // 正常的规格（已排除被屏蔽的规格）
    enabledParams() {
      return this.store.product.productParams.filter(param => param.isEnable);
    },
    // 库存是否不足
    isInventoryShortage() {
      return this.selectedProductParam.stocksSurplus <= 0;
    },
    // 用户权限  banProduct：是否能禁售商品
    permissions() {
      return this.store.permissions;
    },
    // 是否已经被管理员禁售
    isAdminBan() {
      return this.store.product.adminBan;
    },
    // 每人限购的数量，-1为不限购
    purchaseLimitCount() {
      return this.store.product.purchaseLimitCount;
    },
    // 是否免运费
    isFreePost() {
      return this.store.product.isFreePost
    },
    // 运费价格总计
    shippingCost() {
      if(this.isFreePost) {
        return 0;
      }
      const targetFreight = this.store.product.freightTemplates[this.userSelectedFreightIndex];
      return this.transferPrice(targetFreight.firstPrice + (this.userSelectedCount - 1) * targetFreight.addPrice);
    },
    // 最终用户的地址
    userAddress() {
      return this.selectedUserAddress || this.store.userAddress;
    },
    // 发货地址
    productAddress() {
      const addressArr = this.store.product.dealInfo.address.split('/');
      let province = '';
      let city = '';
      let address = '';
      if (addressArr[0]) {
        province = addressArr[0];
      }
      if (addressArr[1]) {
        city = addressArr[1];
        const cityIndex = city.indexOf('&');
        if (cityIndex > -1) {
          city = city.substr(0, cityIndex);
        }
      }
      address = province + '/' + city;
      return address;
    },
    // 原价
    originPrice() {
      return this.transferPrice(this.selectedProductParam.originPrice)
    },
    // 会员折扣价
    vipPrice() {
      return {
        enabled: this.store.vipDiscount,
        price: this.transferPrice(this.selectedProductParam.price * this.store.vipDisNum / 100)
      }
    },
    // 优惠价
    discountedPrice() {
      return {
        enabled: this.selectedProductParam.originPrice !== this.selectedProductParam.price,
        price: this.transferPrice(this.selectedProductParam.price)
      }
    },
    // 是否已停售
    isStopSale() {
      return this.store.product.productStatus === "stopsale"
    },
    // 是否限制查看价格
    limitVisitor() {
      return !logged && !this.store.product.productSettings.priceShowToVisit
    },
    // 已选择的规格
    selectedProductParam() {
      return this.enabledParams[this.selectedProductParamIndex]
    },
    // 商品简介文字是否超长
    abstractIsLong() {
      return this.store.abstract.length > 50;
    },
    // 截取后的商品简介
    abstractShort() {
      let shortContent = this.store.abstract.slice(0, 50);
      if(this.abstractIsLong) {
        shortContent += '......';
      }
      return shortContent;
    },
    // 用户显示的商品简介
    abstract() {
      if(this.showFullAbstract) {
        return this.store.abstract;
      } else {
        return this.abstractShort;
      }
    },
    // 用于显示的商品图
    images() {
      const imageIds = this.store.product.imgIntroductions;
      const urls = [];
      for (const rid of imageIds) {
        urls.push({
          sm: getUrl('resource', rid, 'sm'),
          normal: getUrl('resource', rid),
          lg: getUrl('resource', rid, 'lg'),
        });
      }
      return urls;
    },
    // 用于显示商品大图
    mainImage() {
      return this.images[this.mainImageIndex];
    },
  },
  mounted() {
    // console.log(this.store)
    // 启动轮播图
    // this.setTimeoutToSwitchImage();
  },
  beforeMount() {
    this.clearTimeoutForSwitchImage();
  },
  methods: {
    // 禁售
    disableProduct() {
      banSale(this.store.product.productId, !this.isAdminBan);
    },
    // 立即购买
    buyNow() {
      if(!logged) return toLogin();
      submitProductToBill({
        count: this.userSelectedCount,
        productParamId: this.selectedProductParam._id,
        freightId: this.userSelectedFreightIndex,
      });
    },
    // 添加到购物车
    addToCar() {
      if(!logged) return toLogin();
      addProductToCart({
        count: this.userSelectedCount,
        productParamId: this.selectedProductParam._id,
        freightId: this.userSelectedFreightIndex,
      });
    },
    // 限制用户购买的数量
    fixUserSelectedCount() {
      if(this.userSelectedCount < 1) {
        this.userSelectedCount = 1;
      } else if(this.userSelectedCount > this.selectedProductParam.stocksSurplus) {
        this.userSelectedCount = this.selectedProductParam.stocksSurplus;
      }
      if(this.purchaseLimitCount != -1 && this.userSelectedCount > this.purchaseLimitCount) {
        this.userSelectedCount = this.purchaseLimitCount;
      }
    },
    changeUserSelectedCount(count) {
      this.userSelectedCount += count;
      this.fixUserSelectedCount();
    },
    selectAddress() {
      this.$refs.addressSelector.open(address => {
        this.selectedUserAddress = address.join("/")
      }, {})
    },
    transferPrice(price) {
      return (price / 100).toFixed(2);
    },
    selectProductParam(index) {
      this.selectedProductParamIndex = index;
    },
    switchAbstractStatus() {
      this.showFullAbstract = !this.showFullAbstract;
    },
    clearTimeoutForSwitchImage() {
      clearTimeout(this.timer)
    },
    setTimeoutToSwitchImage() {
      const self = this;
      this.clearTimeoutForSwitchImage();
      this.timer = setTimeout(() => {
        let index = this.mainImageIndex;
        index += 1;
        if(index >= this.images.length) {
          index = 0;
        }
        this.mainImageIndex = index;
        self.setTimeoutToSwitchImage();
      }, 3000)
    },
    setMainImage(index) {
      this.mainImageIndex = index;
    },
    openImage(index) {
      const images = [];
      for (let i = 0; i < this.images.length; i++) {
        const image = this.images[i];
        images.push({
          url: image.lg,
          name: `商品图 ${i + 1}`,
        });
      }
      openImageViewer(images, index);
    },
  },
})
</script>

<style lang="less" scoped>
@import "../../publicModules/base";
.product-image-container{
  margin-bottom: 1rem;
}
.product-image-main-container{
  padding-top: 70%;
  position: relative;
  border: 1px solid #ddd;
  //background-color: #000;
  margin-bottom: 2rem;
  //border-radius: 3px;
  img{
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    max-height: 100%;
    max-width: 100%;
  }
}
.product-image-node-container{
  overflow: hidden;
  font-size: 0;
  .product-image-node{
    overflow: hidden;
    border: 1px solid #ddd;
    &.active{
      border-color: orangered;
    }
    font-size: 0;
    //background-color: #000;
    padding-top: 16%;
    position: relative;
    cursor: pointer;
    width: 19.2%;
    margin-right: 1%;
    display: inline-block;
    border-radius: 3px;
    .product-image-mask{
      position: absolute;
      z-index: 20;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(0,0,0,0.1);
    }
    img{
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      max-height: 100%;
      max-width: 100%;
    }
  }
  & .product-image-node:last-child{
    margin-right: 0;
  }
}
.product-info-container{
  margin-bottom: 2rem;
  .product-desc{
    font-size: 1.25rem;
    margin-bottom: 1rem;
    .switch-handle{
      font-size: 1.2rem;
      color: @primary;
      font-weight: 700;
      cursor: pointer;
    }
  }
  .product-keywords{
    background-color: #ffefda;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: 3px;
    a{
      margin: 0 0.5rem 0.5rem 0;
      color: #9f7500;
    }
  }
  .disabled-price{
    text-align: center;
    height: 3rem;
    line-height: 3rem;
    border-radius: 3px;
    color: #fff;
    background-color: #d43f3a;
    font-size: 1.4rem;
  }
  .product-price{
    padding: 1rem 1rem;
    background-color: #f0f0f0;
    border-radius: 3px;
    margin-bottom: 1rem;
    .origin-price{
      .money-type{
        display: inline;
        margin-right: 0.5rem;
      }
      .money-number{
        display: inline;
        font-size: 1.3rem;
      }
    }
    .new-price{
      .money-type{
        color: orangered;
        display: inline;
        margin-right: 0.5rem;
      }
      .money-number{
        display: inline;
        font-size: 2.6rem;
        font-weight: 700;
        color: orangered;
      }
    }
  }
  .user-count-limit{
    color: orangered;
  }
  .product-address{
    .address-text{
      min-height: 2.7rem;
      line-height: 2.7rem;
    }
    .address-input{
      display: inline-block;
      cursor: pointer;
      input{}
    }
  }
  .product-option{
    @optionNameWidth: 4rem;
    padding-left: @optionNameWidth;
    position: relative;
    .product-option-name{
      position: absolute;
      left: 0;
      top: 0;
      width: @optionNameWidth;
    }
  }
  .product-shippingCost{
    margin-bottom: 1.2rem!important;
    .product-shippingCost-select{
      border: none;
      cursor: pointer;
    }
  }
  .product-option-content{
    min-height: 1.6rem;
  }
  .product-group{
    margin-bottom: 0.5rem;
  }
  .product-count{
    margin-bottom: 1.6rem;
    .count-icon{
      height: 2.2rem;
      width: 2.2rem;
      line-height: 2.5rem;
      text-align: center;
      background-color: #f0f0f0;
      display: inline-block;
      vertical-align: top;
      cursor: pointer;
      color: #555;
      border-radius: 3px;
      user-select: none;
      &:hover{
        background-color: #e0e0e0;
      }
    }
    .count-input{
      border: none;
      width: 2.6rem;
      margin: 0 0.3rem;
      height: 2.2rem;
      text-align: center;
      font-weight: 700;
    }
  }
  .product-specification{
    .product-specification-item{
      display: inline-block;
      margin: 0 1rem 0.5rem 0;
      height: 2rem;
      line-height: 2rem;
      padding: 0 1rem;
      border-radius: 3px;
      user-select: none;
      cursor: pointer;
      font-size: 1rem;
      border: 1px solid #d5d5d5;
      &.active, &:hover{
        border-color: orangered;
      }
    }
  }
}
.product-notice{
  border: 2px solid #bbe0e1;
  padding: 1rem;
  border-radius: 3px;
  .product-notice-title{
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    vertical-align: text-bottom;
    .product-notice-title-icon{
      font-size: 2rem;
      vertical-align: middle;
      margin-right: 0.5rem;
      color: #5bb4b7;
    }
  }
  .product-notice-content{
    font-size: 1.25rem;
  }
}
</style>
