import {sweetAlert, sweetWarning,sweetError} from "../../../lib/js/sweetAlert";
import {getDataById} from "../../../lib/js/dataConversion";
import {nkcAPI} from "../../../lib/js/netAPI";

let data = getDataById("data");  //读取所获取到的敏感词组
const app = new Vue({
  el:'#app',
  data:{
     msg: '测试数据',
     enabled: data.enabled , //是否开启敏感词检测
     keyWordGroup: data.keyWordGroup,//敏感词组
     keyWordGroupChecked: data.keyWordGroupChecked ,//被勾选上的敏感词组
     checkAllBoolean: false//全选的状态
  },
  computed: {
    allGroupsId() {
      return this.keyWordGroup.map(k => k.id)
    },
    selectedAll() {
      return this.keyWordGroupChecked.length === this.allGroupsId.length; //判断是否全选
    }
  },
  methods:{
    //开启敏感词组检测
    keyWordSwitch:function (){
      this.enabled=!this.enabled
      // sweetAlert(this.enabled?'已启用':'已关闭')
      },
    //全选
    checkAll:function (){
      if(this.selectedAll) {
        this.keyWordGroupChecked = [];
      } else {
        this.keyWordGroupChecked = [...this.allGroupsId];
      }
    },
    //提交
    submitKeyWordGroup:function (){
      if(this.keyWordGroupChecked.length === 0 && this.enabled ===true){
        sweetWarning('请添加你所需要的敏感词组')
      }
      else {
        const {keyWordGroupChecked,enabled,keyWordGroup} = this
        nkcAPI('/e/settings/note','PUT',{keyWordGroupChecked,enabled,keyWordGroup})
           .then(() => {
             sweetSuccess('提交成功');
           })
          .catch(sweetError)
      }
    },
  },
  
})
