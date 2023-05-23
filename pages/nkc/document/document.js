window.deleteArticle = function (_id) {
  if (!window.DisabledPost) {
    window.DisabledPost = new NKC.modules.DisabledPost();
  }
  window.DisabledPost.open(function (data) {
    var body = {
      delType: data.type === 'toDraft' ? 'faulty' : 'disabled',
      docId: _id,
      type: 'document',
      reason: data.reason,
      remindUser: data.remindUser,
      violation: data.violation,
    };
    DisabledPost.lock();
    nkcAPI('/review', 'PUT', body)
      .then(function () {
        screenTopAlert('操作成功');
        DisabledPost.close();
        DisabledPost.unlock();
      })
      .catch(function (data) {
        sweetError(data);
        DisabledPost.unlock();
      });
  });
};

window.deleteMoment = function (momentId) {
  if (!momentId) {
    return;
  }
  sweetQuestion('你确定要删除吗？')
    .then(() => nkcAPI(`/moment/${momentId}`, 'DELETE'))
    .then(() => {
      sweetSuccess('操作成功');
    })
    .catch((err) => {
      sweetError(err);
    });
};

window.recoveryMoment = function (momentId) {
  if (!momentId) {
    return;
  }
  return nkcAPI(`/moment/${momentId}/recovery`, 'POST')
    .then(() => {
      sweetSuccess('操作成功');
    })
    .catch(sweetError);
};

window.selectAllContent = function (dom) {
  document.getElementsByClassName('classification').forEach((checkbox) => {
    checkbox.checked = dom.checked;
  });
};

window.handleSearch = function () {
  let selectedValues = [];
  let selectedStatus = [];
  const t = { source: [], status: [] };
  document.getElementsByClassName('classification').forEach((checkbox) => {
    if (checkbox.checked) {
      selectedValues.push(checkbox.value);
    }
  });
  document.getElementsByClassName('status').forEach((checkbox) => {
    if (checkbox.checked) {
      selectedStatus.push(checkbox.value);
    }
  });
  if (selectedValues.length === 0) {
    sweetError('请勾选所查询内容');
  } else if (selectedStatus.length === 0) {
    sweetError('请勾选所查询内容的状态');
  } else {
    t.source = selectedValues;
    t.status = selectedStatus;
    const jsonString = encodeURIComponent(JSON.stringify(t));
    window.location.href = `/nkc/document?a=${jsonString}`;
  }
};

window.uncheck = function () {
  let selectedValues = [];
  const allContentDom = document.getElementById('all');
  const allValues = document.getElementsByClassName('classification');
  allValues.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedValues.push(checkbox.value);
    }
  });
  if (
    allContentDom.checked !== true &&
    selectedValues.length === allValues.length - 1
  ) {
    allContentDom.checked = true;
  } else if (
    allContentDom.checked === true &&
    selectedValues.length !== allValues.length
  ) {
    allContentDom.checked = false;
  }
};
