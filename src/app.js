(function(){
const S = 1024;
const $ = id => document.getElementById(id);
const stage = $('stage'), glc = $('gl'), bgEl = $('bg');

/* ---------- state ---------- */
const st = { paper:'#1e1e20', crease:0.45, rough:0.2, light:-30, shadow:0.55, zoom:6.4, spin:false, bg:'warm', bgImg:null, blur:0 };
let uid = 1;
const mk = o => Object.assign({ id:uid++, type:'text', text:'', font:'Montserrat', weight:300, color:'#ffffff', size:200, spacing:0, rot:0, opacity:1, x:.5, y:.5, face:4 }, o);
let elements = [
  mk({ text:'V', face:2, x:.32, y:.30, size:230 }),
  mk({ text:'Š', face:2, x:.68, y:.30, size:230 }),
  mk({ text:'K', face:2, x:.32, y:.70, size:230 }),
  mk({ text:'K', face:2, x:.68, y:.70, size:230 }),
  mk({ text:'10', face:4, x:.54, y:.40, size:400, weight:800, color:'#f2b630', spacing:-8 }),
  mk({ text:'let', face:4, x:.56, y:.72, size:210, weight:300 })
];
let selected = null;

/* ---------- helpers ---------- */
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hexRgb(h){ const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
function canvas(n){ const c=document.createElement('canvas'); c.width=c.height=n||S; return c; }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- paper textures ---------- */
const paperC = [], bumpC = [], faceC = [];
for(let i=0;i<6;i++){ paperC.push(canvas()); bumpC.push(canvas()); faceC.push(canvas()); }
const grain = canvas();
(function(){ const x=grain.getContext('2d'), im=x.createImageData(S,S), d=im.data, r=rng(9);
  for(let i=0;i<d.length;i+=4){ const v=222+r()*33; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; }
  x.putImageData(im,0,0); })();

function creaseLines(r){
  const j=()=> (r()-.5)*12, a=S*.25, b=S*.75, m=S/2;
  return [[0,0,S,S],[S,0,0,S],[m+j(),0,m+j(),S],[0,m+j(),S,m+j()],
          [a,a,b,a],[b,a,b,b],[b,b,a,b],[a,b,a,a]].map(l=>l.map((v,k)=>k<4?v+j()*.4:v));
}
function genPaper(i){
  const r=rng(1000+i*77), k=st.crease;
  const c=paperC[i], x=c.getContext('2d');
  const [R,G,B]=hexRgb(st.paper);
  const N=17, grid=new Float32Array(N*N); for(let q=0;q<grid.length;q++) grid[q]=r()*2-1;
  const im=x.createImageData(S,S), d=im.data;
  for(let y=0;y<S;y++){
    const gy=y/S*(N-1), y0=gy|0, fy=gy-y0;
    for(let xx=0;xx<S;xx++){
      const gx=xx/S*(N-1), x0=gx|0, fx=gx-x0;
      const a=grid[y0*N+x0], b=grid[y0*N+x0+1], c2=grid[(y0+1)*N+x0], e=grid[(y0+1)*N+x0+1];
      const m=(a*(1-fx)+b*fx)*(1-fy)+(c2*(1-fx)+e*fx)*fy;
      const n=(r()-.5)*14+m*6, p=(y*S+xx)*4;
      d[p]=R+n; d[p+1]=G+n; d[p+2]=B+n; d[p+3]=255;
    }
  }
  x.putImageData(im,0,0);
  // fibres
  for(let f=0;f<900;f++){
    x.strokeStyle = r()<.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.09)';
    x.lineWidth=.5+r()*.9; const sx=r()*S, sy=r()*S, an=r()*Math.PI*2, L=6+r()*26;
    x.beginPath(); x.moveTo(sx,sy); x.quadraticCurveTo(sx+Math.cos(an)*L*.5+(r()-.5)*6, sy+Math.sin(an)*L*.5+(r()-.5)*6, sx+Math.cos(an)*L, sy+Math.sin(an)*L); x.stroke();
  }
  // folds
  const lines=creaseLines(r);
  lines.forEach(l=>{
    x.strokeStyle=`rgba(0,0,0,${.28*k})`; x.lineWidth=2.4; x.beginPath(); x.moveTo(l[0],l[1]); x.lineTo(l[2],l[3]); x.stroke();
    x.strokeStyle=`rgba(255,255,255,${.08*k})`; x.lineWidth=1.3; x.beginPath(); x.moveTo(l[0]+1.8,l[1]+1.2); x.lineTo(l[2]+1.8,l[3]+1.2); x.stroke();
  });
  // folded edges
  x.strokeStyle=`rgba(255,255,255,${.05+.07*k})`; x.lineWidth=7; x.strokeRect(3.5,3.5,S-7,S-7);
  x.strokeStyle='rgba(0,0,0,.28)'; x.lineWidth=2; x.strokeRect(9,9,S-18,S-18);

  // bump
  const bx=bumpC[i].getContext('2d');
  bx.filter='none'; bx.fillStyle='#808080'; bx.fillRect(0,0,S,S);
  const small=canvas(256), sx2=small.getContext('2d'), sim=sx2.createImageData(256,256), sd=sim.data;
  for(let q=0;q<sd.length;q+=4){ const v=118+r()*20; sd[q]=sd[q+1]=sd[q+2]=v; sd[q+3]=255; }
  sx2.putImageData(sim,0,0); bx.globalAlpha=.8; bx.drawImage(small,0,0,S,S); bx.globalAlpha=.35; bx.drawImage(grain,0,0); bx.globalAlpha=1;
  bx.filter='blur(2px)';
  lines.forEach(l=>{ bx.strokeStyle=`rgba(0,0,0,${.75*k})`; bx.lineWidth=5; bx.beginPath(); bx.moveTo(l[0],l[1]); bx.lineTo(l[2],l[3]); bx.stroke(); });
  bx.strokeStyle='rgba(255,255,255,.5)'; bx.lineWidth=14; bx.strokeRect(0,0,S,S);
  bx.filter='none';
}

/* ---------- three.js ---------- */
const renderer = new THREE.WebGLRenderer({ canvas:glc, antialias:true, alpha:true, preserveDrawingBuffer:true });
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000,0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30,1,.1,100);
function placeCam(){ camera.position.set(0, st.zoom*.32, st.zoom); camera.lookAt(0,-.1,0); }
placeCam();

scene.add(new THREE.HemisphereLight(0xfff4dc, 0xe0a21c, .75));
scene.add(new THREE.AmbientLight(0xffffff, .12));
const sun = new THREE.DirectionalLight(0xfff0d0, 1.5);
sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.5,far:20}); sun.shadow.bias=-.0005; sun.shadow.radius=6;
scene.add(sun); scene.add(sun.target);
const rim = new THREE.DirectionalLight(0xffd36a, .45); scene.add(rim);
function placeLight(){ const a=st.light*Math.PI/180; sun.position.set(Math.sin(a)*4, 6, Math.cos(a)*4); rim.position.set(-Math.sin(a)*4, 1.5, -Math.cos(a)*4); }
placeLight();

