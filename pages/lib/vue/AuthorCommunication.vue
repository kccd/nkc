<template lang="pug">
  .modal.fade#moduleAuthor(tabindex="-1" role="dialog" aria-labelledby="myModalLabel")
      .modal-dialog.modal-sm(role="document")
        .modal-content
          .modal-header
            button.close(data-dismiss="modal" aria-label="Close")
              span(aria-hidden="true") &times;
            h4.modal-title 通信作者
          .modal-body
            .form
              .form-group(v-if="contract.contractEmail")
                h5 通信邮箱：
                strong {{contract.contractEmail}}
              .form-group(v-if="contract.contractTel")
                h5 电话号码：
                strong {{contract.contractTel}}
              .form-group(v-if="contract.contractAdd")
                h5 通信地址：
                strong {{contract.contractAdd}}
              .form-group(v-if="contract.contractCode")
                h5 邮政编码：
                strong {{contract.contractCode}}
</template>
<script>
export default {
  props:['contract'],
  // data: () => {
  //   return {
  //     show: false,
  //   }
  // },
  methods:{
    // communicationShow(){
    //   this.show = !this.show
    // }
  }
}
</script>
