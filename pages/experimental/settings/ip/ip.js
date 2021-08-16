const commonModal = new NKC.modules.CommonModal();

function addIP() {
  commonModal.open(data => {
    let ips = data[0].value.split('\n');
    ips = ips.map(i => i.trim());
    ips = ips.filter(i => !!i);
    const description = data[1].value.trim();
    return Promise.resolve()
      .then(() => {
        if(!ips.length) throw new Error('IP 地址不能为空');
        return nkcAPI('/e/settings/ip', 'POST', {
          ips,
          description
        });
      })
      .then(() => {
        commonModal.close();
        sweetSuccess('提交成功');
      })
      .catch(sweetError);
  }, {
    title: '添加 IP 到黑名单',
    data: [
      {
        dom: 'textarea',
        label: 'IP 地址，多个以换行符分隔',
        value: '',
        rows: 3
      },
      {
        dom: 'textarea',
        label: '说明',
        value: '',
        rows: 3
      }
    ]
  })
}

function removeIP(ip) {
  return sweetQuestion(`确定要执行当前操作？`)
    .then(() => {
      return nkcAPI(`/e/settings/ip?ip=${ip}`, 'DELETE')
    })
    .then(() => {
      sweetSuccess('执行成功');
    })
    .catch(sweetError);
}

function viewIP(ip) {
  NKC.methods.getIpInfo(ip);
}

Object.assign(window, {
  addIP,
  viewIP,
  removeIP
});
