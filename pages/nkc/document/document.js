import { initNKCSource } from '../../lib/js/nkcSource';

$(function () {
  initNKCSource();
});

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
// 添加独立文章恢复入口：deleted\disabled====》normal
window.recoveryArticle = function (id) {
  return nkcAPI(`/article/${id}/recovery`, 'POST')
    .then(() => {
      sweetSuccess('操作成功');
    })
    .catch(sweetError);
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

//全选内容分类
window.selectAllContent = function (dom) {
  document.getElementsByClassName('classification').forEach((checkbox) => {
    checkbox.checked = dom.checked;
  });
};
//全选文章状态
window.selectAllStatus = function (dom) {
  document.getElementsByClassName('contentStatus').forEach((checkbox) => {
    checkbox.checked = dom.checked;
  });
};

//点击查询
window.handleSearch = function () {
  const selectedValues = Array.from(
    document.getElementsByClassName('classification'),
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const selectedStatus = Array.from(
    document.getElementsByClassName('contentStatus'),
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const allType = document.getElementById('includeAllType').checked;

  const tUid = document.getElementsByClassName('tUid')[0].value.trim();
  const documentStatus = {
    normal: 'normal',
    deleted: 'deleted',
    faulty: 'faulty',
    disabled: 'disabled',
  };

  const documentSource = {
    article: 'article',
    comment: 'comment',
    moment: 'moment',
  };

  if (selectedValues.length === 0) {
    sweetError('请勾选所查询内容');
  } else if (selectedStatus.length === 0) {
    sweetError('请勾选所查询内容的状态');
  } else {
    const t = {
      source: [],
      status: [],
      tUid,
      allType,
    };

    if (
      //全选了内容，但是内容状态没全选
      selectedValues.length ===
        document.getElementsByClassName('classification').length &&
      selectedStatus.length !==
        document.getElementsByClassName('contentStatus').length
    ) {
      t.source = [
        documentSource.article,
        documentSource.comment,
        documentSource.moment,
      ];
      t.status = selectedStatus;
    } else if (
      //全选了内容状态，但是内容没全选
      selectedValues.length !==
        document.getElementsByClassName('classification').length &&
      selectedStatus.length ===
        document.getElementsByClassName('contentStatus').length
    ) {
      t.source = selectedValues;
      t.status = [
        documentStatus.normal,
        documentStatus.deleted,
        documentStatus.faulty,
        documentStatus.disabled,
      ];
    } else if (
      //全选了内容已经内容状态
      selectedValues.length ===
        document.getElementsByClassName('classification').length &&
      selectedStatus.length ===
        document.getElementsByClassName('contentStatus').length
    ) {
      t.source = [
        documentSource.article,
        documentSource.comment,
        documentSource.moment,
      ];
      t.status = [
        documentStatus.normal,
        documentStatus.deleted,
        documentStatus.faulty,
        documentStatus.disabled,
      ];
    } else {
      //两者都没全选
      t.source = selectedValues;
      t.status = selectedStatus;
    }

    const jsonString = JSON.stringify(t);
    const encodedString = encodeURIComponent(jsonString);
    const base64String = btoa(encodedString);
    window.location.href = `/nkc/document?t=${base64String}`;
  }
};

function updateCheckboxState(allContentDom, allValues, selectedValues) {
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
}
//取消勾选内容分类
window.uncheck = function () {
  const allContentDom = document.getElementById('all');
  const allValues = document.getElementsByClassName('classification');
  const selectedValues = Array.from(allValues)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  updateCheckboxState(allContentDom, allValues, selectedValues);
};
//取消勾选内容状态分类
window.uncheckStatus = function () {
  const allContentDom = document.getElementById('allStatus');
  const allValues = document.getElementsByClassName('contentStatus');
  const selectedStatus = Array.from(allValues)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  updateCheckboxState(allContentDom, allValues, selectedStatus);
};

window.toggleIncludeAllType = function () {
  const includeAllTypeDom = document.getElementById('includeAllType');
  if (!includeAllTypeDom) {
    return;
  }
  includeAllTypeDom.setAttribute('checked', !includeAllTypeDom.checked);
};
