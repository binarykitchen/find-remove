const e=require("fs"),n=require("path"),t=require("fmerge"),r=require("rimraf");let i,o;function c(n,t){const r=e.statSync(n).mtime.getTime();return i>r+1e3*t}function s(e){return e&&"limit"in e}function u(e){return e&&"totalRemoved"in e}function f(e){return u(e)?e.totalRemoved:-2}function a(e){return f(e)>=function(e){return s(e)?e.limit:-1}(e)}function l(e){return e&&"maxLevel"in e}function m(e){return l(e)?e.maxLevel:-1}function x(e){return e&&e.age&&e.age.seconds?e.age.seconds:null}const d=module.exports=function(y,g,v){let A={};if(!a(g)&&e.existsSync(y)){const O=m(g);let h=!1;s(g)&&(g.totalRemoved=u(g)?f(g):0),void 0===v?v=0:v++,v<1?(i=(new Date).getTime(),o=function(e){return!(!e||!("test"in e))&&e.test}(g)):h=function(e,t,r){let i=!1;const o=t&&t.dir;if(o){const u=x(t),f=n.basename(e);Array.isArray(o)?i=-1!==o.indexOf("*")||-1!==o.indexOf(f):(t.regex&&f.match(new RegExp(o))||f===o||"*"===o)&&(i=!0),i&&s(t)&&(i=!a(t)),i&&l(t)&&r>0&&(i=r<=m(t)),u&&i&&(i=c(e,u))}return i}(y,g,v),(-1===O||v<O)&&e.readdirSync(y).forEach(function(r){const i=n.join(y,r);let f,l=!1;try{f=e.statSync(i)}catch(e){l=!0}if(l);else if(f.isDirectory()){const e=d(i,g,v);A=t(A,e),u(g)&&(g.totalRemoved+=Object.keys(e).length)}else if(function(e,t={}){let r=!1;const i=t.extensions?t.extensions:null,o=t.files?t.files:null,u=t.prefix?t.prefix:null,f=t&&t.ignore?t.ignore:null,l=n.basename(e);if(o&&(r=Array.isArray(o)?-1!==o.indexOf("*.*")||-1!==o.indexOf(l):!!(t.regex&&l.match(new RegExp(o))||"*.*"===o)||l===o),!r&&i){const t=n.extname(e);r=Array.isArray(i)?-1!==i.indexOf(t):t===i}if(!r&&u&&(r=0===l.indexOf(u)),r&&s(t)&&(r=!a(t)),r&&f&&(r=Array.isArray(f)?!(-1!==f.indexOf(l)):!(l===f)),r){const n=x(t);n&&(r=c(e,n))}return r}(i,g)){let n;if(o)n=!0;else try{e.unlinkSync(i),n=!0}catch(e){}n&&(A[i]=!0,u(g)&&g.totalRemoved++)}}),h&&(o||r.sync(y),u(g)||(A[y]=!0))}return A};
//# sourceMappingURL=find-remove.modern.mjs.map
