import e from"fs";import r from"path";import{rimrafSync as i}from"rimraf";function t(){return t=Object.assign?Object.assign.bind():function(e){for(var r=1;r<arguments.length;r++){var i=arguments[r];for(var t in i)({}).hasOwnProperty.call(i,t)&&(e[t]=i[t])}return e},t.apply(null,arguments)}var n,o;function a(r,i){if(!n)return!1;var t=e.statSync(r).mtime.getTime();return n>t+1e3*i}function v(e){return void 0===e&&(e={}),void 0!==e.totalRemoved?e.totalRemoved:-2}function l(e){return void 0===e&&(e={}),v(e)>=function(e){return void 0===e&&(e={}),void 0!==e.limit?e.limit:-1}(e)}function f(e){return void 0===e&&(e={}),void 0!==e.maxLevel?e.maxLevel:-1}function d(e){var r;return void 0===e&&(e={}),e.age&&null!=(r=e.age.seconds)?r:null}var u=function(c,m,s){void 0===m&&(m={});var x={};if(l(m))return x;var y=!1,g=e.existsSync(c),p=function(r){try{return e.lstatSync(r),!0}catch(e){return!1}}(c);if(g&&!p)y=!0;else if(g){var O=f(m);void 0!==m.limit&&(m.totalRemoved=void 0!==m.totalRemoved?v(m):0),void 0===s?s=0:s++,s<1?(n=(new Date).getTime(),o=m.test):y=function(e,i,t){void 0===t&&(t={});var n=!1,o=t.dir;if(o){var v=d(t),u=r.basename(e);Array.isArray(o)?n=-1!==o.indexOf("*")||-1!==o.indexOf(u):(t.regex&&u.match(new RegExp(o))||u===o||"*"===o)&&(n=!0),n&&void 0!==t.limit&&(n=!l(t)),n&&void 0!==t.maxLevel&&i>0&&(n=i<=f(t)),v&&n&&(n=a(e,v))}return n}(c,s,m),(-1===O||s<O)&&e.readdirSync(c).forEach(function(i){var n,v,f=r.join(c,i),y=!1;try{v=e.statSync(f)}catch(e){y=!0}if(y);else if(null!=(n=v)&&n.isDirectory()){var g=u(f,m,s);x=t({},x,g),void 0!==m.totalRemoved&&(m.totalRemoved+=Object.keys(g).length)}else if(function(e,i){var t;void 0===i&&(i={});var n=!1,o=i.extensions?i.extensions:null,v=i.files?i.files:null,f=i.prefix?i.prefix:null,u=null!=(t=i.ignore)?t:null,c=r.basename(e);if(v&&(n=Array.isArray(v)?-1!==v.indexOf("*.*")||-1!==v.indexOf(c):!!(i.regex&&c.match(new RegExp(v))||"*.*"===v)||c===v),!n&&o){var m=r.extname(e);n=Array.isArray(o)?-1!==o.indexOf(m):m===o}if(!n&&f&&(n=0===c.indexOf(f)),n&&void 0!==i.limit&&(n=!l(i)),n&&u&&(n=Array.isArray(u)?!(-1!==u.indexOf(c)):!(c===u)),n){var s=d(i);s&&(n=a(e,s))}return n}(f,m)){var p;if(o)p=!0;else try{e.unlinkSync(f),p=!0}catch(e){}p&&(x[f]=!0,void 0!==m.totalRemoved&&m.totalRemoved++)}})}return y&&(o||i(c),void 0===m.totalRemoved&&(x[c]=!0)),x};export{u as default};
//# sourceMappingURL=find-remove.mjs.map
