const commonModal = new NKC.modules.CommonModal();

function addType() {
  commonModal.open(data => {
    let type = data[0].value;
    let description = data[1].value.trim();
    return Promise.resolve()
      .then(() => {
        if(!type.length) throw new Error('投诉类型不能为空');
        if(!description.length) throw new Error('投诉类型不能为空');
        return nkcAPI('/e/settings/complaintType', 'POST', {
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
        label: '请填写投诉类型，不能为已存在的类型',
        value: '',
        rows: 1
      },
      {
        dom: 'textarea',
        label: '请填写类型说明，全英文小写',
        value: '',
        rows: 3
      }
    ]
  })
}
function removeType(id) {
  return sweetQuestion(`确定要执行当前操作？`)
    .then(() => {
      return nkcAPI(`/e/settings/complaintType?id=${id}`, 'DELETE')
    })
    .then(() => {
      sweetSuccess('删除成功');
    })
    .catch(sweetError);
}



Object.assign(window, {
  addType,
  removeType
});

var app = new Vue({
  el: '#app',
  data: {
    type:""
  },
  mounted () {
    this.getList();
  },
  methods: {
    getList: function() {
      nkcAPI('/e/settings/complaintType', 'get', {
      })
        .then(function(data) {
          this.type=data.complaintTypes
        })
        .catch(function(data) {
        })
    },
  }
});

