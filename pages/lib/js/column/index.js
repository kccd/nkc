import {nkcAPI} from "../netAPI";
//获取当前用户的专栏信息
export function getColumnInfo() {
  return nkcAPI('/column/getColumn', 'GET')
    .then((res) => {
      return res.column;
    })
    .catch((err) => {
      sweetError(err);
    });
};
