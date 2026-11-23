/* Anti forced-dark: on Android browsers that force-darken pages (Samsung Internet, TECNO Phoenix, WebView/Chromium force-dark),
   repaint the whole page into <canvas>, which these browsers do not recolor. The DOM stays for layout, links and animations. */
(function(){
var D=document,W=window,H=D.documentElement,UA=navigator.userAgent,Q=new URLSearchParams(location.search).get('cm');
var on=false,cb,ct,xb,xt,dpr=1,vw=0,vh=0,imgs={},flowerCache={},words=null;
function want(){if(Q==='0')return false;if(Q==='1')return true;
 if(!/Android/i.test(UA))return false;
 return /SamsungBrowser/i.test(UA)||(W.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);}
function enable(){if(on)return;on=true;H.classList.add('cm');
 cb=D.createElement('canvas');cb.id='cmb';ct=D.createElement('canvas');ct.id='cmt';
 D.body.insertBefore(cb,D.body.firstChild);D.body.appendChild(ct);
 xb=cb.getContext('2d');xt=ct.getContext('2d');
 var srcs={linen:'linen.jpg',flowers:'flowers3.jpg'},n=0,k;
 for(k in srcs){(function(k){var im=new Image();im.src=srcs[k];imgs[k]=im})(k)}
 requestAnimationFrame(frame);
 addEventListener('resize',function(){words=null;flowerCache={}});
 if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){words=null});
 if(W.MutationObserver){var mo=new MutationObserver(function(){words=null});D.querySelectorAll('section').forEach(function(sec){mo.observe(sec,{subtree:true,childList:true,characterData:true})})}
}
/* Samsung-style detection: a white SVG drawn into a canvas comes back non-white when forced dark is on */
function probe(){try{var im=new Image();im.onload=function(){var c=D.createElement('canvas');c.width=c.height=1;var x=c.getContext('2d');x.drawImage(im,0,0);var d=x.getImageData(0,0,1,1).data;if((d[0]&d[1]&d[2])<255&&Q!=='0'&&/Android/i.test(UA))enable()};
 im.src='data:image/svg+xml;base64,'+btoa('<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="white"/></svg>')}catch(e){}}

function size(){var r=dpr;dpr=W.devicePixelRatio||1;var w=H.clientWidth,h=Math.max(W.innerHeight,cb.getBoundingClientRect().height|0);
 if(w!==vw||h!==vh||r!==dpr){vw=w;vh=h;[cb,ct].forEach(function(c){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)});words=null;flowerCache={}}}
function px(v){return parseFloat(v)||0}
function splitTop(s){var out=[],d=0,b='';for(var i=0;i<s.length;i++){var c=s[i];if(c==='(')d++;if(c===')')d--;if(c===','&&!d){out.push(b);b=''}else b+=c}if(b.trim())out.push(b);return out}
function shadows(s){if(!s||s==='none')return[];return splitTop(s).map(function(p){p=p.trim();var col=p.match(/^(rgba?\([^)]*\)|#\w+)/),rest=p.replace(/^(rgba?\([^)]*\)|#\w+)/,'').trim();
 var nums=rest.split(/\s+/).map(px);return{c:col?col[0]:'rgba(0,0,0,0)',x:nums[0]||0,y:nums[1]||0,b:nums[2]||0,s:nums[3]||0,inset:/inset/.test(p)}})}
function rr(x,p,r){var w=r.w,h=r.h,a=Math.max(0,Math.min(r.rad,w/2,h/2));if(!p)x.beginPath();x.moveTo(r.x+a,r.y);x.arcTo(r.x+w,r.y,r.x+w,r.y+h,a);x.arcTo(r.x+w,r.y+h,r.x,r.y+h,a);x.arcTo(r.x,r.y+h,r.x,r.y,a);x.arcTo(r.x,r.y,r.x+w,r.y,a);x.closePath()}
function opac(el){var o=1;for(var e=el;e&&e!==D.body;e=e.parentElement){if(e.tagName==='SECTION')break;o*=px(getComputedStyle(e).opacity)}return o}
function filt(el){for(var e=el;e&&e.tagName!=='SECTION';e=e.parentElement){var f=getComputedStyle(e).filter;if(f&&f!=='none')return f}return 'none'}
function vis(r){return r.bottom>-60&&r.top<vh+60}

function flowerLayer(sec,r,x){var st=getComputedStyle(sec,'::before');if(!st||st.content==='none'||st.display==='none')return;
 var top=px(st.top),h=px(st.height),w=r.width,y=r.top+top;if(y>vh||y+h<0||!imgs.flowers.naturalWidth)return;
 var key=Math.round(w)+'x'+Math.round(h),c=flowerCache[key];
 if(!c){c=D.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);var g=c.getContext('2d');
  g.drawImage(imgs.flowers,0,0,c.width,c.height);g.globalCompositeOperation='destination-in';
  var gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.05,'#000');gr.addColorStop(.82,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);flowerCache[key]=c}
 x.drawImage(c,r.left,y,w,h)}

