const n=require("fs"),e=require("path"),t=require("fmerge"),r=require("rimraf");var i,o;function s(e,t){const r=n.statSync(e).mtime.getTime();return i>r+1e3*t}function c(n){return n&&"limit"in n}function a(n){return n&&"totalRemoved"in n}function u(n){return a(n)?n.totalRemoved:-2}function f(n){return u(n)>=function(n){return c(n)?n.limit:-1}(n)}function l(n){return n&&"maxLevel"in n}function d(n){return l(n)?n.maxLevel:-1}function m(n){return n&&n.age&&n.age.seconds?n.age.seconds:null}const y=module.exports=function(x,v,g){var A={};if(!f(v)&&n.existsSync(x)){const h=d(v);var O=!1;c(v)&&(v.totalRemoved=a(v)?u(v):0),void 0===g?g=0:g++,g<1?(i=(new Date).getTime(),o=function(n){return!(!n||!("test"in n))&&n.test}(v)):O=function(n,t,r){var i=!1;const o=t&&t.dir;if(o){const a=m(t),u=e.basename(n);Array.isArray(o)?i=-1!==o.indexOf("*")||-1!==o.indexOf(u):u!==o&&"*"!==o||(i=!0),i&&c(t)&&(i=!f(t)),i&&l(t)&&r>0&&(i=r<=d(t)),a&&i&&(i=s(n,a))}return i}(x,v,g),(-1===h||g<h)&&n.readdirSync(x).forEach(function(r){const i=e.join(x,r);var u,l=!1;try{u=n.statSync(i)}catch(n){l=!0}if(l);else if(u.isDirectory()){const n=y(i,v,g);A=t(A,n),a(v)&&(v.totalRemoved+=Object.keys(n).length)}else if(function(n,t={}){var r=!1;const i=t.extensions?t.extensions:null,o=t.files?t.files:null,a=t.prefix?t.prefix:null,u=t&&t.ignore?t.ignore:null,l=e.basename(n);if(o&&(r=Array.isArray(o)?-1!==o.indexOf("*.*")||-1!==o.indexOf(l):"*.*"===o||l===o),!r&&i){const t=e.extname(n);r=Array.isArray(i)?-1!==i.indexOf(t):t===i}if(!r&&a&&(r=0===l.indexOf(a)),r&&c(t)&&(r=!f(t)),r&&u&&(r=Array.isArray(u)?!(-1!==u.indexOf(l)):!(l===u)),r){const e=m(t);e&&(r=s(n,e))}return r}(i,v)){var d;if(o)d=!0;else try{n.unlinkSync(i),d=!0}catch(n){}d&&(A[i]=!0,a(v)&&v.totalRemoved++)}}),O&&(o||r.sync(x),a(v)||(A[x]=!0))}return A};
//# sourceMappingURL=find-remove.modern.js.map