const maxAniso = renderer.capabilities.getMaxAnisotropy();
const maps = faceC.map(c=>{ const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=maxAniso; return t; });
const bumps = bumpC.map(c=>{ const t=new THREE.CanvasTexture(c); t.anisotropy=maxAniso; return t; });
const mats = maps.map((m,i)=> new THREE.MeshStandardMaterial({ map:m, bumpMap:bumps[i], bumpScale:.012, roughness:.88, metalness:0 }));
const SIZE = 1.6;
const cube = new THREE.Mesh(new THREE.BoxGeometry(SIZE,SIZE,SIZE), mats);
cube.castShadow = true; scene.add(cube);
function defaultRot(){ cube.quaternion.setFromEuler(new THREE.Euler(.12,.62,0,'XYZ')); }
defaultRot();

const ground = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.ShadowMaterial({ opacity:st.shadow }));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
// soft contact shadow
const cs = canvas(256), csx = cs.getContext('2d');
const gr = csx.createRadialGradient(128,128,0,128,128,128);
gr.addColorStop(0,'rgba(40,22,0,.85)'); gr.addColorStop(.45,'rgba(40,22,0,.35)'); gr.addColorStop(1,'rgba(40,22,0,0)');
csx.fillStyle=gr; csx.fillRect(0,0,256,256);
const contact = new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2), new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(cs), transparent:true, depthWrite:false, opacity:st.shadow }));
contact.rotation.x = -Math.PI/2; scene.add(contact);

