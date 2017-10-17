const render = require('./nkc_render');
const moment = require('moment');
const pug = require('pug');
const settings = require('../settings');
let filters = {
  markdown:render.commonmark_render,
  markdown_safe:render.commonmark_safe,
  bbcode:render.bbcode_render,
  thru: function(k){return k},
};
let getCertsInText = (user) => {
  let perm = require('./permissions.js');

  let certs =  perm.calculateThenConcatCerts(user);

  let s = '';
  for(i in certs){
    let cname = perm.getDisplayNameOfCert(certs[i]);
    s+=cname+' '
  }
  return s
};
let getUserDescription = (user) => {
  return `${user.username}\n`+
    `学术分 ${user.xsf||0}\n`+
    `科创币 ${user.kcb||0}\n`+
    `${getCertsInText(user)}`
};
let dateTimeString = (t) => {
  return moment(t).format('YYYY-MM-DD HH:mm')
};
let fromNow = (time) => {
  return moment(time).fromNow();
};
let pugRender = (template, data) => {
  let options = {
    markdown_safe: render.commonmark_safe,
    markdown: render.commonmark_render,
    getUserDescription: getUserDescription,
    dateTimeString: dateTimeString,
    fromNow: fromNow,
    server: settings.server

  };
  options.data = data;
  options.filters = filters;
  return pug.renderFile(template, options);
};
module.exports = pugRender;