function box(el,st,r,x){var bg=st.backgroundColor,bw=px(st.borderTopWidth),bc=st.borderTopColor,rad=px(st.borderTopLeftRadius);
 var R={x:r.left,y:r.top,w:r.width,h:r.height,rad:rad};
 var sh=shadows(st.boxShadow).filter(function(s){return!s.inset});
 if(sh.length){x.save();x.beginPath();x.rect(-1e4,-1e4,3e4,3e4);rr(x,1,R);x.clip('evenodd');
  for(var i=sh.length-1;i>=0;i--){var s=sh[i],E={x:R.x-s.s-2e4,y:R.y-s.s,w:R.w+2*s.s,h:R.h+2*s.s,rad:R.rad+s.s};
   x.shadowColor=s.c;x.shadowBlur=s.b*dpr;x.shadowOffsetX=(s.x+2e4)*dpr;x.shadowOffsetY=s.y*dpr;x.fillStyle='#000';rr(x,0,E);x.fill()}
  x.restore()}
 if(bg&&!/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(bg)){x.fillStyle=bg;rr(x,0,R);x.fill()}
 if(el.classList.contains('rule')){var g=x.createLinearGradient(r.right,0,r.left,0);g.addColorStop(0,'rgba(201,164,92,0)');g.addColorStop(.5,'rgb(201,164,92)');g.addColorStop(1,'rgba(201,164,92,0)');x.fillStyle=g;x.fillRect(r.left,r.top,r.width,r.height)}
 var sides=['Top','Right','Bottom','Left'].map(function(s){return px(st['border'+s+'Width'])});
 if(bw>0&&sides.every(function(v){return v===bw})&&!/, 0\)$/.test(bc)){x.strokeStyle=bc;x.lineWidth=bw;rr(x,0,{x:R.x+bw/2,y:R.y+bw/2,w:R.w-bw,h:R.h-bw,rad:Math.max(0,rad-bw/2)});x.stroke()}
 else if(bw>0&&!sides[1]&&!sides[2]&&!sides[3]){x.fillStyle=bc;x.fillRect(r.left,r.top,r.width,bw)}}

function fontOf(st,s){return st.fontStyle+' '+st.fontWeight+' '+(px(st.fontSize)*s)+'px '+st.fontFamily}
function drawText(x,txt,st,X,Y,s,col){x.font=fontOf(st,s);x.direction='rtl';x.textAlign='right';x.textBaseline='alphabetic';
 var m=x.measureText(txt),base=Y+(m.fontBoundingBoxAscent||px(st.fontSize)*s*.9);
 var sh=shadows(st.textShadow);for(var i=sh.length-1;i>=0;i--){var q=sh[i];x.save();x.shadowColor=q.c;x.shadowBlur=q.b*dpr;x.shadowOffsetX=(q.x+2e4)*dpr;x.shadowOffsetY=q.y*dpr;x.fillStyle='#000';x.fillText(txt,X-2e4,base);x.restore()}
 x.fillStyle=col||st.color;x.fillText(txt,X,base);
 if(/line-through/.test(st.textDecorationLine)){var t=px(st.textDecorationThickness)||Math.max(1,px(st.fontSize)/12);x.fillRect(X-m.width,base-(m.actualBoundingBoxAscent||px(st.fontSize)*.6)*.45-t/2,m.width,t)}}
function textNodes(root){var out=[],w=D.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
 while(n=w.nextNode()){if(!n.data.trim())continue;var toks=[],re=/\S+/g,m;while(m=re.exec(n.data))toks.push([m.index,m.index+m[0].length,m[0]]);out.push({n:n,el:n.parentElement,toks:toks})}return out}
