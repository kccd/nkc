import { getFileMD5 } from './file';
import { nkcAPI, nkcUploadFile } from './netAPI';

export function UploadResource(props) {
  const { file, cid, defaultFileName = '', onProgress = () => {} } = props;
  return getFileMD5(file)
    .then((md5) => {
      return nkcAPI('/rs/md5', 'POST', {
        md5,
        filename: file.name,
      });
    })
    .then((data) => {
      if (!data.uploaded) {
        const formData = new FormData();
        formData.append('file', file, file.name || defaultFileName);
        if (cid) {
          formData.append('cid', cid);
        }
        return nkcUploadFile('/r', 'POST', formData, onProgress);
      }
    });
}
