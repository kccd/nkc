import { sweetEditNotice } from '../lib/js/sweetAlert';

//编辑文章通告内容
async function editNotice(e, nid, noticeContent) {
  const newNoticeContent = await sweetEditNotice(
    '编辑公告',
    nid,
    noticeContent,
  );
  if (newNoticeContent) {
    const threadNotice = e.closest('.thread-notice');
    const spanElement = threadNotice.querySelector(
      '.thread-notice-content span',
    );
    spanElement.textContent = newNoticeContent;
  }
}

export { editNotice };
