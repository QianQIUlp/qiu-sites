import {t} from './language.js';
import {setControl} from './icons.js';
import {createAudioRig,defaultRig,tones,pedalKeys,harmonyShifts,keyNames} from './audio-engine.js';
(() => {
  const sans=getComputedStyle(document.documentElement).getPropertyValue('--sans');
  const room=document.querySelector('#room'),world=document.querySelector('#world');
  const canvas=document.querySelector('#instrument'),ctx=canvas.getContext('2d');
  const underlay=document.createElement('div');underlay.className='world underlay';underlay.append(document.querySelector('.name'));room.prepend(underlay);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!reduced.matches,width=1,height=1,dpr=1,lastFrame=0,frameId=0;
  let tilt={x:0,y:0},pointer={x:0,y:0},guitarInteraction=true;
  const pulses=Array(6).fill(0),frequencies=[329.63,246.94,196,146.83,110,82.41];
  const places={home:{x:0,y:0,z:1,name:t("小屋中央","At home")},papers:{x:-1.12,y:.01,z:1,name:t("几张散页","Loose pages")},music:{x:1.13,y:0,z:1,name:t("琴弦之间","A little jam")},trace:{x:.06,y:-1.11,z:1,name:t("留一笔","Leave a line")},rethink:{x:-1.12,y:1.12,z:1,name:t("另一面", "The other side")},work:{x:1.13,y:1.12,z:1,name:t("拆开看看", "Beneath the surface")},idle:{x:0,y:1.12,z:1,name:t("不赶时间", "No hurry")},paths:{x:-1.12,y:-1.11,z:1,name:t("未走之路", "Paths untaken")},blindspot:{x:1.13,y:-1.11,z:1,name:t("盲点", "Blind spots")},overview:{x:.01,y:.035,z:.24,name:t("整间小屋","The whole room")}};
  let camera={x:0,y:0,z:1},target={...camera},active='home',fling=null;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  let lines=[],drawing=null,lineContact=-1,lastLinePluck=0;
  let loopNotes=[],recording=false,looping=false,recordStart=0,loopStart=0,lastLoopPosition=-1;
  const loopButton=document.querySelector('#loop'),loopClear=document.querySelector('#loop-clear'),loopCaption=document.querySelector('#loop-caption');

  const guitarPhoto=document.querySelector('#guitar-photo');
  guitarPhoto.addEventListener('load',schedule);
  window.addEventListener('guitar-model-ready',schedule);
  guitarPhoto.addEventListener('error',()=>{document.querySelector('#guitar-status').textContent=t("照片未能载入，请刷新页面。","The photograph couldn’t load. Please refresh.");});
  function line(points,color,lineWidth=.8) {
    if(!points.length)return;
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
  }
  function drawGuitar() {
    if(document.querySelector('#guitar-closeup').open&&window.qiuGuitar)return;
    if(!window.qiuGuitar)return;
    const size=Math.min(height*.91,width*(width<680?1.3:.83));
    const follow=motion?1:.3;
    ctx.save();ctx.translate(width*.505+tilt.x*7*follow,height*.475+tilt.y*4*follow);
    ctx.rotate(.32+tilt.x*.025*follow);
    window.qiuGuitar.drawHome(tilt.x*follow,tilt.y*follow);
    // Like everything else in the room, it casts away from the window: a long soft shadow, then a close one.
    ctx.shadowColor='rgba(74,50,26,.24)';ctx.shadowBlur=size*.032;ctx.shadowOffsetX=-size*.03;ctx.shadowOffsetY=size*.04;
    ctx.drawImage(window.qiuGuitar.canvas,-size/2,-size/2,size,size);
    ctx.shadowColor='rgba(46,28,12,.26)';ctx.shadowBlur=size*.006;ctx.shadowOffsetX=-size*.006;ctx.shadowOffsetY=size*.009;
    ctx.drawImage(window.qiuGuitar.canvas,-size/2,-size/2,size,size);
    document.body.classList.add('guitar-home-ready');
    ctx.restore();
  }
  function inView(place) {
    const half=.5/camera.z;
    return Math.abs(place.x-camera.x)<half+.55&&Math.abs(place.y-camera.y)<half+.55;
  }

  function thread(from,to,color='#e83d2730') {
    const x1=from[0]*width,y1=from[1]*height,x2=to[0]*width,y2=to[1]*height;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(x1+(x2-x1)*.3,y1+height*.12,x2-(x2-x1)*.25,y2+height*.19,x2,y2);ctx.strokeStyle=color;ctx.lineWidth=.65;ctx.stroke();
  }
  // The strings room is a close-up of the real Rāna. The photograph keeps its strings;
  // a plucked one blurs into the lens-shaped envelope a ringing string makes.
  const jamCanvas=document.querySelector('#jam-strings'),jamCtx=jamCanvas.getContext('2d');
  const jamLines=[[297,293],[322,320],[348,345],[374,373],[399,401],[425,429]],jamGauge=[.7,.85,1.05,1.3,1.6,1.9];
  function drawJam(now) {
    const w=jamCanvas.clientWidth,h=jamCanvas.clientHeight;if(!w||!h)return;
    const scale=Math.min(2.5,dpr*Math.max(1,camera.z));
    if(jamCanvas.width!==Math.round(w*scale)||jamCanvas.height!==Math.round(h*scale)){jamCanvas.width=Math.round(w*scale);jamCanvas.height=Math.round(h*scale);}
    jamCtx.setTransform(scale,0,0,scale,0,0);jamCtx.clearRect(0,0,w,h);
    const sx=w/860,sy=h/620,start=-40,end=690;
    jamLines.forEach(([a,b],i)=>{
      const p=pulses[i];if(p<.012)return;
      const y=u=>(a+(b-a)*(u-320)/350)*sy,amp=motion?p*Math.min(11,4+i*1.4)*sy:0,phase=Math.cos(now*(.06-i*.0055)+i);
      jamCtx.beginPath();
      for(let n=0;n<=48;n++){const u=start+(end-start)*n/48,e=Math.sin(Math.PI*n/48);jamCtx.lineTo(u*sx,y(u)-amp*e);}
      for(let n=48;n>=0;n--){const u=start+(end-start)*n/48,e=Math.sin(Math.PI*n/48);jamCtx.lineTo(u*sx,y(u)+amp*e);}
      jamCtx.fillStyle=`rgba(236,228,210,${Math.min(.2,p*.22)})`;jamCtx.fill();
      jamCtx.beginPath();
      for(let n=0;n<=48;n++){const u=start+(end-start)*n/48,e=Math.sin(Math.PI*n/48);jamCtx.lineTo(u*sx,y(u)+amp*e*phase);}
      jamCtx.strokeStyle=`rgba(255,247,232,${.35+p*.55})`;jamCtx.lineWidth=jamGauge[i]*Math.max(.7,sx);jamCtx.shadowColor='rgba(255,196,140,.55)';jamCtx.shadowBlur=6*p;jamCtx.stroke();jamCtx.shadowBlur=0;
    });
  }
  function drawBounds() {return width<=600?{x:.07,y:.32,w:.86,h:.47}:width<=700?{x:.33,y:.15,w:.62,h:.68}:{x:.05,y:.07,w:.74,h:.76};}
  function drawTrace(now) {
    const b=drawBounds(),startX=(.06+b.x)*width,startY=(-1.11+b.y)*height;
    ctx.strokeStyle='#878e7130';ctx.lineWidth=.6;
    [[0,0],[1,0],[0,1],[1,1]].forEach(([u,v])=>{const x=startX+u*b.w*width,y=startY+v*b.h*height;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();});
    [...lines,...(drawing?[drawing]:[])].forEach((strand,k)=>{
      if(strand.points.length<2)return;
      const points=strand.points.map((p,i)=>{
        const prev=strand.points[Math.max(0,i-1)],next=strand.points[Math.min(strand.points.length-1,i+1)];
        const dx=(next.x-prev.x)*b.w*width,dy=(next.y-prev.y)*b.h*height,len=Math.hypot(dx,dy)||1;
        const wave=motion?Math.sin(i/(strand.points.length-1)*Math.PI)*Math.sin(now*.034+k)*strand.amp*height*.025:0;
        return{x:startX+p.x*b.w*width-dy/len*wave,y:startY+p.y*b.h*height+dx/len*wave};
      });
      line(points,strand.amp>.04||k%3===0?'#e83d27':'#66744f',1.05);
      [points[0],points[points.length-1]].forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,Math.PI*2);ctx.fillStyle='#eeede7';ctx.fill();ctx.strokeStyle='#e83d27';ctx.lineWidth=.8;ctx.stroke();});
    });
  }
  function render(now) {
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.save();ctx.translate(width/2-camera.x*width*camera.z,height/2-camera.y*height*camera.z);ctx.scale(camera.z,camera.z);ctx.translate(-width/2,-height/2);
    thread([.39,.77],[-.72,.67]);thread([.86,.93],[1.58,.46]);thread([.61,.15],[.77,-.6]);
    thread([-.54,.84],[-.62,1.46]);thread([1.67,.85],[1.65,1.48]);thread([.48,.92],[.51,1.55]);
    thread([-.62,-.16],[-.62,.3]);thread([1.67,-.16],[1.65,.3]);
    thread([-.3,-.56],[.33,-.5]);thread([.91,-.51],[1.38,-.54]);
    if(inView(places.home))drawGuitar();
    if(inView(places.music))drawJam(now);
    if(inView(places.trace))drawTrace(now);
    if(camera.z<.65){
      ctx.globalAlpha=clamp((.65-camera.z)/.18,0,1);ctx.fillStyle='#626b55';ctx.font=`${11/camera.z}px ${sans}`;ctx.textAlign='center';
      [[-.56,.11,t("几张散页","Loose pages")],[1.74,.12,t("琴弦之间","A little jam")],[.69,-.87,t("留一笔","Leave a line")],[-.62,-.87,t("未走之路", "Paths untaken")],[1.64,-.87,t("盲点", "Blind spots")],[-.62,1.23,t("另一面", "The other side")],[.51,1.23,t("不赶时间", "No hurry")],[1.64,1.23,t("拆开看看", "Beneath the surface")]].forEach(([x,y,label])=>ctx.fillText(label,x*width,y*height));ctx.textAlign='start';
      if(!lines.length){const marks=[];for(let i=0;i<85;i++){const t=i/84;marks.push({x:(.43+.51*t)*width,y:(-.52+Math.sin(t*Math.PI*2.5)*.12)*height});}line(marks,'#e83d27',1/camera.z);}
      ctx.globalAlpha=1;
    }
    ctx.restore();
    const transform=`translate(${-camera.x*width*camera.z}px,${-camera.y*height*camera.z}px) scale(${camera.z})`;
    world.style.transform=transform;underlay.style.transform=transform;world.style.setProperty('--detail',clamp((camera.z-.45)/.35,0,1));
  }
  function frame(now) {
    frameId=0;const dt=Math.min(2.5,(now-(lastFrame||now-16))/16.667);lastFrame=now;
    const ease=motion?1-Math.pow(.82,dt):1;
    if(fling)coast(dt);
    ['x','y','z'].forEach(k=>camera[k]+=(target[k]-camera[k])*ease);
    const follow=motion&&guitarInteraction&&active==='home',tx=follow?pointer.x:0,ty=follow?pointer.y:0;
    tilt.x+=(tx-tilt.x)*ease;tilt.y+=(ty-tilt.y)*ease;
    pulses.forEach((v,i)=>pulses[i]=v*Math.pow(motion?.946:.65,dt));
    lines.forEach(l=>l.amp*=Math.pow(motion?.95:.65,dt));
    runLoop(now);updateMeter();render(now);
    const moving=['x','y','z'].some(k=>Math.abs(camera[k]-target[k])>.0003)||Math.abs(tilt.x-tx)>.004||Math.abs(tilt.y-ty)>.004;
    if(fling||recording||looping||moving||vu>-47.5||pulses.some(p=>p>.015)||lines.some(l=>l.amp>.015)||(enabled&&audio&&audio.currentTime<audioTailUntil))schedule();
  }
  function schedule(){if(!frameId&&!document.hidden)frameId=requestAnimationFrame(frame);}
  function resize() {
    const rect=room.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    setActive(active);schedule();
  }
  function setActive(place) {
    const changed=active!==place;
    active=place;room.dataset.place=place;if(place!=='home')pointer={x:0,y:0};room.classList.toggle('overviewing',place==='overview');
    document.querySelectorAll('.language-switch a').forEach(link=>link.hash=place);
    document.querySelector('#where-name').textContent=places[place].name;
    document.querySelector('#where-hint').textContent=place==='papers'?t("举到光里看看 · 点一下翻面","Hold a page to the light · Click to turn"):place==='music'?t("划过琴弦 · A S D F G H","Pluck a string · A S D F G H"):place==='trace'?t("画一根弦 · 松手再拨动","Draw a line · Let go, then pluck"):width<=600?t("拖动画面 · 双指缩放","Drag to wander · Pinch to zoom"):t("拖动画面漫游 · 滚轮缩放","Drag to wander · Scroll to zoom");
    const roomHints={rethink:t("拖动纸带 · 换一面想想", "Turn the ribbon · Think again"),work:t("移动切面 · 看见做法与边界", "Move the section · Reveal decisions"),idle:t("把「应该」放下 · 或者，别动", "Let go of a “should” · Or stay still"),paths:t("拨开线束 · 听一条自己的路", "Bend the threads · Hear your path"),blindspot:t("转动「确定」 · 看见藏住的间隙", "Turn certainty · Find its gaps")};
    if(roomHints[place])document.querySelector('#where-hint').textContent=roomHints[place];
    document.querySelectorAll('[data-scene]').forEach(node=>node.inert=node.dataset.scene!==place);
    document.querySelectorAll('.room-map button').forEach(node=>{const current=node.dataset.place===place;node.classList.toggle('active',current);if(current)node.setAttribute('aria-current','location');else node.removeAttribute('aria-current');});
    document.querySelectorAll('.portal').forEach(node=>node.hidden=place!=='overview');
    if(changed)document.dispatchEvent(new CustomEvent('roomchange',{detail:{place}}));
  }
  function go(place) {
    fling=null;const p=places[place];target={x:p.x,y:p.y,z:p.z};
    setActive(place);history.replaceState(null,'',`#${place}`);schedule();
  }
  function classify() {
    if(target.z<.61){setActive('overview');return;}
    let best='home',distance=Infinity;
    Object.entries(places).filter(([k])=>k!=='overview').forEach(([k,p])=>{const d=Math.hypot(target.x-p.x,target.y-p.y);if(d<distance){distance=d;best=k;}});
    setActive(best);
  }
  for(const name of ['home','papers','music','trace','rethink','work','idle','paths','blindspot']) {
    const portal=document.createElement('button');portal.type='button';portal.className='portal';portal.dataset.place=name;portal.setAttribute('aria-label',t(`走近${places[name].name}`,`Explore: ${places[name].name}`));portal.hidden=true;
    Object.assign(portal.style,{position:'absolute',left:`${(places[name].x+.04)*100}%`,top:`${(places[name].y+.05)*100}%`,width:'92%',height:'88%',pointerEvents:'auto',zIndex:'30',background:'transparent'});world.append(portal);
  }
  document.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.place)));
  function zoomAt(factor,x=width/2,y=height/2) {
    fling=null;
    const old=target.z,next=clamp(old*factor,.2,1.75);
    target.x=clamp(target.x+(x-width/2)/width*(1/old-1/next),-1.65,1.72);
    target.y=clamp(target.y+(y-height/2)/height*(1/old-1/next),-1.5,1.7);target.z=next;classify();schedule();
  }
  document.querySelector('#zoom-in').addEventListener('click',()=>zoomAt(1.2));document.querySelector('#zoom-out').addEventListener('click',()=>zoomAt(1/1.2));
  room.addEventListener('wheel',event=>{if(event.ctrlKey||event.metaKey||event.target.closest('input,.pedal-deck,[data-room-control]'))return;event.preventDefault();const r=room.getBoundingClientRect();zoomAt(Math.exp(-clamp(event.deltaY,-120,120)*.002),event.clientX-r.left,event.clientY-r.top);},{passive:false});
  const contacts=new Map();let pan=null,pinch=null,trail=[];
  // Letting go keeps the room moving: the release speed carries on and bleeds away.
  // Only a camera that drifts to rest beside a corner is drawn the last bit of the way.
  function throwCamera(now){
    const recent=trail.filter(p=>now-p.t<90);
    if(!motion||recent.length<2||now-recent[recent.length-1].t>45)return;
    const a=recent[0],b=recent[recent.length-1],span=Math.max(16,b.t-a.t);
    let vx=(b.x-a.x)/span,vy=(b.y-a.y)/span;const speed=Math.hypot(vx,vy),max=.006;
    if(speed<.00025)return;
    if(speed>max){vx*=max/speed;vy*=max/speed;}
    fling={vx,vy};
  }
  function coast(dt){
    const ms=dt*16.667,decay=Math.pow(.945,dt);
    const nx=target.x+fling.vx*ms,ny=target.y+fling.vy*ms;
    target.x=clamp(nx,-1.65,1.72);target.y=clamp(ny,-1.5,1.7);
    if(target.x!==nx)fling.vx*=-.25;if(target.y!==ny)fling.vy*=-.25;
    fling.vx*=decay;fling.vy*=decay;
    if(Math.hypot(fling.vx,fling.vy)>.00006)return;
    fling=null;classify();
    const p=places[active];if(p&&active!=='overview'&&Math.hypot(target.x-p.x,target.y-p.y)<.14){target.x=p.x;target.y=p.y;}
  }
  room.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('button,a,input,label,.pedal-deck,.loose-paper,.draw-area,[data-room-control]'))return;
    fling=null;contacts.set(event.pointerId,{x:event.clientX,y:event.clientY});room.setPointerCapture(event.pointerId);room.classList.add('dragging');
    if(contacts.size===1){target={...camera};pan={x:event.clientX,y:event.clientY,camera:{...camera}};trail=[];}
    else if(contacts.size===2){const [a,b]=[...contacts.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),z:camera.z};pan=null;}
  });
  room.addEventListener('pointermove',event=>{
    const bounds=room.getBoundingClientRect();if(motion&&guitarInteraction&&active==='home'&&event.pointerType==='mouse'){pointer.x=clamp(((event.clientX-bounds.left)/width-.505)*3,-1,1);pointer.y=clamp(((event.clientY-bounds.top)/height-.475)*2,-1,1);schedule();}
    if(contacts.has(event.pointerId)) {
      contacts.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pinch&&contacts.size===2){const [a,b]=[...contacts.values()];const next=clamp(pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,.2,1.75);zoomAt(next/target.z,(a.x+b.x)/2-bounds.left,(a.y+b.y)/2-bounds.top);}
      else if(pan){target.x=clamp(pan.camera.x-(event.clientX-pan.x)/width/pan.camera.z,-1.65,1.72);target.y=clamp(pan.camera.y-(event.clientY-pan.y)/height/pan.camera.z,-1.5,1.7);trail.push({t:event.timeStamp,x:target.x,y:target.y});if(trail.length>8)trail.shift();}
      camera={...target};
      schedule();
    }
  });
  function endPan(event){if(!contacts.has(event.pointerId))return;contacts.delete(event.pointerId);if(room.hasPointerCapture(event.pointerId))room.releasePointerCapture(event.pointerId);if(contacts.size===1){const p=[...contacts.values()][0];pan={x:p.x,y:p.y,camera:{...target}};pinch=null;}else if(!contacts.size){if(pan&&event.type==='pointerup'){throwCamera(event.timeStamp);if(Math.hypot(event.clientX-pan.x,event.clientY-pan.y)>40)document.dispatchEvent(new CustomEvent('found',{detail:'wander'}));}pan=null;pinch=null;room.classList.remove('dragging');classify();}schedule();}
  // The newcomer's lesson (hints.js): the room drifts a breath toward the pages and settles back,
  // the same coast a released drag makes, so the world shows that it moves before anyone is told.
  document.addEventListener('hint:nudge',()=>{if(!motion||active!=='home'||pan||pinch||fling)return;target={...camera};fling={vx:-.00017,vy:.00002};schedule();});
  room.addEventListener('pointerup',endPan);room.addEventListener('pointercancel',endPan);
  room.addEventListener('pointerleave',()=>{pointer={x:0,y:0};schedule();});
  document.addEventListener('keydown',event=>{
    if(document.querySelector('#guitar-closeup').open)return;
    if(event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,textarea,[contenteditable=true]'))return;
    if(event.key==='Escape'||event.key==='Home'){event.preventDefault();go('home');return;}
    if(event.target.closest('[data-room-control]'))return;
    const note='asdfgh'.indexOf(event.key.toLowerCase());if(active==='music'&&note>=0&&!event.repeat){event.preventDefault();playGesture(note,.9);return;}
    if(active==='music'&&event.code==='Space'&&!event.repeat&&!event.target.closest('button,a')){event.preventDefault();strum();return;}
    const directions={ArrowLeft:[-.2,0],ArrowRight:[.2,0],ArrowUp:[0,-.2],ArrowDown:[0,.2]};
    if(directions[event.key]){event.preventDefault();fling=null;const d=directions[event.key];target.x=clamp(target.x+d[0]/target.z,-1.65,1.72);target.y=clamp(target.y+d[1]/target.z,-1.5,1.7);classify();schedule();}
  });
  const motionButton=document.querySelector('#motion');
  function setMotion(value){motion=value;document.body.dataset.motion=value?'on':'off';motionButton.setAttribute('aria-pressed',String(!value));motionButton.textContent=value?t("动态开","Motion on"):t("动态关","Motion off");if(!value)pointer={x:0,y:0};schedule();}
  motionButton.addEventListener('click',()=>{guitarInteraction=!motion;setMotion(!motion);});reduced.addEventListener('change',e=>setMotion(!e.matches));


  const drawArea=document.querySelector('.draw-area');
  function localPoint(event){const b=drawArea.getBoundingClientRect();return{x:clamp((event.clientX-b.left)/b.width,0,1),y:clamp((event.clientY-b.top)/b.height,0,1)};}
  function commitLine(){if(drawing&&drawing.points.length>3){drawing.amp=1;lines.push(drawing);if(lines.length>18)lines.shift();pluck(drawing.note,.6);drawArea.classList.add('has-lines');document.dispatchEvent(new CustomEvent('found',{detail:'trace-line'}));}drawing=null;schedule();}
  const plucked=()=>document.dispatchEvent(new CustomEvent('found',{detail:'trace-pluck'}));
  drawArea.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.stopPropagation();drawArea.setPointerCapture(event.pointerId);drawing={points:[localPoint(event)],amp:0,note:lines.length%6,pointer:event.pointerId};});
  drawArea.addEventListener('pointermove',event=>{
    event.stopPropagation();const p=localPoint(event);
    if(drawing&&drawing.pointer===event.pointerId){const last=drawing.points[drawing.points.length-1];if(Math.hypot(p.x-last.x,p.y-last.y)>.006&&drawing.points.length<300)drawing.points.push(p);schedule();return;}
    let closest=-1,distance=.035;
    lines.forEach((strand,i)=>strand.points.forEach(point=>{const d=Math.hypot(point.x-p.x,point.y-p.y);if(d<distance){distance=d;closest=i;}}));
    if(closest>=0&&(closest!==lineContact||performance.now()-lastLinePluck>350)){lines[closest].amp=1;pluck(lines[closest].note,.7);lastLinePluck=performance.now();plucked();}lineContact=closest;
  });
  drawArea.addEventListener('pointerup',event=>{event.stopPropagation();if(drawing&&drawing.pointer===event.pointerId){if(drawing.points.length<=3){const p=localPoint(event);let closest=-1,distance=.055;lines.forEach((strand,i)=>strand.points.forEach(point=>{const d=Math.hypot(point.x-p.x,point.y-p.y);if(d<distance){distance=d;closest=i;}}));if(closest>=0){lines[closest].amp=1;pluck(lines[closest].note,.85);plucked();}}commitLine();if(drawArea.hasPointerCapture(event.pointerId))drawArea.releasePointerCapture(event.pointerId);}});
  drawArea.addEventListener('pointercancel',()=>{drawing=null;schedule();});drawArea.addEventListener('pointerleave',()=>lineContact=-1);
  document.querySelector('#add-line').addEventListener('click',()=>{const k=lines.length;drawing={points:Array.from({length:65},(_,i)=>{const t=i/64;return{x:.08+.84*t,y:clamp(.5+Math.sin(t*Math.PI*2+k*.9)*(.17+(k%3)*.035)+(k%3-1)*.08,.05,.95)}}),note:k%6,amp:0};commitLine();});
  document.querySelector('#clear-lines').addEventListener('click',()=>{lines=[];drawing=null;drawArea.classList.remove('has-lines');schedule();});
  // The quiet tutorial (hints.js). A pencil sketches a line by itself and the line hums; later the
  // visitor's own line shivers once, waiting to be touched. Neither makes a sound.
  const ghost=drawArea.querySelector('.trace-ghost path');
  document.addEventListener('hint:sketch',()=>{
    if(!motion||active!=='trace'||drawing||!ghost)return;
    const svg=ghost.ownerSVGElement;svg.getAnimations({subtree:true}).forEach(a=>a.cancel());
    ghost.animate([{clipPath:'inset(-20% 100% -20% 0)'},{clipPath:'inset(-20% -2% -20% 0)'}],{duration:1500,easing:'cubic-bezier(.45,.05,.4,1)',fill:'both'});
    svg.animate([{opacity:0,offset:0},{opacity:1,offset:.04},{opacity:1,offset:.78},{opacity:0}],{duration:4300,fill:'both'});
    // Once drawn, it is plucked by an invisible finger: a damped shiver across its length.
    const ring=[1,1.5,.62,1.3,.82,1.12,.95,1];
    svg.animate(ring.map((y,i)=>({scale:`1 ${y}`,offset:.4+.6*i/(ring.length-1)})),{duration:2600,easing:'ease-in-out'});
  });
  document.addEventListener('hint:quiver',()=>{if(!motion||active!=='trace'||!lines.length)return;lines[lines.length-1].amp=.42;schedule();});

  const closeup=document.querySelector('#guitar-closeup'),guitarStage=document.querySelector('.guitar-stage');
  const detailViews={body:[.79,2.12,t("SH-1n / SH-16\n换成了自己的声音。","SH-1n / SH-16\nA little closer to my own sound.")],neck:[.395,2.55,t("枫木指板，二十二品。","Maple fingerboard. Twenty-two frets.")],head:[.084,4.8,t("BanG Dream!\n乐奈的那把。","BanG Dream!\nRāna’s guitar.")],whole:[.5,.94,t("乐奈同款。也是我的这一把。","Rāna’s model. My own guitar.")]};
  function showDetail(name) {
    const [center,zoom,caption]=detailViews[name];
    const size=Math.min(guitarStage.clientHeight,guitarStage.clientWidth*2.3)*zoom;
    guitarStage.style.setProperty('--photo-size',`${size}px`);
    guitarStage.style.setProperty('--photo-top',`${guitarStage.clientHeight/2-center*size}px`);
    guitarStage.style.setProperty('--photo-pivot',`${center*100}%`);
    guitarStage.dataset.view=name;
    if(window.qiuGuitar)window.qiuGuitar.setDetail(name);
    document.querySelector('#guitar-status').textContent=caption;
    document.querySelectorAll('[data-guitar-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.guitarView===name)));
  }
  document.querySelectorAll('[data-open-guitar]').forEach(button=>button.addEventListener('click',()=>{closeup.showModal();showDetail('body');}));
  document.querySelector('#close-guitar').addEventListener('click',()=>closeup.close());
  document.querySelectorAll('[data-guitar-view]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.guitarView)));
  new ResizeObserver(()=>{if(closeup.open)showDetail(guitarStage.dataset.view||'body');}).observe(guitarStage);

  let audio=null,rig=null,enabled=false,audioTailUntil=0,overdub=false,layers=0,overdubStartCount=0,loopTimer=null;
  let scheduledPulses=[],chord='open',lastSecond=-1,lastMeter=-1;
  const params={...defaultRig},lastNotes=Array(6).fill(-Infinity);
  const chords={open:[0,0,0,0,0,0],Em:[0,0,0,2,2,0],G:[3,3,0,0,2,3],C:[0,1,0,2,3,-1],D:[2,3,2,0,-1,-1]};
  const soundButton=document.querySelector('.audio-toggle'),localSound=document.querySelector('.sound-local');
  const overdubButton=document.querySelector('#loop-overdub'),loopPanel=document.querySelector('.loop-controls');
  const loopBeats=[...document.querySelectorAll('.loop-beats i')],strings=[...document.querySelectorAll('.string')];
  const loopProgress=document.querySelector('.loop-progress i'),layerLabel=document.querySelector('#loop-layer');
  const meterFill=document.querySelector('.output-meter i'),meterLabel=document.querySelector('#output-level'),vuMeter=document.querySelector('.vu-meter');let vu=-48;
  const descriptions={clean:t("干净的弦，留一点空气。","Clean strings. A little room to breathe."),gold:t("温热一点，保留拨弦的棱角。","A little warmth. Keep the edge."),blue:t("多一点沙砾，多一点冲动。","A little grit. Follow the impulse."),harm:t("每个音，都有人轻轻和着。","Every note gets a second voice."),night:t("弹完的音，也舍不得走。","Let the last note linger.")};
  async function ensureAudio(){
    if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');audio=new Audio();rig=createAudioRig(audio);rig.set({...params,volume:0});}
    if(audio.state!=='running')await audio.resume();
  }
  function soundUI(){
    soundButton.setAttribute('aria-pressed',String(enabled));soundButton.querySelector('span').textContent=enabled?t("声音开","Sound on"):t("声音关","Sound off");
    localSound.setAttribute('aria-pressed',String(enabled));setControl(localSound,enabled?t("声音开","Sound on"):t("打开声音","Sound on"),enabled?'southwest':'northeast');
  }
  async function setSound(value){
    try{soundButton.disabled=localSound.disabled=true;await ensureAudio();enabled=value;rig.set({volume:enabled?params.volume:0});soundUI();schedule();return true;}
    catch{enabled=false;setControl(localSound,t("声音暂不可用","Sound is unavailable"),null);soundButton.querySelector('span').textContent=t("声音暂不可用","Sound is unavailable");soundButton.setAttribute('aria-pressed','false');localSound.setAttribute('aria-pressed','false');return false;}
    finally{soundButton.disabled=localSound.disabled=false;}
  }
  soundButton.addEventListener('click',()=>setSound(!enabled));
  // Small sounds from the rooms themselves, heard only when sound is on.
  document.addEventListener('roomsound',event=>{if(!enabled||!rig||document.hidden)return;if(event.detail==='lamp')rig.click(.55,.58);if(event.detail==='crumple')rig.crumple?.();});localSound.addEventListener('click',()=>setSound(!enabled));
  function frequencyFor(index){const fret=active==='music'?chords[chord][index]:0;return fret<0?null:frequencies[index]*2**(fret/12);}
  function pluck(index,strength=1,fromLoop=false){
    const frequency=frequencyFor(index);if(!frequency)return;
    pulses[index]=Math.max(pulses[index],strength);schedule();
    if(!enabled||document.hidden||!audio||audio.state!=='running')return;
    if(audio.currentTime-lastNotes[index]<.045)return;lastNotes[index]=audio.currentTime;
    if(!fromLoop&&(recording||overdub)){
      const time=recording?audio.currentTime-recordStart:((audio.currentTime-loopStart)%6+6)%6;
      if(time>=0&&time<6)loopNotes.push({time,note:index,strength,frequency});
    }
    rig.play(frequency,strength);audioTailUntil=audio.currentTime+(params.echo?12:3.3);
  }
  const strummed=()=>document.dispatchEvent(new CustomEvent('found',{detail:'music-strings'}));
  async function playGesture(index,strength=1){strummed();if(!audio&&!await setSound(true))return;pluck(index,strength);}
  // The quiet tutorial (hints.js): the strings shiver one after another, as if brushed, without a sound.
  document.addEventListener('hint:strings',()=>{if(!motion||active!=='music')return;for(let n=0;n<6;n++)setTimeout(()=>{if(active!=='music')return;pulses[n]=Math.max(pulses[n],.34-n*.02);schedule();},n*95);});
  document.addEventListener('roompluck',async event=>{
    const {index,strength=.5,wake=false}=event.detail||{};
    if(active!=='paths'||!Number.isInteger(index)||index<0||index>5)return;
    if(wake&&!await setSound(true))return;
    if(active==='paths')pluck(index,clamp(strength,0,1),true);
  });
  async function strum(){
    if(!audio&&!await setSound(true))return;
    for(let n=5;n>=0;n--)setTimeout(()=>{if(!document.hidden)pluck(n,.76+(5-n)*.025);},(5-n)*31);
  }
  document.querySelector('#strum').addEventListener('click',strum);
  document.querySelectorAll('[data-chord]').forEach(button=>button.addEventListener('click',()=>{
    chord=button.dataset.chord;
    document.querySelectorAll('[data-chord]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    strings.forEach((b,i)=>{b.dataset.muted=String(chords[chord][i]<0);b.setAttribute('aria-label',chords[chord][i]<0?t("这根弦在当前和弦中不发声","This string is muted in the current chord"):t(`拨动 ${['e','B','G','D','A','E'][i]} 弦，${chords[chord][i]} 品，键盘 ${'ASDFGH'[i]}`,`Pluck ${['e','B','G','D','A','E'][i]}, fret ${chords[chord][i]}, keyboard ${'ASDFGH'[i]}`));});
  }));
  strings.forEach(button=>{
    const note=Number(button.dataset.note);let lastPointer=-Infinity;
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&enabled){lastPointer=performance.now();pluck(note,.67);strummed();}});
    button.addEventListener('click',event=>{if(!event.detail||performance.now()-lastPointer>110||!audio)playGesture(note,1);});
  });
  const stringBed=document.querySelector('.string-bed');let touchString=-1;
  stringBed.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse')return;event.preventDefault();event.stopPropagation();stringBed.setPointerCapture(event.pointerId);
    touchString=Number(event.target.closest('.string')?.dataset.note??-1);if(touchString>=0)playGesture(touchString,.9);
  });
  stringBed.addEventListener('pointermove',event=>{
    if(!stringBed.hasPointerCapture(event.pointerId))return;
    const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest('.string'),note=hit?Number(hit.dataset.note):-1;
    if(note>=0&&note!==touchString)playGesture(note,.8);touchString=note;
  });
  for(const name of ['pointerup','pointercancel'])stringBed.addEventListener(name,event=>{touchString=-1;if(stringBed.hasPointerCapture(event.pointerId))stringBed.releasePointerCapture(event.pointerId);});
  const formats={echoTime:v=>`${v} ms`,harmKey:v=>keyNames[v],harmShift:v=>harmonyShifts[v].label};
  const echoPedal=document.querySelector('.pedal-echo'),echoReadout=document.querySelector('#echo-readout');
  function refreshEffects(custom=false){
    if(rig)rig.set({...params,volume:enabled?params.volume:0});
    document.querySelectorAll('[data-effect]').forEach(pedal=>{
      const on=params[pedal.dataset.effect];pedal.dataset.on=String(on);
      pedal.querySelector('[data-pedal]').setAttribute('aria-pressed',String(on));
    });
    document.querySelectorAll('[data-param]').forEach(input=>{
      const value=params[input.dataset.param],min=Number(input.min),max=Number(input.max);
      input.value=value;input.closest('.dial-control').style.setProperty('--angle',`${-135+(value-min)/(max-min)*270}deg`);
      const formatted=(formats[input.dataset.param]||(v=>(v/10).toFixed(1)))(value);
      input.closest('.dial').querySelector('output').textContent=formatted;input.setAttribute('aria-valuetext',formatted);
    });
    echoReadout.textContent=params.echoTime;
    // Shorter echoes run the tape faster.
    echoPedal.style.setProperty('--reel',`${(.9+params.echoTime/800*2.8).toFixed(2)}s`);
    if(custom){document.querySelectorAll('[data-tone]').forEach(b=>b.setAttribute('aria-pressed','false'));document.querySelector('#tone-caption').textContent=t("现在，是你拧出来的声音。","That’s your sound now.");}
    schedule();
  }
  document.querySelectorAll('[data-pedal]').forEach(button=>{
    const pedal=button.closest('.pedal'),release=()=>pedal.classList.remove('stomping');
    // A footswitch engages under the foot, not on release; the click lands with the press.
    button.addEventListener('pointerdown',event=>{if(event.button===0)pedal.classList.add('stomping');});
    for(const type of ['pointerup','pointerleave','pointercancel','blur'])button.addEventListener(type,release);
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')pedal.classList.add('stomping');});
    button.addEventListener('keyup',release);
    button.addEventListener('click',()=>{
      const key=button.dataset.pedal;params[key]=!params[key];refreshEffects(true);
      if(enabled&&rig)rig.click();navigator.vibrate?.(12);
      if(!pedal.classList.contains('stomping')){pedal.classList.add('stomping');setTimeout(release,110);}
    });
  });
  document.querySelectorAll('[data-tone]').forEach(button=>button.addEventListener('click',()=>{
    Object.assign(params,tones[button.dataset.tone],{volume:params.volume});refreshEffects();
    document.querySelectorAll('[data-tone]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelector('#tone-caption').textContent=descriptions[button.dataset.tone];
  }));
  document.querySelectorAll('[data-param]').forEach(input=>{
    const dial=input.closest('.dial'),min=Number(input.min),max=Number(input.max),step=Number(input.step)||1;
    // Stepped knobs (KEY, SHIFT) click into each detent.
    const detented=(max-min)/step<=12;let drag=null;
    function change(value){
      const next=clamp(Math.round((value-min)/step)*step+min,min,max),key=input.dataset.param;
      if(next===params[key])return;
      params[key]=next;refreshEffects(true);
      if(detented&&enabled&&rig)rig.click(.35,2.4);
    }
    const angleAt=e=>{const r=input.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));};
    input.addEventListener('input',()=>change(Number(input.value)));
    input.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;e.preventDefault();e.stopPropagation();input.focus({preventScroll:true});input.setPointerCapture(e.pointerId);dial.classList.add('dragging');
      const r=input.getBoundingClientRect();
      drag={angle:Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))>r.width*.22?angleAt(e):null,y:e.clientY,value:params[input.dataset.param],turned:0};
    });
    input.addEventListener('pointermove',e=>{
      if(!drag)return;e.stopPropagation();
      // Grab it like a real knob: going around the shaft turns it one to one across its 270° sweep.
      // Far from the shaft, or moving straight up and down, a vertical drag also works.
      const r=input.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      // Near the shaft the angle is meaningless, so it only counts once the pointer is out on the skirt.
      if(Math.hypot(dx,dy)>r.width*.22){
        const angle=Math.atan2(dy,dx);
        if(drag.angle!==null){let delta=angle-drag.angle;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;drag.turned+=delta/(Math.PI*1.5)*(max-min);}
        drag.angle=angle;
      }else drag.angle=null;
      const vertical=(drag.y-e.clientY)/(e.shiftKey?600:180)*(max-min);
      const value=drag.value+(Math.abs(drag.turned)>Math.abs(vertical)?drag.turned:vertical);
      change(value);
    });
    function end(e){drag=null;dial.classList.remove('dragging');if(input.hasPointerCapture(e.pointerId))input.releasePointerCapture(e.pointerId);}
    for(const type of ['pointerup','pointercancel','lostpointercapture'])input.addEventListener(type,end);
    input.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();change(params[input.dataset.param]-Math.sign(e.deltaY)*step);},{passive:false});
    input.addEventListener('dblclick',()=>change(defaultRig[input.dataset.param]));
  });
  const volume=document.querySelector('#master-volume');
  const deck=document.querySelector('.pedal-deck');let deckDrag=null;
  // The room captures touch gestures, so slide the mobile board explicitly.
  deck.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch'||event.target.closest('input')||width>700)return;
    deckDrag={id:event.pointerId,x:event.clientX,scroll:deck.scrollLeft,page:nearestPage(),moved:false};
  });
  deck.addEventListener('pointermove',event=>{
    if(!deckDrag||deckDrag.id!==event.pointerId)return;
    const delta=event.clientX-deckDrag.x;
    if(Math.abs(delta)>7&&!deckDrag.moved){deckDrag.moved=true;deck.classList.add('sliding');deck.setPointerCapture(event.pointerId);}
    if(deckDrag.moved){event.preventDefault();deck.scrollLeft=deckDrag.scroll-delta;}
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])deck.addEventListener(type,event=>{
    if(!deckDrag||deckDrag.id!==event.pointerId)return;
    if(deckDrag.moved){event.preventDefault();const flick=deckDrag.scroll-deck.scrollLeft;pageTo(nearestPage()+(Math.abs(flick)>40&&nearestPage()===deckDrag.page?Math.sign(-flick):0));}
    deckDrag=null;deck.classList.remove('sliding');if(deck.hasPointerCapture(event.pointerId))deck.releasePointerCapture(event.pointerId);
  });
  let wheelSnap=0;
  deck.addEventListener('wheel',event=>{if(width>700||event.target.closest('input'))return;event.preventDefault();deck.scrollLeft+=event.deltaX||event.deltaY;clearTimeout(wheelSnap);wheelSnap=setTimeout(()=>pageTo(nearestPage()),160);},{passive:false});
  // On phones the board pages one pedal at a time; the tabs above it show and choose the centred pedal.
  const pages=[...deck.querySelectorAll('.pedal')],pageTabs=[...document.querySelectorAll('[data-pedal-page]')];
  const pageCentre=pedal=>{const d=deck.getBoundingClientRect(),r=pedal.getBoundingClientRect();return r.left-d.left+deck.scrollLeft+r.width/2;};
  function nearestPage(){const mid=deck.scrollLeft+deck.clientWidth/2;let best=0;pages.forEach((pedal,i)=>{if(Math.abs(pageCentre(pedal)-mid)<Math.abs(pageCentre(pages[best])-mid))best=i;});return best;}
  function pageTo(index){index=clamp(index,0,pages.length-1);deck.scrollTo({left:pageCentre(pages[index])-deck.clientWidth/2,behavior:motion?'smooth':'auto'});markPage(index);}
  function markPage(index){
    if(width>700){delete deck.dataset.paged;pages.forEach(pedal=>delete pedal.dataset.current);return;}
    deck.dataset.paged='';pages.forEach((pedal,i)=>{if(i===index)pedal.dataset.current='';else delete pedal.dataset.current;});
    pageTabs.forEach((tab,i)=>tab.setAttribute('aria-current',String(i===index)));
  }
  pageTabs.forEach((tab,i)=>tab.addEventListener('click',()=>pageTo(i)));
  let pageFrame=0;deck.addEventListener('scroll',()=>{cancelAnimationFrame(pageFrame);pageFrame=requestAnimationFrame(()=>markPage(nearestPage()));},{passive:true});
  // Keyboard focus on a knob or stomp brings its pedal to the middle.
  deck.addEventListener('focusin',event=>{if(width>700||deckDrag)return;const i=pages.indexOf(event.target.closest('.pedal'));if(i>=0&&i!==nearestPage())pageTo(i);});
  addEventListener('resize',()=>requestAnimationFrame(()=>width>700?markPage(0):pageTo(nearestPage())));
  requestAnimationFrame(()=>markPage(nearestPage()));
  volume.addEventListener('input',()=>{params.volume=Number(volume.value);volume.nextElementSibling.value=volume.value;if(rig)rig.set({volume:enabled?params.volume:0});schedule();});
  function updateMeter(){
    const rms=enabled&&rig?rig.meter():0,db=rms>0?20*Math.log10(rms):-Infinity;
    const level=clamp((db+60)/60,0,1);
    meterFill.style.setProperty('--level',`${level*100}%`);
    // A VU needle has weight: it rises quickly and settles back slowly.
    // Calibrated so a clean strum sits near 0 VU and only a pushed Output knob or the volume swings it into the red.
    const needle=Number.isFinite(db)?clamp((db+22.9)/14.35,0,1.1)*96-48:-48;vu+=(needle-vu)*(needle>vu?.32:.08);
    vuMeter.style.setProperty('--vu',`${vu.toFixed(2)}deg`);vuMeter.dataset.on=String(enabled);
    if(vu>39)vuMeter.dataset.hot='true';else if(vu<33)vuMeter.dataset.hot='false';
    const number=Number.isFinite(db)&&db>-70?Math.round(db):null;
    if(lastMeter!==number){meterLabel.textContent=number===null?'−∞ dB':`${number} dB`;lastMeter=number;}
    strings.forEach((button,i)=>button.dataset.playing=String(pulses[i]>.15));
  }
  function closeOverdub(){if(overdub&&loopNotes.length>overdubStartCount)layers++;overdub=false;overdubButton.setAttribute('aria-pressed','false');setControl(overdubButton,t("叠一层","Overdub"),'plus');}
  function loopUI(state){
    loopPanel.dataset.state=state;loopClear.disabled=!loopNotes.length&&!recording;overdubButton.disabled=!looping;
    layerLabel.textContent=t(`${String(layers).padStart(2,'0')} 层`,`${String(layers).padStart(2,'0')} ${layers===1?'LAYER':'LAYERS'}`);
  }
  function pauseLoop(){
    closeOverdub();if(recording&&loopNotes.length)layers=1;recording=false;looping=false;clearInterval(loopTimer);loopTimer=null;
    scheduledPulses=[];rig?.stopLoop();setControl(loopButton,loopNotes.length?t("播放","Play"):t("录一段","Record"),loopNotes.length?'replay':'record');
    loopCaption.textContent=loopNotes.length?t("这一小段，还在这里。","Your little loop is still here."):t("录 6 秒，循环着接着弹。","Record six seconds. Play along.");
    loopUI(loopNotes.length?'paused':'empty');schedule();
  }
  function scheduleLoop(){
    if(!looping||!audio||audio.state!=='running'||document.hidden)return;
    const end=audio.currentTime+.12,from=lastLoopPosition;
    for(let cycle=Math.max(0,Math.floor((from-loopStart)/6));cycle<=Math.floor((end-loopStart)/6);cycle++){
      for(const note of loopNotes){const at=loopStart+cycle*6+note.time;if(at>from&&at<=end&&at>=audio.currentTime){
        rig.play(note.frequency,note.strength,at,'loop');scheduledPulses.push({at,note:note.note,strength:note.strength});
      }}
    }
    lastLoopPosition=end;
  }
  function playLoop(){
    recording=false;looping=true;loopStart=audio.currentTime+.03;lastLoopPosition=loopStart-.001;
    setControl(loopButton,t("暂停","Pause"),'pause');loopCaption.textContent=t("循环着。可以换和弦，叠一层。","Looping. Try another chord or layer.");
    loopUI('playing');clearInterval(loopTimer);scheduleLoop();loopTimer=setInterval(scheduleLoop,25);schedule();
  }
  function runLoop(){
    if(!audio)return;const now=audio.currentTime;
    if(recording){
      const elapsed=now-recordStart;loopProgress.style.width=`${Math.min(100,elapsed/6*100)}%`;
      const seconds=Math.max(0,Math.ceil(6-elapsed));if(seconds!==lastSecond){loopCaption.textContent=t(`正在录下 · ${seconds} 秒`,`Recording · ${seconds}s left`);lastSecond=seconds;}
      loopBeats.forEach((b,i)=>b.classList.toggle('lit',i<=Math.floor(elapsed/.75)));
      if(elapsed>=6){if(loopNotes.length){layers=1;playLoop();}else pauseLoop();}
    }
    if(looping){
      const pos=Math.max(0,(now-loopStart)%6);loopProgress.style.width=`${pos/6*100}%`;
      loopBeats.forEach((b,i)=>b.classList.toggle('lit',i===Math.floor(pos/.75)));
      scheduledPulses=scheduledPulses.filter(p=>{if(p.at<=now){pulses[p.note]=Math.max(pulses[p.note],p.strength);return false;}return true;});
    }
  }
  loopButton.addEventListener('click',async()=>{
    if(recording||looping){pauseLoop();return;}
    if(!await setSound(true))return;
    if(loopNotes.length)playLoop();
    else{recording=true;recordStart=audio.currentTime;lastSecond=-1;setControl(loopButton,t("收好","Finish"),'stop');loopUI('recording');}
    schedule();
  });
  overdubButton.addEventListener('click',()=>{
    if(!looping)return;
    if(overdub){closeOverdub();loopCaption.textContent=t("这一层收好了。继续弹吧。","Layer saved. Keep playing.");loopUI('playing');}
    else{overdub=true;overdubStartCount=loopNotes.length;overdubButton.setAttribute('aria-pressed','true');setControl(overdubButton,t("收好这一层","Keep layer"),'check');loopCaption.textContent=t("继续拨弦，新声音会加入循环。","Keep playing. Add to the loop.");loopUI('overdub');}
  });
  loopClear.addEventListener('click',()=>{loopNotes=[];layers=0;pauseLoop();loopProgress.style.width='0%';loopBeats.forEach(b=>b.classList.remove('lit'));});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frameId);frameId=0;pauseLoop();if(rig)rig.set({volume:0});}
    else{if(rig)rig.set({volume:enabled?params.volume:0});lastFrame=0;schedule();}
  });
  document.querySelector('.language-switch a[aria-current="page"]').addEventListener('click',event=>event.preventDefault());
  refreshEffects();
  document.fonts.ready.then(schedule);
  new ResizeObserver(resize).observe(room);setMotion(motion);setActive('home');resize();
  const entry=location.hash.slice(1);if(Object.hasOwn(places,entry))go(entry);
  window.addEventListener('hashchange',()=>{const place=location.hash.slice(1);if(Object.hasOwn(places,place))go(place);});
})();
