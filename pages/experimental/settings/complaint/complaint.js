const commonModal = new NKC.modules.CommonModal();
var data = NKC.methods.getDataById("data");

function addType() {
  commonModal.open(data => {
    let type = data[0].value;
    let description = data[1].value.trim();
    return Promise.resolve()
      .then(() => {
        if(!type.length) throw new Error('投诉类型不能为空');
        return nkcAPI('/e/settings/complaint/type', 'POST', {
          type,
          description
        });
      })
      .then(() => {
        commonModal.close();
        sweetSuccess('添加成功');
      })
      .catch(sweetError);
  }, {
    title: '添加投诉类型',
    data: [
      {
        dom: 'input',
        label: '请填写投诉类型',
        value: '',
        rows: 1
      },
      {
        dom: 'textarea',
        label: '请填写类型说明',
        value: '',
        rows: 3
      }
    ]
  })
}
// function removeType(id) {
//   return sweetQuestion(`确定要执行当前操作？`)
//     .then(() => {
//       return nkcAPI(`/e/settings/complaintType?id=${id}`, 'DELETE')
//     })
//     .then(() => {
//       sweetSuccess('删除成功');
//     })
//     .catch(sweetError);
// }



Object.assign(window, {
  addType,
});

var app = new Vue({
  el: '#app',
  data: {
    type: data.complaintTypes || [],
    complaintSettings: data.complaintSettings,
  },
  mounted () {
    floatUserPanel.initPanel();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    timeFormat(time) {
      var fixTime = function(number) {
        return number < 10? '0' + number: number;
      }
      time = new Date(time);
      var year = time.getFullYear();
      var month = fixTime(time.getMonth() + 1);
      var day = fixTime(time.getDate());
      var hour = fixTime(time.getHours());
      var minute = fixTime(time.getMinutes());
      var second = fixTime(time.getSeconds());
      return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    },
    viewDes(val){
      if(val){
      return asyncSweetCustom("<p style='font-weight: normal;'>类型说明: <span style='color:#337ab7'>"+ val +"</span></p>")
    }else {
      return asyncSweetCustom("<p style='font-weight: normal;'>未添加类型说明</p>")
    }
    },
    initiate(_id, disabled){
      sweetQuestion(`确定要执行当前操作？`)
      .then(() => {
        nkcAPI('/e/settings/complaint/type', 'PUT', {
          operation: "modifyDisabled",
          _id,
          disabled: !!disabled
        }).then(()=>{
          sweetSuccess('启用成功');
        }).catch((err)=>{
          sweetError('启用失败');
        });
      })
      .catch(sweetError);
    },
    forbidden(_id, disabled){
      sweetQuestion(`确定要执行当前操作？`)
      .then(() => {
        nkcAPI('/e/settings/complaint/type', 'PUT', {
          operation: "modifyDisabled",
          _id,
          disabled: !!disabled
        }).then(()=>{
          sweetSuccess('禁用成功');
        }).catch((err)=>{
          sweetError('禁用失败');
        });
      })
      .catch(sweetError);
    },
    edit(val){
      var oldType=val.type;
      var oldDes=val.description;
      commonModal.open(data => {
        let type = data[0].value;
        let description = data[1].value.trim();
        return Promise.resolve()
          .then(() => {
            if(!type.length) throw new Error('投诉类型不能为空');
            return nkcAPI('/e/settings/complaint/type', 'PUT', {
              operation: "modifyEdit",
              _id:val._id,
              type,
              description
            });
          })
          .then(() => {
            commonModal.close();
            sweetSuccess('修改成功');
          })
          .catch(sweetError);
      }, {
        title: '修改投诉类型',
        data: [
          {
            dom: 'input',
            label: '请填写投诉类型',
            value: oldType,
            rows: 1
          },
          {
            dom: 'textarea',
            label: '请填写类型说明',
            value: oldDes,
            rows: 3
          }
        ]
      })
    },

    submit() {
      const {complaintSettings, type} = this;
      let complaintTypesId = new Array(type.length);
      for(const t of type) {
        complaintTypesId.splice(t.order, 0, t._id);
      }
      complaintTypesId = complaintTypesId.filter(c => !!c);
      nkcAPI(`/e/settings/complaint`, 'PUT', {
        complaintSettings,
        complaintTypesId
      })
        .then(() => {
          sweetSuccess(`保存成功`);
        })
        .catch(sweetError);
    }
  }
});