const corners=[]; for(const a of [-1,1]) for(const b of [-1,1]) for(const c of [-1,1]) corners.push(new THREE.Vector3(a,b,c).multiplyScalar(SIZE/2));
const tmp = new THREE.Vector3();
function settle(){
  let min=Infinity; for(const c of corners){ tmp.copy(c).applyQuaternion(cube.quaternion); if(tmp.y<min) min=tmp.y; }
  ground.position.y = min-.002; contact.position.y = min-.001;
}

/* ---------- face drawing ---------- */
function drawFace(i, showSel){
  const x = faceC[i].getContext('2d');
  x.globalCompositeOperation='source-over'; x.globalAlpha=1;
  x.drawImage(paperC[i],0,0);
  const els = elements.filter(e=>e.face===i);
  for(const e of els){
    x.save(); x.translate(e.x*S, e.y*S); x.rotate(e.rot*Math.PI/180); x.globalAlpha=e.opacity;
    if(e.type==='text'){
      x.font = `${e.weight} ${e.size}px "${e.font}", sans-serif`;
      if('letterSpacing' in x) x.letterSpacing = e.spacing+'px';
      x.fillStyle = e.color; x.textAlign='center'; x.textBaseline='middle';
      const lines = (e.text||' ').split('\n'), lh = e.size*.95; let w=0;
      lines.forEach((l,k)=>{ x.fillText(l, 0, (k-(lines.length-1)/2)*lh); w=Math.max(w,x.measureText(l).width); });
      e._w = w; e._h = lines.length*lh*.82;
      if('letterSpacing' in x) x.letterSpacing='0px';
    } else if(e.img){
      const w = e.size, h = w*e.img.naturalHeight/e.img.naturalWidth;
      x.drawImage(e.img, -w/2, -h/2, w, h); e._w=w; e._h=h;
    }
    x.restore();
  }
  // ink takes on the paper grain
  x.globalCompositeOperation='multiply'; x.globalAlpha=.5; x.drawImage(grain,0,0);
  x.globalCompositeOperation='source-over'; x.globalAlpha=1;
  if(showSel && selected && selected.face===i){
    const e=selected; x.save(); x.translate(e.x*S,e.y*S); x.rotate(e.rot*Math.PI/180);
    x.setLineDash([16,10]); x.lineWidth=5; x.strokeStyle='#f2b630';
    x.strokeRect(-e._w/2-16, -e._h/2-16, e._w+32, e._h+32); x.restore();
  }
  maps[i].needsUpdate = true;
}
let showSel = true;
function redraw(faces){ (faces||[0,1,2,3,4,5]).forEach(i=>drawFace(i, showSel)); }
function regenPaper(){ for(let i=0;i<6;i++){ genPaper(i); bumps[i].needsUpdate=true; } redraw(); }

