!function(e,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i(require("fs"),require("path"),require("rimraf")):"function"==typeof define&&define.amd?define(["fs","path","rimraf"],i):(e||self).findRemove=i(e.fs,e.path,e.rimraf)}(this,function(e,i,t){function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var r,o,a=/*#__PURE__*/n(e),f=/*#__PURE__*/n(i);function d(e,i){if(!r)return!1;var t=a.default.statSync(e).mtime.getTime();return r>t+1e3*i}function l(e){return void 0===e&&(e={}),void 0!==e.totalRemoved?e.totalRemoved:-2}function u(e){return void 0===e&&(e={}),l(e)>=function(e){return void 0===e&&(e={}),void 0!==e.limit?e.limit:-1}(e)}function v(e){return void 0===e&&(e={}),void 0!==e.maxLevel?e.maxLevel:-1}function s(e){return void 0===e&&(e={}),e.age&&e.age.seconds?e.age.seconds:null}var c=function(e,i,n){void 0===i&&(i={});var m={};if(!u(i)&&a.default.existsSync(e)){var y=v(i),x=!1;void 0!==i.limit&&(i.totalRemoved=void 0!==i.totalRemoved?l(i):0),void 0===n?n=0:n++,n<1?(r=(new Date).getTime(),o=i.test):x=function(e,i,t){void 0===i&&(i={});var n=!1,r=i.dir;if(r){var o=s(i),a=f.default.basename(e);Array.isArray(r)?n=-1!==r.indexOf("*")||-1!==r.indexOf(a):(i.regex&&a.match(new RegExp(r))||a===r||"*"===r)&&(n=!0),n&&void 0!==i.limit&&(n=!u(i)),n&&void 0!==i.maxLevel&&t>0&&(n=t<=v(i)),o&&n&&(n=d(e,o))}return n}(e,i,n),(-1===y||n<y)&&a.default.readdirSync(e).forEach(function(t){var r,l,v=f.default.join(e,t),y=!1;try{l=a.default.statSync(v)}catch(e){y=!0}if(y);else if(null!=(r=l)&&r.isDirectory()){var x=c(v,i,n);m=Object.assign({},m,x),void 0!==i.totalRemoved&&(i.totalRemoved+=Object.keys(x).length)}else if(function(e,i){void 0===i&&(i={});var t=!1,n=i.extensions?i.extensions:null,r=i.files?i.files:null,o=i.prefix?i.prefix:null,a=i&&i.ignore?i.ignore:null,l=f.default.basename(e);if(r&&(t=Array.isArray(r)?-1!==r.indexOf("*.*")||-1!==r.indexOf(l):!!(i.regex&&l.match(new RegExp(r))||"*.*"===r)||l===r),!t&&n){var v=f.default.extname(e);t=Array.isArray(n)?-1!==n.indexOf(v):v===n}if(!t&&o&&(t=0===l.indexOf(o)),t&&void 0!==i.limit&&(t=!u(i)),t&&a&&(t=Array.isArray(a)?!(-1!==a.indexOf(l)):!(l===a)),t){var c=s(i);c&&(t=d(e,c))}return t}(v,i)){var g;if(o)g=!0;else try{a.default.unlinkSync(v),g=!0}catch(e){}g&&(m[v]=!0,void 0!==i.totalRemoved&&i.totalRemoved++)}}),x&&(o||t.rimrafSync(e),void 0===i.totalRemoved&&(m[e]=!0))}return m};return c});
//# sourceMappingURL=find-remove.umd.js.map
