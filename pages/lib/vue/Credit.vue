<template lang="pug">
    //- .credit-panel( class="ib" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" :data-credit-score-name="res.creditScore.name").bootstrap-modal
      //- div(class="modal-dialog modal-sm" role="document")
    .modal-content(class="modal-sm ib" ref="content")
      .credit-modal-header(ref="header")
        .close-icon(type="button" @click="close")
          span.fa.fa-remove
        .modal-title {{ {xsf: '评学术分',kcb: '鼓励'}[type] }}
      .modal-body
        .form
          .form-group(v-if="type === 'kcb'")
            span.kcb-info.currency 向作者转账
            span.kcb-info.currency.outstanding {{ res.creditScore.name }}
            span.kcb-info.currency 以资鼓励
          .form-group
            label 分值
            span.kcb-info.kcb-range(v-if="type === 'kcb'" style='display:inline-block;') {{"(" + res.creditSettings.min/100 + res.creditScore.unit + "-" + res.creditSettings.max/100 + res.creditScore.unit + ")"}}
            span.xsf-info.xsf-range(v-else style='display:inline-block;') {{"(" + -res.xsfSettings.reduceLimit + "到" + res.xsfSettings.addLimit + ")"}}
            input.form-control.num(value='1' type='number' v-model="num")
          .form-group
            label 原因
            span.kcb-info(v-if="type === 'kcb'" style='display:inline-block;') （不超过60个字）
            span.xsf-info(v-else style='display:inline-block;') （不超过500个字）
            textarea.form-control.description(rows=3 v-model="description")
      .modal-footer
        button(type="button" class="btn btn-default" data-dismiss="modal" @click="close") 关闭
        button(type="button" class="btn btn-primary" @click="submit" :disable="disable") {{ disable ? "提交中..." : "确认"}}
</template>

<script>
import { sweetError } from '../js/sweetAlert';
import { DraggableElement } from "../js/draggable";

export default {
  name: "creditComponent",
  props: {
    type: {
      //type = kcb || xsf
      type: String,
      default: "kcb"
    },
    // 接收学术分或者kcb依据
    id: {
      type: String,
      required: true
    },
    kcb: {
      type: Number,
    },
    // 文章类型。独立(zone)、专栏(column)、社区(thread)等
    articleType: {
      type: String,
      // 
      default: "thread"
    }
  },
  data: () => ({
    res: {
      creditSettings: {},
      xsfSettings: {},
      creditScore: {}
    },
    dialog: '',
    disable: false,
    description: '',
    num: '',
  }),
  mounted() {
    this.dialog = new DraggableElement(
      this.$refs.content,
      this.$refs.header
    );
	  this.dialog.setPositionCenter();
  },
  destroyed(){
    this.dialog.destroy();
  },
  methods: {
    open(){
      // nkcAPI(`/t/${location.pathname.split("/")[2]}/rewards` ,"GET")
      nkcAPI(`/credit?articleType=${this.articleType}` ,"GET")
        .then((res) => {
          this.res = res
        })
        .catch((err) => {
          sweetError(err)
        })
    },
    close(){
      // 通知父组件关闭对话框
      this.$emit("close");
      this.num = '';
      this.description = '';

    },
    submit(){
      this.disable = true;
      const obj = {
        num: this.num,
        description: this.description
      };
      if (this.type === "kcb"){
        obj.num *= 100;
        if(this.num*100 > this.kcb) return screenTopWarning('你的' + this.res.creditScore.name + '不足');
      }
      // let url = '/p/'+this.pid+'/credit/' + this.type;
      let url = `/credit/${this.type}?articleType=${this.articleType}&id=${this.id}`
      nkcAPI(url, 'POST', obj)
        .then( () => {
          window.location.reload();
        })
        .catch( data => {
          screenTopWarning(data.error || data);
          this.disable = false;
      });
    }
  }
}
</script>
<style scoped>
@media (min-width: 768px) {
  .modal-sm {
      width: 300px;
  }
  .modal-content {
    -webkit-box-shadow: 0 5px 15px rgb(0 0 0 / 50%);
    box-shadow: 0 5px 15px rgb(0 0 0 / 50%);
  }
}
.outstanding {
  color: #1269ff
}
.modal-content {
    position: fixed;
    background-color: #fff;
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    border: 1px solid #999;
    border-radius: 6px;
    outline: 0;
    -webkit-box-shadow: 0 3px 9px rgb(0 0 0 / 50%);
    box-shadow: 0 3px 9px rgb(0 0 0 / 50%);
}
/* .modal-header{
  cursor: pointer;
  padding: 15px;
  border-bottom: 1px solid #e5e5e5;
} */
.modal-body {
    position: relative;
    padding: 15px;
}
.modal-footer {
    padding: 15px;
    text-align: right;
    border-top: 1px solid #e5e5e5;
}
.ib{
  display: inline-block;
}
.close-icon{
  cursor: pointer;
  color: #aaa;
  width: 3rem;
  position: absolute;
  top: 0;
  right: 0;
  height: 3rem;
  line-height: 3rem;
  text-align: center;
}
.close-icon:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: #777;
}
.modal-title {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    cursor: move;
    font-weight: 700;
    padding-left: 1rem;
}
.form-group {
    margin-bottom: 15px;
}
label {
    display: inline-block;
    max-width: 100%;
    margin-bottom: 5px;
    font-weight: bold;
}
.form-control {
    display: block;
    width: 100%;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
    box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
    -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
    -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
}
textarea.form-control {
    height: auto;
}
.btn-default {
    color: #333;
    background-color: #fff;
    border-color: #ccc;
}
.modal-footer .btn + .btn {
    margin-bottom: 0;
    margin-left: 5px;
}
.credit-panel{
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  height: 31rem;
}
</style>