/* ---------- picking & dragging ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(ev){
  const r = glc.getBoundingClientRect();
  ndc.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObject(cube)[0];
  return h ? { face:h.face.materialIndex, u:h.uv.x, v:1-h.uv.y } : null;
}
function hitEl(p){
  const list = elements.filter(e=>e.face===p.face);
  for(let k=list.length-1;k>=0;k--){
    const e=list[k]; if(!e._w) continue;
    const dx=(p.u-e.x)*S, dy=(p.v-e.y)*S, a=-e.rot*Math.PI/180;
    const lx=dx*Math.cos(a)-dy*Math.sin(a), ly=dx*Math.sin(a)+dy*Math.cos(a);
    if(Math.abs(lx)<=e._w/2+18 && Math.abs(ly)<=e._h/2+18) return e;
  }
  return null;
}
let drag=null;
glc.addEventListener('pointerdown', ev=>{
  glc.setPointerCapture(ev.pointerId);
  const p = pick(ev), e = p && hitEl(p);
  if(e){ select(e); drag={mode:'move', el:e, face:p.face, ox:e.x-p.u, oy:e.y-p.v}; }
  else drag={mode:'rotate', lx:ev.clientX, ly:ev.clientY, moved:0};
  glc.classList.add('grabbing'); $('hint').style.opacity='0';
});
glc.addEventListener('pointermove', ev=>{
  if(!drag){ const p=pick(ev); glc.classList.toggle('over-el', !!(p && hitEl(p))); return; }
  if(drag.mode==='rotate'){
    const dx=ev.clientX-drag.lx, dy=ev.clientY-drag.ly; drag.lx=ev.clientX; drag.ly=ev.clientY; drag.moved+=Math.abs(dx)+Math.abs(dy);
    cube.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), dx*.008));
    cube.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), dy*.008));
  } else {
    const p=pick(ev); if(!p) return; const e=drag.el, old=e.face;
    if(p.face!==drag.face){ drag.face=p.face; drag.ox=0; drag.oy=0; e.face=p.face; }
    e.x=Math.min(1,Math.max(0,p.u+drag.ox)); e.y=Math.min(1,Math.max(0,p.v+drag.oy));
    redraw(old===e.face?[e.face]:[old,e.face]); syncEditor();
  }
});
function endDrag(){ if(drag && drag.mode==='rotate' && drag.moved<4){ select(null); } drag=null; glc.classList.remove('grabbing'); }
glc.addEventListener('pointerup', endDrag); glc.addEventListener('pointercancel', endDrag);
glc.addEventListener('wheel', ev=>{ ev.preventDefault(); st.zoom=Math.min(9,Math.max(3.2, st.zoom+ev.deltaY*.004)); $('zoom').value=st.zoom; $('oZoom').textContent=st.zoom.toFixed(1); placeCam(); }, {passive:false});
window.addEventListener('keydown', ev=>{
  if(!selected || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  const s = ev.shiftKey ? .02 : .004, m={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[ev.key];
  if(m){ ev.preventDefault(); selected.x=Math.min(1,Math.max(0,selected.x+m[0])); selected.y=Math.min(1,Math.max(0,selected.y+m[1])); redraw([selected.face]); syncEditor(); }
  if(ev.key==='Delete'||ev.key==='Backspace'){ ev.preventDefault(); removeSel(); }
});

/* ---------- editor ---------- */
const E = { text:$('eText'), font:$('eFont'), weight:$('eWeight'), color:$('eColor'), size:$('eSize'), spacing:$('eSpacing'), rot:$('eRot'), opacity:$('eOpacity'), x:$('eX'), y:$('eY'), face:$('eFace') };
function label(e){ return e.type==='image' ? 'Logo' : (e.text.replace(/\n/g,' ').trim() || 'Text'); }
function renderChips(){
  const box=$('chips'); box.innerHTML='';
  elements.forEach(e=>{ const b=document.createElement('button'); b.className='chip'; b.textContent=label(e);
    b.setAttribute('aria-pressed', e===selected); b.onclick=()=>select(e); box.appendChild(b); });
}
function select(e){
  const prev = selected; selected = e;
  const faces = new Set(); if(prev) faces.add(prev.face); if(e) faces.add(e.face);
  redraw([...faces]); renderChips(); syncEditor();
}
function syncEditor(){
  const e=selected; $('editor').hidden=!e; $('empty').hidden=!!e; if(!e) return;
  const isText = e.type==='text';
  ['rowText','rowFont','rowWeight','rowSpacing'].forEach(id=>$(id).style.display=isText?'':'none');
  E.color.closest('.row').style.display = isText?'':'none';
  if(document.activeElement!==E.text) E.text.value=e.text;
  E.font.value=e.font; E.weight.value=String(e.weight); E.color.value=e.color;
  E.size.value=e.size; E.spacing.value=e.spacing; E.rot.value=e.rot; E.opacity.value=e.opacity;
  E.x.value=e.x; E.y.value=e.y; E.face.value=String(e.face);
  $('oSize').textContent=Math.round(e.size); $('oSpacing').textContent=e.spacing; $('oRot').textContent=e.rot+'°';
  $('oOpacity').textContent=(+e.opacity).toFixed(2); $('oX').textContent=Math.round(e.x*100); $('oY').textContent=Math.round(e.y*100);
}
function bind(key, parse, after){
  E[key].addEventListener('input', async ()=>{
    if(!selected) return; const old=selected.face; selected[key]=parse(E[key].value);
    if(key==='font'||key==='weight'){ try{ await document.fonts.load(`${selected.weight} 100px "${selected.font}"`); }catch(_){} }
    redraw(old===selected.face?[old]:[old,selected.face]); syncEditor(); if(after) after();
  });
}
bind('text', v=>v, renderChips); bind('font', v=>v); bind('weight', v=>+v); bind('color', v=>v);
bind('size', v=>+v); bind('spacing', v=>+v); bind('rot', v=>+v); bind('opacity', v=>+v);
bind('x', v=>+v); bind('y', v=>+v); bind('face', v=>+v);

