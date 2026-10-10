// A lightweight instrument and effect chain, inspired by pedals, not a circuit emulation.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const defaultRig={goldDrive:32,goldTone:55,goldLevel:50,blueLevel:50,blueTone:50,blueDrive:42,harmBalance:45,harmKey:7,harmShift:2,echoTime:420,echoFeedback:34,echoMix:28,volume:65,gold:false,blue:false,harm:false,echo:false};
export const pedalKeys=['gold','blue','harm','echo'];
export const tones={
  clean:{...defaultRig},
  gold:{...defaultRig,gold:true,goldDrive:34,goldTone:58},
  blue:{...defaultRig,blue:true,blueDrive:58,blueTone:46},
  harm:{...defaultRig,harm:true,gold:true,goldDrive:22,harmBalance:48,harmShift:2},
  night:{...defaultRig,gold:true,echo:true,goldDrive:20,goldTone:44,echoTime:560,echoFeedback:48,echoMix:42}
};
// The harmonist's SHIFT knob, in steps of the chosen major scale (a diatonic harmony, not a fixed interval).
export const harmonyShifts=[{steps:-7,label:'-1 OCT'},{steps:-3,label:'-4TH'},{steps:2,label:'+3RD'},{steps:3,label:'+4TH'},{steps:4,label:'+5TH'},{steps:5,label:'+6TH'},{steps:7,label:'+1 OCT'}];
export const keyNames=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const major=[0,2,4,5,7,9,11];
export function harmonyFor(frequency,key,shift){
  const midi=Math.round(69+12*Math.log2(frequency/440)),offset=frequency/(440*2**((midi-69)/12));
  const relative=((midi-key)%12+12)%12,octave=Math.floor((midi-key)/12);
  // A note outside the key borrows the degree just below it, then keeps its own chromatic distance.
  let degree=6;while(major[degree]>relative)degree--;
  const chromatic=relative-major[degree],steps=harmonyShifts[shift]?.steps??2;
  const target=degree+steps,targetOctave=octave+Math.floor(target/7),targetDegree=((target%7)+7)%7;
  const targetMidi=key+targetOctave*12+major[targetDegree]+chromatic;
  return 440*2**((targetMidi-69)/12)*offset;
}

export function makePluck(context,frequency){
  const rate=context.sampleRate,seconds=clamp(5.2-frequency/260,2.4,5),length=Math.ceil(rate*seconds);
  const samples=new Float32Array(length);
  let seed=2026+Math.round(frequency*31);
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
  // Two strings a hair apart in pitch, like a real string's two planes of motion.
  for(const [detune,weight] of [[1,.78],[1.0011,.34]]){
    const exact=rate/(frequency*detune)-.5,period=Math.floor(exact),fraction=exact-period;
    const allpass=(1-fraction)/(1+fraction),ring=new Float32Array(period);
    // A pick near the bridge: comb the burst, then soften it like a thumb, not a click.
    const pick=Math.max(1,Math.round(period*.13));let soft=0;
    const burst=Array.from({length:period},random);
    for(let i=0;i<period;i++){const v=burst[i]-burst[(i+pick)%period]*.9;soft+=(v-soft)*.55;ring[i]=soft*.95;}
    let last=0,previous=0;const loss=.4992+Math.min(.0006,frequency/2e6);
    for(let i=0;i<length;i++){
      const k=i%period,next=ring[(k+1)%period];
      const averaged=loss*(ring[k]+next);
      const tuned=allpass*averaged+previous-allpass*last;previous=averaged;last=tuned;
      samples[i]+=ring[k]*weight*Math.min(1,i/(rate*.0012))*Math.min(1,(length-i)/(rate*.08));
      ring[k]=tuned;
    }
  }
  let peak=0;for(const v of samples)peak=Math.max(peak,Math.abs(v));
  if(peak>0)for(let i=0;i<length;i++)samples[i]*=.9/peak;
  const buffer=context.createBuffer(1,length,rate);buffer.copyToChannel(samples,0);return buffer;
}
function makeRoom(context,seconds=2.3){
  // A small wooden room: dense early reflections, then a soft, darkening tail.
  const rate=context.sampleRate,length=Math.ceil(rate*seconds),impulse=context.createBuffer(2,length,rate);
  for(let channel=0;channel<2;channel++){
    const data=impulse.getChannelData(channel);let seed=77+channel*991,soft=0;
    for(let i=0;i<length;i++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const t=i/rate,white=seed/4294967296*2-1;
      soft+=(white-soft)*Math.max(.08,.7-t*.3);
      data[i]=soft*Math.pow(1-i/length,2.6)*(t<.012?t/.012:1)*.55;
    }
  }
  return impulse;
}
const ranges={echoTime:[80,800],echoFeedback:[0,72],harmKey:[0,11],harmShift:[0,harmonyShifts.length-1]};
function makeClick(context){
  // A footswitch: a sharp metal tick over a soft thump from the enclosure.
  const rate=context.sampleRate,length=Math.ceil(rate*.06),buffer=context.createBuffer(1,length,rate),data=buffer.getChannelData(0);
  let seed=91,soft=0;
  for(let i=0;i<length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const t=i/rate,white=seed/4294967296*2-1;soft+=(white-soft)*.35;
    data[i]=white*Math.exp(-t*900)*.55+soft*Math.exp(-t*180)*.35+Math.sin(2*Math.PI*96*t)*Math.exp(-t*70)*.5;
  }
  return buffer;
}

