<template lang="pug">
.abstract
  .editor-header 摘要
    small （选填）
  .row.editor-abstract
    .col-xs-12.col-md-6
      textarea.abstract-cn(
        placeholder="中文摘要，最多可输入1000字符",
        rows=7,
        v-model="cn"
        @input="handleChange($event,'cn')"
      )
      .editor-abstract-info(:class="{ warning: abstractCnLength > 1000 }") 
        span(class="warning" style="float:left;" v-if="abstractCnLength > 1000 || cnOverLength") 中文摘要不能超过1000字符
        span {{ abstractCnLength }} / 1000
    .col-xs-12.col-md-6
      textarea.abstract-en(
        placeholder="英文摘要，最多可输入1000字符",
        rows=7,
        v-model="en"
        @input="handleChange($event,'en')"
      )
      .editor-abstract-info(:class="{ warning: abstractEnLength > 1000 }") 
        span(class="warning" style="float:left;" v-if="abstractEnLength > 1000 || enOverLength") 英文摘要不能超过1000字符
        span {{ abstractEnLength }} / 1000
</template>

<script>
import { debounce, immediateDebounce } from '../../lib/js/execution';

export default {
  data: () => ({
    cn: "", // 中文摘要
    en: "", // 英文摘要
    changeContentDebounce: '',
    cnOverLength: false,
    enOverLength: false,
    timer: null,
  }),
  props: {
    abstract: {
      require: true,
      type: Object,
      default: () => ({}),
    },
  },
  created() {
    this.changeContentDebounce = immediateDebounce(this.changeContent, 2000);
  },
  computed: {
    abstractCnLength() {
      // return this.getLength(this.cn);
      return NKC.methods.checkData.getLength(this.cn);
    },
    abstractEnLength() {
      return NKC.methods.checkData.getLength(this.en);
    },
  },
  watch: {
    // abstract: {
    //   immediate: true,
    //   handler(n) {
    //     // console.log(n.cn)
    //     // console.log(n.en)
    //     // if (this.cn === n.cn && this.en === n.en) return
    //     this.cn = n.cn || "";
    //     this.en = n.en || "";
    //   },
    // },
    abstract: {
      immediate: true,
      handler(newValue,oldValue) {
        if(newValue && newValue.cn !==undefined && newValue.en !==undefined){
          if(oldValue && oldValue.cn !==undefined && oldValue.en !==undefined){
            if(newValue.cn == oldValue.cn && newValue.en == oldValue.en) return;
          }
          this.cn = newValue.cn || "";
          this.en = newValue.en || "";
        }
        
      },
    },
    en() {
      this.changeContentDebounce()
    },
    cn() {
      this.changeContentDebounce()
    }
  },
  methods: {
    changeContent() {
      // 统一发送一个事件
      this.$emit('info-change');
    },
    getData() {
      return {
        abstractCn: this.cn,
        abstractEn: this.en,
      };
    },
    triggerTips(key) {
      const self = this;
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if(key==='cn'){
        this.cnOverLength = true;
        this.enOverLength = false;
      } 
      if(key==='en'){
        this.enOverLength = true;
        this.cnOverLength = false;
      } 
      this.timer = setTimeout(() => {
        if(key==='cn') self.cnOverLength = false;
        if(key==='en') self.enOverLength = false;
        self.timer = null;
      }, 2000);
    },
    handleChange(event,key) {
      // console.log(event.target.value);
      let stringValue = event.target.value;
      if (NKC.methods.checkData.getLength(stringValue) > 1000) {
        this.triggerTips(key);
        let truncatedString = '';
        let byteLength = 0;
        for (let i = 0; i < stringValue.length; i++) {
          const charCode = stringValue.charCodeAt(i);
          if (charCode <= 0x007f) {
            byteLength += 1;
          } else {
            byteLength += 2;
          }

          if (byteLength <= 1000) {
            truncatedString += stringValue.charAt(i);
          } else {
            break;
          }
        }
        stringValue = truncatedString;
      }
      if(key==='cn') this.cn = stringValue;
      if(key==='en') this.en = stringValue;
      // this.changeContentDebounce();
    }
  },
};
</script>

<style scoped>
.box-shadow-panel > div {
  box-shadow: none;
  padding: 0;
  background-color: #fff;
  border-radius: 3px;
}
@media (max-width: 992px) {
  .col-xs-12 {
    width: 100%;
    float: left;
    position: relative;
    min-height: 1px;
  }
  .clear-paddingL{
    padding-right: 0;
  };
  .clear-paddingR{
    padding-left: 0;
  };
}
@media (min-width: 992px) {
  .col-md-3 {
    width: 25%;
    float: left;
  }
  .col-md-9 {
    width: 75%;
    float: left;
  }
}

.row:before {
  display: table;
  content: " ";
}
.row::after {
  display: table;
  content: " ";
}
* {
  box-sizing: border-box;
}
*:before,
*:after {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
*::after {
  clear: both;
}
.m-b-2 {
  margin-bottom: 2rem;
}
.row {
  margin-right: -15px;
  margin-left: -15px;
}

.col-md-9 {
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
}
.editor-abstract textarea:focus {
  outline: none;
}
.editor-abstract textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 3px;
  resize: none;
  padding: 0.5rem;
}
.editor-abstract-info {
  text-align: right;
  font-size: 1.2rem;
  color: #9baec8;
}
.editor-header {
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small {
  color: #88919d;
}
.warning {
  color: #ff6262;
}

/* .clear-paddingL {
  padding-left: 0;
}
.clear-paddingR {
  padding-right: 0;
}
.clear-marginLR {
  margin-left: 0;
  margin-right: 0;
} */
</style>