$('addText').onclick=()=>{ const f = selected ? selected.face : 4; const e=mk({ text:'Text', face:f, size:160, weight:600 }); elements.push(e); select(e); E.text.focus(); E.text.select(); };
$('addLogo').onchange=ev=>{
  const file=ev.target.files[0]; if(!file) return; const rd=new FileReader();
  rd.onload=()=>{ const img=new Image(); img.onload=()=>{ const e=mk({ type:'image', img, face:selected?selected.face:4, size:520 }); elements.push(e); select(e); toast('Logo added. Drag it on the cube to place it.'); };
    img.onerror=()=>toast('That image could not be read. Try a PNG or SVG.'); img.src=rd.result; };
  rd.readAsDataURL(file); ev.target.value='';
};
$('dup').onclick=()=>{ if(!selected) return; const e=Object.assign({}, selected, { id:uid++, x:Math.min(1,selected.x+.05), y:Math.min(1,selected.y+.05) }); elements.push(e); select(e); };
$('front').onclick=()=>{ if(!selected) return; elements=elements.filter(e=>e!==selected); elements.push(selected); redraw([selected.face]); renderChips(); };
function removeSel(){ if(!selected) return; const f=selected.face; elements=elements.filter(e=>e!==selected); selected=null; redraw([f]); renderChips(); syncEditor(); }
$('del').onclick=removeSel;

/* ---------- scene controls ---------- */
function slider(id, out, fmt, fn, evt){ $(id).addEventListener(evt||'input', ()=>{ const v=+$(id).value; $(out).textContent=fmt(v); fn(v); }); }
$('paper').addEventListener('change', ()=>{ st.paper=$('paper').value; regenPaper(); });
slider('crease','oCrease',v=>v.toFixed(2),v=>{ st.crease=v; regenPaper(); },'change');
$('crease').addEventListener('input',()=>$('oCrease').textContent=(+$('crease').value).toFixed(2));
slider('rough','oRough',v=>v.toFixed(2),v=>{ st.rough=v; mats.forEach(m=>m.roughness=.92-v*.5); });
slider('light','oLight',v=>v+'°',v=>{ st.light=v; placeLight(); });
slider('shadow','oShadow',v=>v.toFixed(2),v=>{ st.shadow=v; ground.material.opacity=v; contact.material.opacity=v; });
slider('zoom','oZoom',v=>v.toFixed(1),v=>{ st.zoom=v; placeCam(); });
$('oZoom').textContent=st.zoom.toFixed(1);
$('spin').onclick=()=>{ st.spin=!st.spin; $('spin').setAttribute('aria-pressed',st.spin); };
$('reset').onclick=()=>{ defaultRot(); st.zoom=6.4; $('zoom').value=6.4; $('oZoom').textContent='6.4'; placeCam(); };

