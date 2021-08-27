const commonModal = new NKC.modules.CommonModal();

window.addFund = () => {
  commonModal.open(data => {
    const fundId = data[0].value;
    const fundName = data[1].value;
    return Promise.resolve()
      .then(() => {
        if(!fundId) throw new Error(`基金代号不能为空`);
        if(!fundName) throw new Error(`基金名称不能为空`);
        return nkcAPI(`/fund/list`, 'POST', {
          fundId, fundName
        });
      })
      .then((data) => {
        sweetSuccess(`创建成功，正在前往基金设置`);
        NKC.methods.visitUrl(`/fund/list/${data.fundId}/settings`);
      })
      .catch(sweetError);
  }, {
    title: '添加基金',
    data: [
      {
        dom: 'input',
        label: '基金代号',
        value: ''
      },
      {
        dom: 'input',
        label: '基金名称',
        value: ''
      }
    ]
  })
}