function makeCrackle(context){
  // One crease giving way in a sheet of paper: a dry, bright snap that dies almost at once.
  const rate=context.sampleRate,length=Math.ceil(rate*.05),buffer=context.createBuffer(1,length,rate),data=buffer.getChannelData(0);
  let seed=17;
  for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const t=i/rate;data[i]=(seed/4294967296*2-1)*Math.exp(-t*140)*(t<.0015?t/.0015:1);}
  return buffer;
}
export function createAudioRig(context,destination=context.destination){
  const input=context.createGain(),master=context.createGain(),analyser=context.createAnalyser();
  // Plucked notes and their harmony voices meet at the input; the harmonist's BALANCE sets the blend.
  const direct=context.createGain(),harmony=context.createGain();direct.connect(input);harmony.connect(input);harmony.gain.value=0;
  master.gain.value=0;
  const values={...defaultRig},buffers=new Map(),voices=new Set();
  const gain=(value=1)=>{const n=context.createGain();n.gain.value=value;return n;};
  const filter=(type,hz,q=.7)=>{const n=context.createBiquadFilter();n.type=type;n.frequency.value=hz;n.Q.value=q;return n;};
  const smooth=(param,value)=>param.setTargetAtTime(value,context.currentTime,.018);
  function driveStage(blue=false){
    const entry=gain(),output=gain(),dry=gain(),wet=gain(0),pre=gain(),post=gain();
    const shape=context.createWaveShaper(),tone=filter(blue?'lowpass':'highshelf',blue?3400:2200);
    const color=filter(blue?'highpass':'peaking',blue?115:780,blue?.7:.62);
    if(!blue)color.gain.value=2;
    const curve=new Float32Array(4097);
    for(let i=0;i<curve.length;i++){const x=i/(curve.length-1)*2-1,bias=blue?.13:0;curve[i]=(Math.tanh(x*2.3+bias)-Math.tanh(bias))*.72;}
    shape.curve=curve;shape.oversample='2x';
    entry.connect(dry).connect(output);
    entry.connect(color).connect(pre).connect(shape).connect(tone).connect(post).connect(wet).connect(output);
    return{entry,output,dry,wet,pre,post,tone};
  }
  const gold=driveStage(),blue=driveStage(true);
  const highpass=filter('highpass',65),cabinet=filter('lowpass',6600),presence=filter('peaking',2600,.9);
  presence.gain.value=2.5;
  input.connect(highpass).connect(gold.entry);gold.output.connect(blue.entry);blue.output.connect(filter('highpass',35)).connect(presence).connect(cabinet);
  const delay=context.createDelay(1),feedback=gain(.34),delaySend=gain(0),delayMix=gain(0),damping=filter('lowpass',3300),tapeAge=filter('highpass',180);
  cabinet.connect(master);cabinet.connect(delaySend).connect(delay);
  delay.connect(damping).connect(tapeAge).connect(feedback).connect(delay);
  // Tape wow: the echo's pitch drifts a hair as the reels turn.
  const wow=context.createOscillator(),wowDepth=gain(.0011);wow.frequency.value=.55;wow.connect(wowDepth).connect(delay.delayTime);wow.start();
  delay.connect(delayMix).connect(master);
  // Every note gets a little air, whichever pedals are on.
  const room=context.createConvolver(),roomSend=gain(.2),roomTone=filter('lowpass',4200);
  room.buffer=makeRoom(context);cabinet.connect(roomSend).connect(roomTone).connect(room).connect(master);delayMix.connect(roomSend);
  const compressor=context.createDynamicsCompressor();
  compressor.threshold.value=-12;compressor.knee.value=10;compressor.ratio.value=10;compressor.attack.value=.003;compressor.release.value=.14;
  // Catch short transients that can pass through the compressor's attack.
  const ceiling=context.createWaveShaper(),ceilingCurve=new Float32Array(4097);
  for(let i=0;i<ceilingCurve.length;i++){const x=i/(ceilingCurve.length-1)*2-1,a=Math.abs(x);ceilingCurve[i]=a<=.65?x:Math.sign(x)*(.65+.25*Math.tanh((a-.65)/.25));}
  ceiling.curve=ceilingCurve;ceiling.oversample='2x';
  master.connect(compressor).connect(ceiling).connect(destination);
  // The VU reads the board's output before the safety limiter, so the pedals' Output knobs and the volume really move it.
  const sink=gain(0);master.connect(analyser).connect(sink).connect(destination);analyser.fftSize=1024;
  const meterData=new Float32Array(analyser.fftSize);
  function apply(){
    const g=values.goldDrive/100,b=values.blueDrive/100;
    smooth(gold.pre.gain,1+g*24);smooth(gold.post.gain,(.45+values.goldLevel/100)*.76);
    smooth(gold.tone.gain,(values.goldTone-50)*.18);
    // The gold voice keeps some clean attack mixed under its soft clipping.
    smooth(gold.dry.gain,values.gold?.35:1);smooth(gold.wet.gain,values.gold?.85:0);
    smooth(blue.pre.gain,1+b*38);smooth(blue.post.gain,(.4+values.blueLevel/100)*.75);
    smooth(blue.tone.frequency,900*Math.pow(8,values.blueTone/100));
    smooth(blue.dry.gain,values.blue?0:1);smooth(blue.wet.gain,values.blue?1:0);
    const blend=values.harmBalance/100;
    smooth(direct.gain,values.harm?Math.min(1,2-2*blend):1);smooth(harmony.gain,values.harm?Math.min(1,2*blend)*.82:0);
    smooth(delay.delayTime,values.echoTime/1000);smooth(feedback.gain,values.echoFeedback/100);
    smooth(delaySend.gain,values.echo?1:0);smooth(delayMix.gain,values.echo?values.echoMix/100:0);
    smooth(master.gain,values.volume/100*.65);
  }
  function set(patch){
    for(const [key,value] of Object.entries(patch)){
      if(!Object.hasOwn(values,key))continue;
      if(pedalKeys.includes(key))values[key]=Boolean(value);
      else if(Number.isFinite(value)){const [min,max]=ranges[key]||[0,100];values[key]=clamp(value,min,max);}
    }
    apply();
  }
  function voice(frequency,strength,when,kind,into){
    const key=frequency.toFixed(3);
    if(!buffers.has(key)){if(buffers.size>=64)buffers.delete(buffers.keys().next().value);buffers.set(key,makePluck(context,frequency));}
    if(voices.size>=40){const first=voices.values().next().value;first.source.stop();voices.delete(first);}
    const source=context.createBufferSource(),level=gain(clamp(strength,0,1)*.85);
    source.buffer=buffers.get(key);source.connect(level).connect(into);
    const entry={source,kind};voices.add(entry);
    source.onended=()=>{voices.delete(entry);source.disconnect();level.disconnect();};
    source.start(Math.max(when,context.currentTime));return source;
  }
  function play(frequency,strength=1,when=context.currentTime,kind='live'){
    if(!Number.isFinite(frequency)||frequency<40||frequency>1600)return;
    // The harmony voice always rings, silently when bypassed, so BALANCE and the switch act on notes already sounding.
    const second=harmonyFor(frequency,values.harmKey,values.harmShift);
    if(second>=40&&second<=2400)voice(second,strength*.9,when+.009,kind,harmony);
    return voice(frequency,strength,when,kind,direct);
  }
  const clickBuffer=makeClick(context),clickLevel=gain(.32);clickLevel.connect(compressor);
  function click(level=1,rate=1){
    // rate > 1 makes the smaller, drier tick of a stepped knob's detent.
    const source=context.createBufferSource(),amount=gain(level);source.buffer=clickBuffer;source.playbackRate.value=rate;
    source.connect(amount).connect(clickLevel);source.start();source.onended=()=>{source.disconnect();amount.disconnect();};
  }
  const crackleBuffer=makeCrackle(context);
  function crumple(){
    // A slip balled up in a fist: a dozen creases collapse over a third of a second.
    const start=context.currentTime;
    for(let i=0;i<13;i++){
      const when=start+Math.pow(Math.random(),1.6)*.34,source=context.createBufferSource(),band=context.createBiquadFilter(),amount=gain(.1+Math.random()*.22);
      source.buffer=crackleBuffer;source.playbackRate.value=.55+Math.random()*1.1;
      band.type='bandpass';band.frequency.value=1400+Math.random()*4200;band.Q.value=.7+Math.random()*1.4;
      source.connect(band).connect(amount).connect(clickLevel);source.start(when);source.onended=()=>{source.disconnect();band.disconnect();amount.disconnect();};
    }
  }
  function stopLoop(){for(const v of voices)if(v.kind==='loop'){v.source.stop();voices.delete(v);}}
  function meter(){analyser.getFloatTimeDomainData(meterData);let sum=0;for(const n of meterData)sum+=n*n;return Math.sqrt(sum/meterData.length);}
  apply();
  return{input,set,play,click,crumple,stopLoop,meter,get active(){return voices.size>0;}};
}