function pseudo(el,r,x,s){var st=getComputedStyle(el,'::after');if(!st||st.content==='none'||st.display==='none')return;var t=st.content.replace(/^["']|["']$/g,'');if(!t)return;
 x.font=fontOf(st,1);var m=x.measureText(t),bottom=r.bottom-px(getComputedStyle(el).borderBottomWidth)-px(st.bottom);
 var X=r.left+r.width/2+m.width/2,Y=bottom-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent);
 x.save();x.globalAlpha*=px(st.opacity);drawText(x,t,st,X,Y,1);x.restore()}
var PIN=null;
function frame(){if(!on)return;requestAnimationFrame(frame);size();var x=xb;x.setTransform(dpr,0,0,dpr,0,0);
 x.fillStyle='#F6E6E3';x.fillRect(0,0,vw,vh);
 var L=imgs.linen,sy=W.scrollY||H.scrollTop;if(L.naturalWidth){var bw=D.body.getBoundingClientRect().width,th=bw*L.naturalHeight/L.naturalWidth,y0=-(sy%th);for(var y=y0;y<vh;y+=th)x.drawImage(L,0,y,bw,th)}
 if(!words)words=textNodes(D.body);
 var secs=D.querySelectorAll('section');
 for(var i=0;i<secs.length;i++){var sec=secs[i],sr=sec.getBoundingClientRect();if(sr.bottom<-200&&sr.bottom+px(getComputedStyle(sec,'::before').height)<0)continue;flowerLayer(sec,sr,x);
  var els=sec.querySelectorAll('*');
  for(var j=0;j<els.length;j++){var el=els[j];if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg')continue;var r=el.getBoundingClientRect();if(!r.width||!vis(r))continue;
   var st=getComputedStyle(el);if(st.visibility==='hidden'||st.display==='none')continue;var o=opac(el);if(o<=0.003)continue;
   x.save();x.globalAlpha=o;var f=filt(el);if(f!=='none')x.filter=f;
   box(el,st,r,x);
   if(el.tagName==='IMG'&&el.complete&&el.naturalWidth)x.drawImage(el,r.left,r.top,r.width,r.height);
   if(el.tagName.toLowerCase()==='svg'){var p=el.querySelector('path');if(p){if(!PIN)PIN=new Path2D(p.getAttribute('d'));var vb=(el.getAttribute('viewBox')||'0 0 24 24').split(/\s+/).map(Number);x.translate(r.left,r.top);x.scale(r.width/vb[2],r.height/vb[3]);x.fillStyle=el.getAttribute('fill')||'#fff';x.fill(PIN)}}
   x.restore();
   var s=el.offsetWidth?r.width/el.offsetWidth:1;
   x.save();x.globalAlpha=o;if(f!=='none')x.filter=f;
   for(var k=0;k<words.length;k++){var w=words[k];if(w.el!==el)continue;
    for(var t=0;t<w.toks.length;t++){var tk=w.toks[t],rg=D.createRange();rg.setStart(w.n,tk[0]);rg.setEnd(w.n,tk[1]);var q=rg.getBoundingClientRect();if(!q.width||!vis(q))continue;drawText(x,tk[2],st,q.right,q.top,s)}}
   pseudo(el,r,x,s);x.restore()}}
 /* petals on top canvas */
 var y2=xt;y2.setTransform(dpr,0,0,dpr,0,0);y2.clearRect(0,0,vw,vh);
 D.querySelectorAll('.petal').forEach(function(p){var st=getComputedStyle(p),w=p.offsetWidth,h=p.offsetHeight,m=new DOMMatrix(st.transform==='none'?undefined:st.transform);
  var cx=p.offsetLeft+w/2+m.e,cy=p.offsetTop+h/2+m.f;if(cy<-40||cy>vh+40)return;
  y2.save();y2.globalAlpha=.75;y2.translate(cx,cy);y2.transform(m.a,m.b,m.c,m.d,0,0);y2.translate(-w/2,-h/2);
  var g=y2.createRadialGradient(.3*w,.3*h,0,.3*w,.3*h,Math.hypot(.7*w,.7*h));g.addColorStop(0,'#F7C9CB');g.addColorStop(1,'#E8959A');y2.fillStyle=g;
  y2.beginPath();y2.moveTo(.7*w,0);y2.lineTo(w,0);y2.lineTo(w,.3*h);y2.ellipse(.3*w,.3*h,.7*w,.7*h,0,0,Math.PI/2);y2.lineTo(0,h);y2.lineTo(0,.7*h);y2.ellipse(.7*w,.7*h,.7*w,.7*h,0,Math.PI,1.5*Math.PI);y2.closePath();y2.fill();y2.restore()})}

if(want())enable();else{probe();if(W.matchMedia){var mq=matchMedia('(prefers-color-scheme: dark)');mq.addEventListener&&mq.addEventListener('change',function(){if(want())enable()})}}
})();
