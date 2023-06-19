import { sweetEditNotice } from '../lib/js/sweetAlert';

async function editNotice(nid, noticeContent) {
  const newNoticeContent = await sweetEditNotice('编辑公告', noticeContent);
  console.log(newNoticeContent, 'newNoticeContent');
}

export { editNotice };
