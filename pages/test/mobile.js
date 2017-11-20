db = require('arangojs')('http://192.168.11.7');
db.useDatabase('rescue');
db.query(`
  for m in mobilecodes
    filter m.uid
    let u = document(users, m.uid)
    return u
`)
/*db.query(`
  for m in mobilecodes
  filter !m.uid
  return m
`)*/
.then(res => res.all())
.then(res => {
  let n = 0;
  for (let i = 0; i < res.length; i++) {
    //console.log(res[i])
    if(!res[i].certs ||res[i].certs.indexOf('mobile') === -1) {
      n++;
      console.log(res[i]._key);
      //console.log(n);
    }
  }
});
/*
db.query(`
  for u in users_personal
  filter u.email
  return document(users, u._key)
`)
.then(res => res.all())
.then(res => {
  let n = 0;
  for (let i = 0; i < res.length; i++) {
    if(!res[i].certs || res[i].certs.indexOf('mail') === -1) {
      console.log(res[i]);
      n++;
    }
  }
  console.log(n);
});*/
