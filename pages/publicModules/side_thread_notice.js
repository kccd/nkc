import { sweetEditNotice } from '../lib/js/sweetAlert';

//编辑文章通告内容
async function editNotice(target, nid) {
  const threadNotice = target.closest('.thread-notice');
  const spanElement = threadNotice.querySelector('.thread-notice-content span');
  const newNoticeContent = await sweetEditNotice(
    '编辑公告',
    nid,
    spanElement.textContent,
  );
  if (newNoticeContent) {
    spanElement.textContent = newNoticeContent;
  }
}

export { editNotice };
