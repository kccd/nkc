import { asyncSweetCustom } from './sweetAlert';
import { nkcAPI } from './netAPI';

export function getIpInfo(ip) {
  return nkcAPI(`/ipinfo?ip=${ip}`, 'GET').then((res) => res.ipInfo);
}

export function getAndShowIpDetail(ip) {
  return getIpInfo(ip).then((ipInfo) => {
    showIpDetail(ipInfo);
  });
}

export function getAndShowCommentIpDetail(commentId) {
  return nkcAPI(`/comment/${commentId}/ipInfo`, 'GET').then((res) => {
    showIpDetail(res.ipInfo);
  });
}

export function getAndShowMomentIpDetail(momentId) {
  return nkcAPI(`/moment/${momentId}/ipInfo`, 'GET').then((res) => {
    showIpDetail(res.ipInfo);
  });
}

export function showIpDetail(props) {
  const { ip, country, region, city, googleMapUrl, gaodeMapUrl, ip138Url } =
    props;
  const location =
    [country, region, city].filter(Boolean).join(' · ') || '未知';
  const links = [
    googleMapUrl
      ? `<a href="${googleMapUrl}" target="_blank" rel="noopener">Google 地图</a>`
      : '',
    gaodeMapUrl
      ? `<a href="${gaodeMapUrl}" target="_blank" rel="noopener">高德地图</a>`
      : '',
    ip138Url
      ? `<a href="${ip138Url}" target="_blank" rel="noopener">IP138</a>`
      : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const mapRow = links ? `<div><strong>其他：</strong>${links}</div>` : '';

  const html = `
    <div style="font-weight: normal; font-size: 14px; line-height: 1.8;">
      <div><strong>IP：</strong>${ip || '-'}</div>
      <div><strong>位置：</strong>${location}</div>
      ${mapRow}
    </div>
  `;
  return asyncSweetCustom(html);
}
