import {sweetAlert, sweetError} from "./sweetAlert";

export function getIpInfo(ip) {
  return nkcAPI(`/ipinfo?ip=${ip}`, 'GET')
    .then(res => res.ipInfo)
}

export function showIpInfo(ip) {
  getIpInfo(ip)
    .then(ipInfo => {
      sweetAlert(`${ipInfo.ip} ${ipInfo.location}`)
    })
    .catch(sweetError)
}
