<template lang="pug">
  .author-info
    .editor-header 作者信息
      small （选填，信息将公开显示）
    .editor-authors
      .table-responsive(v-if="authorInfos.length")
        table.table-condensed.table
          thead
            tr
              th
              th 姓名
              th {{websiteUserId + "(选填)"}}
              th 机构名称(选填)
              th 机构地址(选填)
              th 通信作者
          tbody.editor-author(v-for="(a, index) in authorInfos")
            tr
              th
                .fa.fa-trash(@click="removeAuthor(index, authorInfos)" title="删除")
                .fa.fa-chevron-up(@click="moveAuthor(index, 'up', authorInfos)" title="上移")
                .fa.fa-chevron-down(@click="moveAuthor(index, 'down', authorInfos)" title="下移")
              th
                input.author-name(type="text" v-model.trim="a.name")
              th
                input.author-id(type="text" v-model.trim="a.kcid")
              th
                input(type="text" v-model.tirm="a.agency")
              th
                input(type="text" v-model.trim="a.agencyAdd")
              th
                .checkbox
                  label
                    input(type="checkbox" :value="true" v-model="a.isContract")
            tr(v-if="a.isContract").contract-info
              th(colspan="6")
                h5 以下信息仅登录用户可见
                .display-i-b.m-b-05
                  span 邮箱
                  input(type="text" v-model.trim="a.contractObj.contractEmail" placeholder="必填")
                .display-i-b.m-b-05
                  span &nbsp;电话
                  input(type="text" v-model.trim="a.contractObj.contractTel" placeholder="选填")
                .display-i-b.m-b-05
                  span &nbsp;地址
                  input(type="text" v-model.trim="a.contractObj.contractAdd" placeholder="选填")
                .display-i-b.m-b-05
                  span &nbsp;邮政编码
                  input.author-name(type="text" v-model.trim="a.contractObj.contractCode" placeholder="选填")
      button.btn.btn-default.btn-sm(@click="addAuthor") 添加
</template>

<script>

export default {
  data: () => ({
    websiteUserId: data.websiteCode + "ID",
    authorInfos: []
  }),
  props: {
    author: {
      type: Array,
      default: ()=>([])
    }
  },
  created() {
    if(typeof this["author"] === "undefined"){
      console.warn("p-authorInfos is not defined");
      this.authorInfos = [];
      return
    }
    this.authorInfos = this["author"];
  },
  mounted(){

  },
  methods: {
    getData(){
      return {authorInfos: this.authorInfos}
    },
    removeAuthor(index, arr) {
      sweetQuestion("确定要删除该条作者信息？")
        .then(function() {
          arr.splice(index, 1);
        })
        .catch(function() {});
    },
    moveAuthor(index, type) {
      let authorInfos = this.authorInfos;
      let otherIndex;
      if (type === "up") {
        if (index === 0) return;
        otherIndex = index - 1;
      } else {
        if (index + 1 === authorInfos.length) return;
        otherIndex = index + 1;
      }
      let info = authorInfos[index];
      authorInfos[index] = authorInfos[otherIndex];
      authorInfos[otherIndex] = info;
      Vue.set(authorInfos, 0, authorInfos[0]);
    },
    addAuthor() {
      let authorInfos = this.authorInfos;
      authorInfos.push({
        name: "",
        kcid: "",
        agency: "",
        agencyCountry: "",
        agencyAdd: "",
        isContract: false,
        contractObj: {
          contractEmail: "",
          contractTel: "",
          contractAdd: "",
          contractCode: ""
        }
      });
    }
  }
};
</script>

<style scoped>

.editor-author input:focus{
  outline: none;
}
.editor-author input{
  height: 2.5rem;
  padding: 0.5rem;
  border: 1px solid #d8d8d8;
  border-radius: 3px;
}
.editor-author .author-name{
  width: 6rem;
}
.editor-author .author-id{
  width: 6rem;
}
.editor-author .fa:hover{
  color: #8c8c8c;
}
.editor-author .fa{
  font-size: 1.3rem;
  height: 2rem;
  width: 2rem;
  line-height: 2rem;
  cursor: pointer;
  color: #adadad;
  text-align: center;
}
.editor-authors thead{
  color: #88919d;
}
.editor-header{
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small{
  color: #88919d;
}
</style>
