const opentype=require('opentype.js');
const f=opentype.loadSync('node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff');
const p=f.getPath('DS',0,0,1);
const bb=p.getBoundingBox();
const r=v=>Math.round(v*1000)/1000;
// flip y, center on x
const cx=(bb.x1+bb.x2)/2, cy=(bb.y1+bb.y2)/2;
const out=[];
for(const c of p.commands){
  const t=[c.type];
  for(const k of ['x1','y1','x','y']) if(c[k]!==undefined) t.push(k[0]==='x'?r(c[k]-cx):r(-(c[k]-cy)));
  out.push(t);
}
const s=out.map(a=>a.join(' ')).join(' ');
console.log(JSON.stringify({w:r(bb.x2-bb.x1),h:r(bb.y2-bb.y1),right:r(bb.x2-cx),bottom:r(-(bb.y2-cy)),d:s}));