function setBg(mode){
  if(mode==='image' && !st.bgImg){ toast('Upload a photo first.'); return; }
  st.bg=mode; document.querySelectorAll('[data-bg]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.bg===mode));
  bgEl.classList.toggle('checker', mode==='none');
  bgEl.style.background = '';
  if(mode==='image'){ bgEl.style.background=`center/cover no-repeat url(${st.bgImg.src})`; }
  bgEl.style.filter = mode==='image' && st.blur ? `blur(${st.blur}px)` : 'none';
}
document.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>setBg(b.dataset.bg));
$('bgFile').onchange=ev=>{
  const file=ev.target.files[0]; if(!file) return; const rd=new FileReader();
  rd.onload=()=>{ const img=new Image(); img.onload=()=>{ st.bgImg=img; setBg('image'); }; img.onerror=()=>toast('That photo could not be read.'); img.src=rd.result; };
  rd.readAsDataURL(file); ev.target.value='';
};
slider('blur','oBlur',v=>v,v=>{ st.blur=v; setBg(st.bg); });

/* ---------- export ---------- */
let downloads = null;
(async ()=>{ try{ downloads = window.claude && window.claude.use ? await window.claude.use('downloads') : null; }catch(_){ downloads=null; } })();
function saveBlob(blob, name){
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}
$('export').onclick=()=>{
  const scale=2, w=stage.clientWidth, h=stage.clientHeight;
  showSel=false; redraw();
  renderer.setPixelRatio(scale); renderer.setSize(w,h,false); settle(); renderer.render(scene,camera);
  const out=canvas(); out.width=w*scale; out.height=h*scale; const o=out.getContext('2d');
  if(st.bg==='warm'){
    const g=o.createRadialGradient(out.width/2,out.height*.38,0,out.width/2,out.height*.5,Math.max(out.width,out.height)*.75);
    g.addColorStop(0,'#f9d76a'); g.addColorStop(.45,'#eab12a'); g.addColorStop(1,'#b77a0c'); o.fillStyle=g; o.fillRect(0,0,out.width,out.height);
  } else if(st.bg==='image'){
    const im=st.bgImg, sc=Math.max(out.width/im.naturalWidth, out.height/im.naturalHeight)*1.04;
    const iw=im.naturalWidth*sc, ih=im.naturalHeight*sc;
    o.filter = st.blur ? `blur(${st.blur*scale}px)` : 'none';
    o.drawImage(im,(out.width-iw)/2,(out.height-ih)/2,iw,ih); o.filter='none';
  }
  o.drawImage(renderer.domElement,0,0,out.width,out.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); resize();
  showSel=true; redraw();
  out.toBlob(async blob=>{
    if(!blob){ toast('Export failed. Try a smaller window.'); return; }
    if(!downloads){ saveBlob(blob,'vskk-10-let-cube.png'); toast('PNG saved'); return; }
    try{ await downloads.save({ filename:'vskk-10-let-cube.png', data:blob }); toast('PNG saved'); }
    catch(err){ if(err && err.code==='declined') return; saveBlob(blob,'vskk-10-let-cube.png'); }
  }, 'image/png');
};

/* ---------- loop ---------- */
function resize(){ const w=stage.clientWidth, h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();
const yAxis=new THREE.Vector3(0,1,0);
function loop(){
  if(st.spin && !drag) cube.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(yAxis,.004));
  settle(); renderer.render(scene,camera); requestAnimationFrame(loop);
}

/* ---------- start ---------- */
regenPaper(); renderChips(); syncEditor(); loop();
Promise.all(['300','400','600','800'].map(w=>document.fonts.load(`${w} 100px "Montserrat"`))).catch(()=>{}).then(()=>document.fonts.ready).then(()=>redraw());
})();
