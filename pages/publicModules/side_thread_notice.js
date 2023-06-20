import { sweetEditNotice } from '../lib/js/sweetAlert';

//编辑公告内容
async function editNotice(nid, noticeContent) {
  await sweetEditNotice('编辑公告', nid, noticeContent);
}

export { editNotice };
