//编辑文章通告内容
import { sweetConfirm, sweetError, sweetSuccess } from '../lib/js/sweetAlert';
import { nkcAPI } from '../lib/js/netAPI';

//编辑通告内容
async function editNotice(target) {
  const threadNotice = target.closest('.thread-notice');
  const oldNid = threadNotice.getAttribute('data-nid');
  const pid = threadNotice.getAttribute('data-pid');
  const spanElement = threadNotice.querySelector('.thread-notice-content');
  const { noticeContent, nid } = await sweetEditNotice({
    title: '编辑公告',
    content: spanElement.innerText,
    nid: oldNid,
    pid,
  });
  if (noticeContent) {
    threadNotice.dataset.nid = nid;
    spanElement.innerText = noticeContent;
  }
}
//屏蔽通告内容
async function shieldNotice(target, isShield) {
  const threadNotice = target.closest('.thread-notice');
  const nid = threadNotice.getAttribute('data-nid');
  const pid = threadNotice.getAttribute('data-pid');
  const url = `/p/${pid}/notice/${nid}/disabled`;
  const method = 'PUT';
  return new Promise((resolve) => {
    if (isShield) {
      Swal.fire({
        title: '屏蔽公告',
        input: 'textarea',
        inputAttributes: {
          autocapitalize: 'off',
          maxlength: 200,
        },
        inputValue: '',
        allowOutsideClick: () => !Swal.isLoading(),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showLoaderOnConfirm: true,
        preConfirm: (reason) => {
          return nkcAPI(url, method, {
            isShield,
            reason,
          })
            .then(() => {
              resolve(reason);
            })
            .catch(({ error }) => {
              Swal.showValidationMessage(error);
            });
        },
      }).then((result) => {
        if (result.value) {
          sweetSuccess('屏蔽成功');
        }
      });
    } else {
      sweetConfirm('是否解除屏蔽').then(() => {
        nkcAPI(url, method, { isShield })
          .then(() => {
            sweetSuccess('解除屏蔽成功');
          })
          .catch((err) => {
            sweetError(err);
          });
      });
    }
  });
}

//为了考虑到文章通告的内容编辑，定制的一个弹窗，不可复用
function sweetEditNotice(props) {
  const { title, content = '', nid, pid } = props;
  return new Promise((resolve) => {
    Swal.fire({
      title,
      input: 'textarea',
      inputAttributes: {
        autocapitalize: 'off',
        maxlength: 200,
      },
      inputValue: content,
      allowOutsideClick: () => !Swal.isLoading(),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: (text) => {
        return nkcAPI(`/p/${pid}/notice/${nid}/content`, 'PUT', {
          noticeContent: text,
          type: 'thread',
        })
          .then((res) => {
            resolve(res.newNotice);
          })
          .catch(({ error }) => {
            Swal.showValidationMessage(error);
          });
      },
    }).then((result) => {
      if (result.value) {
        sweetSuccess('提交成功');
      }
    });
  });
}
export { editNotice, shieldNotice };
