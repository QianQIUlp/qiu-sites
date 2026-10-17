import * as THREE from '../../../vendor/three/three.module.min.js';

// A symbolic section through each project's architecture, not a hardware model.
export function createWorkSpecimen(canvas) {
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  } catch {
    canvas.parentElement.classList.add('specimen-unavailable');
    return {setProject() {}, setDepth() {}, setPresentation() {}, setVisible() {}};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 2.4, -2.4, .1, 60);
  camera.position.set(3.4,5.6,10);
  const body = new THREE.Group(), interior = new THREE.Group(), section = new THREE.Group();
  scene.add(body, interior, section);
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), .08);
  const clipping = [cutPlane];
  scene.add(new THREE.HemisphereLight('#faf7ed', '#484d42', 1.35));
  const key = new THREE.DirectionalLight('#fff8e9', 3.2);
  key.position.set(-3, 6, 9);key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -6;key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;key.shadow.camera.bottom = -6;
  key.shadow.normalBias = .025;key.shadow.bias = -.0002;key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#dbe3db', 1.1);
  fill.position.set(6, -3, 4);scene.add(fill);

  const studio = new THREE.Scene();studio.background = new THREE.Color('#777c72');
  for (const [x, y, z, w, h, brightness] of [[-4, 4, 6, 3, 8, 6], [5, 1, 4, .8, 7, 4], [0, -5, 4, 5, 1, 3]]) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(brightness, brightness * .99, brightness * .94), side: THREE.DoubleSide}));
    box.position.set(x, y, z);box.lookAt(0, 0, 0);studio.add(box);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio, .06).texture;
  pmrem.dispose();studio.traverse(node => {if (node.isMesh) {node.geometry.dispose();node.material.dispose();}});

  const graphite = new THREE.MeshStandardMaterial({color: '#242725', metalness: .66, roughness: .34, envMapIntensity: 1.05, clippingPlanes: clipping, clipShadows: true});
  const cutMaterial = new THREE.MeshStandardMaterial({color: '#383c38', metalness: .48, roughness: .36, envMapIntensity: .7});
  const ceramic = new THREE.MeshStandardMaterial({color: '#bcbfaf', metalness: .12, roughness: .52, clippingPlanes: clipping});
  const copper = new THREE.MeshStandardMaterial({color: '#aa8054', metalness: .8, roughness: .32, clippingPlanes: clipping});
  const dark = new THREE.MeshStandardMaterial({color: '#28312a', metalness: .65, roughness: .27, clippingPlanes: clipping});
  const etch = new THREE.LineBasicMaterial({color: '#98a38f', transparent: true, opacity: .19, clippingPlanes: clipping});
  const red = new THREE.LineBasicMaterial({color: '#e83d27', transparent: true, opacity: .92});
  const ghost = new THREE.LineBasicMaterial({color: '#777f70', transparent: true, opacity: .13});
  const cutContour = new THREE.LineBasicMaterial({color:'#b79e7c',transparent:true,opacity:.62});

  const shadowCanvas = document.createElement('canvas');shadowCanvas.width = 256;shadowCanvas.height = 256;
  const shadowContext = shadowCanvas.getContext('2d'), fade = shadowContext.createRadialGradient(128, 128, 16, 128, 128, 128);
  fade.addColorStop(0, '#252b2454');fade.addColorStop(.4, '#252b2436');fade.addColorStop(.7, '#252b2414');fade.addColorStop(1, '#252b2400');
  shadowContext.fillStyle = fade;shadowContext.fillRect(0, 0, 256, 256);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.0), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,toneMapped:false}));
  ground.position.set(.12, -.16, -.90);scene.add(ground);
  function rounded(w, h, r, x = 0, y = 0) {
    const s = new THREE.Shape();
    s.moveTo(x - w / 2 + r, y - h / 2);s.lineTo(x + w / 2 - r, y - h / 2);
    s.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r);s.lineTo(x + w / 2, y + h / 2 - r);
    s.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2);s.lineTo(x - w / 2 + r, y + h / 2);
    s.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r);s.lineTo(x - w / 2, y - h / 2 + r);
    s.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2);
    return s;
  }
  function circle(r, x = 0, y = 0) {
    const shape = new THREE.Shape();shape.absarc(x, y, r, 0, Math.PI * 2, false);return shape;
  }
  function silhouette(key) {
    if (key === 'verisilo') return rounded(4.5, 2.62, 1.30);
    if (key === 'meal') return circle(1.68);
    if (key === 'crew') {
      const points = Array.from({length:192}, (_, i) => {const a = i / 192 * Math.PI * 2, r = 1 + .045 * Math.cos(a * 6);return new THREE.Vector2(Math.cos(a) * 2.12 * r, Math.sin(a) * 1.43 * r);});
      return new THREE.Shape(points);
    }
    const s = new THREE.Shape();
    s.moveTo(-.31, 1.64);s.quadraticCurveTo(0, 2.02, .31, 1.64);s.lineTo(2.02, -1.02);
    s.quadraticCurveTo(2.38, -1.58, 1.68, -1.58);s.lineTo(-1.68, -1.58);s.quadraticCurveTo(-2.38, -1.58, -2.02, -1.02);s.closePath();return s;
  }
  function addHole(shape, hole) {shape.holes.push(new THREE.Path(hole.getPoints(32).reverse()));}
  function mesh(geometry, material, group, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, material);object.position.set(x, y, z);object.castShadow = true;object.receiveShadow = true;group.add(object);return object;
  }
  function outline(shape, group, material, z) {
    const points = shape.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, z));
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);group.add(line);return line;
  }
  function ring(x, y, radius, z, material = copper, thickness = .02) {
    return mesh(new THREE.TorusGeometry(radius, thickness, 8, 72), material, interior, x, y, z);
  }
  function cylinder(x, y, radius, height, z, material) {
    const object = mesh(new THREE.CylinderGeometry(radius, radius, height, 64), material, interior, x, y, z);object.rotation.x = Math.PI / 2;return object;
  }
  function conduit(points, radius = .025, material = copper) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), material, interior);
  }
  const labelCanvas = document.createElement('canvas');labelCanvas.width = 1536;labelCanvas.height = 256;
  const labelTexture = new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace = THREE.SRGBColorSpace;labelTexture.anisotropy = 4;
  let projectLabel = '';
  function paintLabel() {
    const ctx = labelCanvas.getContext('2d');ctx.clearRect(0, 0, 1536, 256);
    ctx.fillStyle = '#d1d1bd';ctx.font = `42px ${mono}`;ctx.fillText(projectLabel, 15, 155);
    ctx.textAlign = 'right';ctx.font = `25px ${mono}`;ctx.fillStyle = '#939b86';ctx.fillText('QIU  /  WORKS', 1520, 155);ctx.textAlign = 'left';
    labelTexture.needsUpdate = true;schedule();
  }
  document.fonts.load('42px "Me Mono"').then(paintLabel).catch(() => {});
  const labelMaterial = new THREE.MeshBasicMaterial({map: labelTexture, transparent: true, depthWrite: false, toneMapped: false});
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.3, .55), labelMaterial);scene.add(label);
  const skin = new THREE.Mesh(new THREE.ShapeGeometry(silhouette('verisilo'), 32), new THREE.MeshStandardMaterial({color:'#242725',metalness:.6,roughness:.37,transparent:true,envMapIntensity:.65}));
  skin.position.z = .548;scene.add(skin);
  const skinText = new THREE.Mesh(new THREE.PlaneGeometry(3.3, .55), labelMaterial);skinText.position.set(0, -.76, .556);scene.add(skinText);
  let targetDepth = .42, depth = .42, frame = 0, width = 1, height = 1, labelY = -.91;
  let presentation = null;
  let visible = false, builtProject = '';
  let cursor = {x: 0, y: 0}, easedCursor = {x: 0, y: 0};
  function clear(group) {
    group.traverse(node => {if (node.geometry) node.geometry.dispose();});group.clear();
  }
  function setProject(keyName, name, index) {
    if (builtProject === keyName) return;
    builtProject = keyName;
    [body, interior, section].forEach(clear);
    const shape = silhouette(keyName), holes = [];
    skin.geometry.dispose();skin.geometry = new THREE.ShapeGeometry(silhouette(keyName), 64);
    labelY = keyName === 'meal' ? -1.23 : keyName === 'hadoop' ? -1.21 : -.91;
    skinText.position.y = labelY;
    label.scale.x = skinText.scale.x = keyName === 'meal' ? .66 : keyName === 'hadoop' ? .8 : 1;
    if (keyName === 'verisilo') {
      [-1.25, 0, 1.25].forEach((x, i) => {
        holes.push(rounded(.8, 1.38, .39, x, .13));
        const coreShape = rounded(.45, .91, .22);
        mesh(new THREE.ExtrudeGeometry(coreShape,{depth:.33,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:4,curveSegments:32}),ceramic,interior,x,.13,-.51);
        const inlay = mesh(new THREE.BoxGeometry(.018,.66,.012),copper,interior,x,.13,-.132);inlay.receiveShadow = false;
        outline(rounded(.62,1.14,.30,x,.13),interior,cutContour,-.40);
        conduit([[x, -.42, -.51], [x, -.65, -.51], [x + (i - 1) * .08, -.8, -.51]], .017);
      });
    } else if (keyName === 'meal') {
      const annulus = circle(.97, 0, .12);holes.push(annulus);
      cylinder(0, .12, .31, .50, -.27, graphite);
      const track = circle(.83,0,.12);addHole(track,circle(.56,0,.12));
      mesh(new THREE.ExtrudeGeometry(track,{depth:.15,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:3,curveSegments:64}),ceramic,interior,0,0,-.40);
      ring(0,.12,.86,-.20,copper,.012);ring(0,.12,.54,-.20,copper,.012);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        const marker = mesh(new THREE.BoxGeometry(.055, .045, .015), i < 9 ? dark : copper, interior, Math.cos(a) * .70, .12 + Math.sin(a) * .70, -.22);marker.rotation.z = a;
      }
      ring(0,.12,.31,-.015,copper,.01);
    } else if (keyName === 'crew') {
      holes.push(circle(.42, 0, .1));
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, x = Math.cos(a) * 1.35, y = .1 + Math.sin(a) * .59;
        holes.push(circle(.22, x, y));cylinder(x, y, .15, .10, -.48, ceramic);
        // Thin surface engravings accompany the independent observation wells.
        const engraving = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, .55),new THREE.Vector3(0,.1,.55)]), ghost);body.add(engraving);
        conduit([[x, y, -.51], [x / 2, (y + .1) / 2, -.47], [0, .1, -.4]], .018);
      }
      cylinder(0, .1, .29, .17, -.4, ceramic);ring(0, .1, .30, -.28, copper, .02);
    } else {
      [[-1.06, -.61], [0, .62], [1.06, -.61]].forEach(([x, y], i) => {
        holes.push(rounded(.75, .85, .10, x, y));
        mesh(new THREE.BoxGeometry(.53, .59, .10), ceramic, interior, x, y, -.45);
        for (let row = 0; row < 4; row++) {
          mesh(new THREE.BoxGeometry(.43, .06, .026), row === i ? copper : dark, interior, x, y - .2 + row * .13, -.37);
        }
      });
      conduit([[-1.06,-.61,-.5],[0,.62,-.5],[1.06,-.61,-.5],[-1.06,-.61,-.5]], .025);
    }
    holes.forEach(hole => addHole(shape, hole));
    const geometry = new THREE.ExtrudeGeometry(shape, {depth: 1.14, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelThickness: .015, bevelSize: .014, curveSegments: 48});
    mesh(geometry, graphite, body, 0, 0, -.6);
    mesh(new THREE.ShapeGeometry(shape, 64), cutMaterial, section);
    // Fine machining marks make the object's depth readable, even from the room map.
    for (let i = 0; i < 35; i++) {const groove=outline(silhouette(keyName),body,etch,-.6+i*.0335);groove.scale.set(1.014,1.014,1);}
    outline(silhouette(keyName), section, red, .007);
    holes.forEach(hole => outline(hole, section, cutContour, .006));
    outline(silhouette(keyName), body, ghost, .56);
    const bottom = mesh(new THREE.ShapeGeometry(silhouette(keyName), 64),dark,interior,0,0,-.575);bottom.castShadow = false;bottom.receiveShadow = false;
    const rulerY = keyName === 'meal' ? -1.78 : keyName === 'hadoop' ? -1.69 : -1.53;
    const cutLine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.75,rulerY,.005),new THREE.Vector3(2.60,rulerY,.005)]);
    section.add(new THREE.Line(cutLine, red));
    for (let n = 0; n <= 40; n++) {
      const x = -2.25 + n * 4.5 / 40;
      const tick = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,rulerY,.005),new THREE.Vector3(x,rulerY-(n%10?.035:.095),.005)]);
      section.add(new THREE.Line(tick, n % 10 ? ghost : red));
    }
    projectLabel = `0${index}  /  ${name.toUpperCase()}`;paintLabel();
  }
  function schedule() {if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);}
  function render() {
    frame = 0;
    if (!visible || document.hidden) return;
    const quiet = document.body.dataset.motion === 'off';
    depth += (targetDepth - depth) * (quiet ? 1 : .22);
    easedCursor.x += (cursor.x - easedCursor.x) * (quiet ? 1 : .16);
    easedCursor.y += (cursor.y - easedCursor.y) * (quiet ? 1 : .16);
    const z = .54 - depth * 1.015;
    cutPlane.constant = z;section.position.z = z;
    label.position.set(0, labelY, z + .01);
    skin.material.opacity = Math.max(0, 1 - depth / .15);skin.visible = skin.material.opacity > .005;
    skinText.visible = skin.visible;
    label.visible = !skin.visible;
    // The tour changes the viewing angle as the light travels; reduced motion keeps the camera still.
    const orbit = presentation !== null && !quiet;
    const sweep = orbit ? Math.sin(presentation * Math.PI * 2) : 0;
    const approach = orbit ? Math.sin(presentation * Math.PI) : 0;
    const cameraX = 3.4 + sweep * 4.3 + (quiet || orbit ? 0 : easedCursor.x * .3);
    const cameraY = 5.6 - approach * 2 + (quiet || orbit ? 0 : easedCursor.y * .26);
    const zoom = 1 + approach * .075;
    const cameraEase = quiet ? 1 : .15;
    camera.position.x += (cameraX - camera.position.x) * cameraEase;
    camera.position.y += (cameraY - camera.position.y) * cameraEase;
    camera.zoom += (zoom - camera.zoom) * cameraEase;camera.updateProjectionMatrix();
    camera.lookAt(0, -.02, -.1);
    renderer.render(scene, camera);
    canvas.parentElement.classList.add('specimen-ready');
    if (Math.abs(targetDepth - depth) > .0005 || Math.abs(cursor.x - easedCursor.x) > .003 || Math.abs(cursor.y - easedCursor.y) > .003 || Math.abs(cameraX - camera.position.x) > .003 || Math.abs(cameraY - camera.position.y) > .003 || Math.abs(zoom - camera.zoom) > .0003) schedule();
  }
  function resize() {
    width = canvas.parentElement.clientWidth;height = canvas.parentElement.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height, vertical = aspect < 1.2 ? 5.05 : 4.35;
    camera.left = -vertical * aspect / 2;camera.right = vertical * aspect / 2;
    camera.top = vertical / 2;camera.bottom = -vertical / 2;camera.updateProjectionMatrix();schedule();
  }
  canvas.parentElement.addEventListener('pointermove', event => {
    if (event.buttons || document.body.dataset.motion === 'off') return;
    const r = canvas.getBoundingClientRect();cursor = {x: (event.clientX - r.left) / r.width - .5, y: (event.clientY - r.top) / r.height - .5};schedule();
  });
  canvas.parentElement.addEventListener('pointerleave', () => {cursor = {x:0, y:0};schedule();});
  new ResizeObserver(resize).observe(canvas.parentElement);
  document.addEventListener('visibilitychange', () => {if (document.hidden) {cancelAnimationFrame(frame);frame = 0;} else schedule();});
  resize();
  return {
    setProject,
    setDepth(value) {const next = Math.max(0, Math.min(1, value));if (targetDepth !== next) {targetDepth = next;schedule();}},
    setPresentation(progress) {if (presentation !== progress) {presentation = progress;schedule();}},
    setVisible(value) {
      visible = value;
      if (visible) schedule();
      else {cancelAnimationFrame(frame);frame = 0;}
    }
  };
}
