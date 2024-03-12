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
//根据专栏名获取专栏信息;
export function getColumnMessage(columnName) {
  return nkcAPI(`/column/getColumn?columnName=${columnName}`, 'GET')
    .then((res) => {
      return res.targetColumns;
    })
    .catch((err) => {
      sweetError(err);
    });
}
