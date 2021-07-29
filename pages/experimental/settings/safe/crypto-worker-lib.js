import md5 from "md5";

self.md5 = md5;

self.$cryptoPassword = function(password, salt) {
  return md5(md5(password) + salt);
}