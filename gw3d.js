/* iGate S em 3D para a vista dos bornes do guia de instalação.
   Gerado a partir do modelo de gateway-3d.html. Uso: var gw=IGATE3D.create(canvas); gw.wire(3,'#111',0.5); gw.draw(); */
(function(){
'use strict';
var TB={1:['SU+'],2:['SU−'],3:['GND'],4:['VCC'],5:['RX'],6:['GND'],7:['TX'],8:['NC'],9:['B'],10:['GND'],11:['A'],12:['NC'],13:['DI1'],14:['GND'],15:['GND'],16:['DI2']};
function create(canvas,opts){
  if(!window.THREE)return null;
  var T=THREE, LOGO_IGOAL=opts&&opts.logo;
  var renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;
  var scene=new T.Scene(), camera=new T.PerspectiveCamera(30,16/9,1,2500);
  scene.add(new T.HemisphereLight(0xffffff,0x3a4250,0.5));
  var d1=new T.DirectionalLight(0xffffff,0.55);d1.position.set(80,140,160);scene.add(d1);
  var d2=new T.DirectionalLight(0xffffff,0.22);d2.position.set(-120,-60,80);scene.add(d2);
  function mat(c,o){o=o||{};o.color=c;if(o.roughness===undefined)o.roughness=0.6;return new T.MeshStandardMaterial(o)}
  var M={body:mat(0x9299cc,{roughness:0.55}),green:mat(0x27a851,{roughness:0.45}),greenD:mat(0x1b7d3a,{roughness:0.55}),greenL:mat(0x4fcf7a,{roughness:0.4}),greenS:mat(0x145f2c,{roughness:0.7}),slot:mat(0x3c4044,{metalness:0.5,roughness:0.5}),
    black:mat(0x0d0e10,{roughness:0.45}),dark:mat(0x1d1e21,{roughness:0.6}),grille:mat(0x0f1012,{roughness:1}),vent:mat(0x08080a,{roughness:0.9}),hole:mat(0x050506,{roughness:0.9}),
    steel:mat(0xc9cdd0,{metalness:0.7,roughness:0.28}),knurl:mat(0x2a2b2e,{metalness:0.5,roughness:0.45,flatShading:true}),
    rail:mat(0xa9afb4,{metalness:0.7,roughness:0.35}),copper:mat(0xd58a4a,{metalness:0.6,roughness:0.35}),rubber:mat(0x17181a,{roughness:0.85})};
  var g=new T.Group();scene.add(g);
  function box(w,h,d,m,x,y,z,p){var o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o}
  function cyl(rt,rb,h,m,x,y,z,seg,p){var o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||24),m);o.position.set(x,y,z);(p||g).add(o);return o}
  function label(draw,w,h,pw,ph){var cv=document.createElement('canvas');cv.width=pw;cv.height=ph;draw(cv.getContext('2d'),pw,ph);
    var tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;tx.anisotropy=8;
    return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}

  /* ---------- corpo: duas placas laterais com o perfil completo e um miolo com os rebaixos ---------- */
  var W=22.5;
  function prof(P){var q=new T.Shape();P.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();return q}
  function slabX(P,x0,x1,m,bev){
    bev=bev||0;var geo=new T.ExtrudeGeometry(prof(P),{depth:(x1-x0)-2*bev,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelOffset:-bev,bevelSegments:2});
    geo.rotateY(-Math.PI/2);var o=new T.Mesh(geo,m);o.position.x=x1-bev;g.add(o);return o}
  var PLATE=[[57,-37],[57,37],[45,49.5],[-28,49.5],[-30,47.5],[-57,47.5],[-57,18],[-53,18],[-53,-18],[-57,-18],[-57,-47.5],[-30,-47.5],[-28,-49.5],[45,-49.5]];
  var CORE=[[55.5,-37.5],[55.5,37.5],[49,44],[23,44],[23,47],[20,47],[20,36],[-24,36],[-24,49.5],[-28,49.5],[-30,45],[-50,45],[-50,47.5],[-57,47.5],[-57,18],[-53,18],[-53,-18],[-57,-18],[-57,-47.5],[-50,-47.5],[-50,-45],[-30,-45],[-28,-49.5],[-24,-49.5],[-24,-36],[20,-36],[20,-47],[23,-47],[23,-44],[49,-44]];
  slabX(PLATE,9.9,11.25,M.body,0.35);slabX(PLATE,-11.25,-9.9,M.body,0.35);slabX(CORE,-10,10,M.body);
  var seam=mat(0x8d92b4,{roughness:0.7});
  [1,-1].forEach(function(s){
    box(0.25,0.2,4,seam,0,s*49.55,-26);box(0.25,0.2,20,seam,0,s*45.05,-40);box(0.25,0.2,7,seam,0,s*47.55,-53.5);
    box(0.25,0.2,3,seam,0,s*47.05,21.5);
    var sm=box(0.25,0.2,9.2,seam,0,s*40.8,52.3);sm.rotation.x=s*Math.PI/4;
    /* aletas de ventilação, duas colunas */
    for(var i=0;i<7;i++)[-4.9,4.9].forEach(function(x){box(7.4,0.5,1.25,M.vent,x,s*44.95,-32.2-i*2.45)});
    /* divisória entre os dois conectores e grade preta da frente, de onde sai a antena */
    box(19.8,10.5,3.4,M.body,0,s*41.25,-2.2);
    box(19.8,2.6,26,M.grille,0,s*45.2,36);
    for(i=0;i<8;i++)[-5.6,5.6].forEach(function(x){box(5.2,0.3,1.3,M.vent,x,s*46.45,26.5+i*2.9)});
  });
  /* furos e pinos das laterais */
  [1,-1].forEach(function(k){
    [[38,45,1.6],[-31,40,1.6],[-53,41,1.6],[-17,-45,1.6],[-42,-44,1.6],[52,-36,1.6],[16,40,0.8],[-5,38,0.8],[-51,9,0.8],[-48,-23,0.8],[9,-38,0.8],[31,-35,0.8]].forEach(function(h){
      var c=new T.Mesh(new T.CircleGeometry(h[2],18),M.hole);c.rotation.y=k*Math.PI/2;c.position.set(k*(W/2+0.03),h[1],h[0]);g.add(c)});
    box(0.12,72,0.5,seam,k*(W/2+0.02),0,48.5);
  });
  /* trava preta do trilho e trilho DIN */
  box(18,35,5.4,M.black,0,0,-55.4);box(18,6,3,M.black,0,-21,-56);
  box(260,27,1.2,M.rail,0,0,-66);box(260,1.2,7.5,M.rail,0,13.5,-62.3);box(260,1.2,7.5,M.rail,0,-13.5,-62.3);
  box(260,4.5,1.2,M.rail,0,16,-58.8);box(260,4.5,1.2,M.rail,0,-16,-58.8);

  /* ---------- frente: painel preto rebaixado entre as bordas lilás ---------- */
  box(19.8,75,0.8,M.black,0,0,55.7);
  var fp=label(function(c,w,h){
    c.fillStyle='#17181b';c.strokeStyle='#303236';c.lineWidth=5;
    c.beginPath();if(c.roundRect)c.roundRect(14,494,300,900,16);else c.rect(14,494,300,900);c.fill();c.stroke();
    c.fillStyle='#c5c8cc';c.font='600 50px sans-serif';c.textBaseline='middle';
    ['PWR','NET','DI1','DI2'].forEach(function(t,i){c.fillText(t,120,108+i*110)});
    c.fillStyle='#000';c.strokeStyle='#3a3d41';c.lineWidth=4;
    c.beginPath();if(c.roundRect)c.roundRect(34,612,20,256,9);else c.rect(34,612,20,256);c.fill();c.stroke();
    c.beginPath();if(c.roundRect)c.roundRect(50,1300,46,46,11);else c.rect(50,1300,46,46);c.fill();c.stroke();
  },17.5,74,350,1480);fp.position.set(0,0,56.14);g.add(fp);
  var leds=[31.7,26.3,20.7,15.1].map(function(y){
    var m=new T.MeshStandardMaterial({color:0x34363a,emissive:0x35e06a,emissiveIntensity:2.2,roughness:0.4});
    box(1.1,1.9,0.3,m,-5.9,y,56.2);return m});
  /* RJ45 */
  box(11.4,15.6,0.9,M.steel,-1.8,-16,56.2);box(9.6,13.8,1,M.vent,-1.8,-16,56.25);
  box(0.9,1.6,0.3,mat(0x2bd45a,{emissive:0x2bd45a,emissiveIntensity:0.5}),-5.6,-10.6,56.8);
  box(0.9,1.6,0.3,mat(0xe6c619,{emissive:0xe6c619,emissiveIntensity:0.5}),-5.6,-21.4,56.8);
  /* águia gravada na tampa de cima */
  (function(){
    if(typeof LOGO_IGOAL==='undefined')return;var img=new Image();
    img.onload=function(){var cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;var c=cv.getContext('2d');
      c.drawImage(img,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#7e83a6';c.fillRect(0,0,cv.width,cv.height);
      var tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;
      var e=new T.Mesh(new T.PlaneGeometry(6.4,6.4*cv.height/cv.width),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}));
      e.rotation.x=-Math.PI/4;e.position.set(-4.6,40.85,52.4);g.add(e)};
    img.src=LOGO_IGOAL;
  })();

  /* ---------- etiquetas laterais gravadas ---------- */
  var side=label(function(c,w,h){
    c.strokeStyle=c.fillStyle='#6f6258';c.lineWidth=2.5;c.textBaseline='middle';
    var x0=120,rowH=38,y0=40;c.font='600 25px sans-serif';
    for(var n=1;n<=16;n++){var y=y0+(n-1)*rowH;c.strokeRect(x0,y,46,rowH);c.textAlign='center';c.fillText(n,x0+23,y+rowH/2+1);
      c.strokeRect(x0+260,y,210,rowH);c.fillText(TB[n][0],x0+365,y+rowH/2+1)}
    [[1,2,'SSU'],[3,4,'POWER'],[5,7,'RS232'],[8,8,'NC'],[9,11,'RS485'],[12,12,'NC'],[13,16,'DI']].forEach(function(r){
      var y=y0+(r[0]-1)*rowH,hh=(r[1]-r[0]+1)*rowH;c.strokeRect(x0+46,y,214,hh);c.fillText(r[2],x0+153,y+hh/2+1)});
    c.textAlign='left';c.font='600 27px sans-serif';c.fillText('Power Supply: 9 - 30 VDC @ 1A',60,y0+16*rowH+44);c.fillText('Digital Inputs: +24VDC',60,y0+16*rowH+80);
  },70,70,760,760);side.rotation.y=Math.PI/2;side.position.set(W/2+0.06,0,6);g.add(side);
  var other=label(function(c,w,h){c.fillStyle='#6f6258';c.textBaseline='middle';
    c.font='700 54px sans-serif';c.fillText('iGOAL',60,120);c.font='700 34px sans-serif';c.fillText('GATEWAY',60,200);
    c.font='600 40px sans-serif';c.fillText('IGOAL iGate S +',60,256);c.font='500 28px sans-serif';c.fillText('IoT Gateway iGate S + v2',60,304);
    c.font='700 30px sans-serif';c.fillText('MADE IN BRAZIL',60,600);
  },66,66,700,700);other.rotation.y=-Math.PI/2;other.position.set(-W/2-0.06,0,4);g.add(other);

  /* ---------- bornes plugáveis de 4 vias, em cunha (como nas fotos) ----------
     face longa inclinada para o lado do trilho: entradas dos fios; faixa estreita na crista: numeração;
     face íngreme voltada para a frente: janelas de teste e parafusos. Os de baixo são o mesmo conector girado 180°. */
  var PITCH=5.08, term={};
  var SEC=[[-8,36],[-8,47.5],[1.5,52.6],[4.2,51],[9,43.5],[9,36]];
  var AL=Math.atan2(5.1,9.5), BE=Math.atan2(1.6,2.7), GA=Math.atan2(7.5,4.8);
  function tblock(first,s,zc){
    var B=new T.Group();B.position.set(0,0,zc);if(s<0)B.rotation.z=Math.PI;g.add(B);
    var geo=new T.ExtrudeGeometry(prof(SEC),{depth:19.8,bevelEnabled:true,bevelThickness:0.25,bevelSize:0.25,bevelOffset:-0.25,bevelSegments:2});
    geo.rotateY(-Math.PI/2);var body=new T.Mesh(geo,M.green);body.position.x=9.9;B.add(body);
    function face(z,y,rx){var f=new T.Group();f.position.set(0,y,z);f.rotation.x=rx;B.add(f);return f}
    var HF=face(-3.25,50.05,-AL), SF=face(2.85,51.8,BE), CF=face(6.6,47.25,GA);
    /* numeração na crista */
    var strip=label(function(c,w,h){c.fillStyle='#5f7266';c.font='500 54px sans-serif';c.textAlign='center';c.textBaseline='middle';
      for(var i=0;i<4;i++){var n=s>0?first+i:first+3-i;c.fillText(n,w/8+i*w/4,h/2+2);c.fillRect(w/8+i*w/4-26,h-7,52,3)}},20.3,3.05,406,61);
    strip.rotation.x=-Math.PI/2;strip.position.y=0.04;SF.add(strip);
    box(20.3,0.12,0.25,M.greenD,0,0.02,1.62,SF);box(20.3,0.12,0.25,M.greenD,0,0.02,-1.62,SF);
    /* base preta do conector e pés */
    box(19.6,7,2.4,M.dark,0,39.6,10.1,B);
    [-5.08,5.08].forEach(function(x){box(2.3,8,2.6,M.green,x,40,10.1,B)});
    [-1.2,8.6].forEach(function(x){box(2.4,2.2,0.3,mat(0x7d1a1f),x,41.5,11.35,B)});
    for(var j=0;j<4;j++){
      var xl=(j-1.5)*PITCH, n=s>0?first+j:first+3-j;
      /* entrada do fio: abertura retangular com a gaiola metálica no fundo */
      box(4.2,0.3,6.3,M.greenD,xl,0.0,0.1,HF);
      box(3.8,0.34,5.7,M.greenS,xl,0.0,0.1,HF);
      box(3.6,0.38,1.7,M.hole,xl,0.0,2.0,HF);
      box(3.0,0.42,0.3,M.steel,xl,0.0,1.35,HF);
      /* janela de teste e parafuso de fenda rebaixado */
      box(1.9,0.3,0.85,M.greenS,xl,0.0,-2.95,CF);
      cyl(2.15,2.15,0.3,M.greenS,xl,0.0,0.95,24,CF);
      var hold=new T.Group();hold.position.set(xl,0.05,0.95);CF.add(hold);
      var sg=new T.Group();hold.add(sg);
      cyl(1.7,1.7,0.4,M.steel,0,0,0,24,sg);box(2.9,0.46,0.5,M.slot,0,0,0,sg);
      term[n]={x:s*xl,s:s,y:s*50.05,z:zc-3.25,n:new T.Vector3(0,s*Math.cos(AL),-Math.sin(AL)),screw:sg};
    }
  }
  tblock(1,1,-15.2);tblock(9,1,8.8);tblock(5,-1,-15.2);tblock(13,-1,8.8);

  /* ---------- antenas: conector SMA dourado, porca recartilhada, corpo com anéis, dobradiça em garfo e haste torneada ---------- */
  M.gold=mat(0xc9a54a,{metalness:0.85,roughness:0.28});M.rubber=mat(0x1b1c1f,{roughness:0.55});M.rubberD=mat(0x0c0d0e,{roughness:0.7});
  var WHIP=new T.LatheGeometry([[0,0],[3.5,0],[4.2,5],[4.5,13],[4.5,29],[4.2,31],[3.8,36],[3.3,48],[3.0,72],[2.8,94],[2.6,100],[2.0,103.5],[1.1,105.3],[0,105.8]].map(function(q){return new T.Vector2(q[0],q[1])}),36);
  var ANT={};
  function antenna(s,tilt,yaw){
    var a=new T.Group();a.position.set(0,s*46.4,36);if(s<0)a.rotation.z=Math.PI;g.add(a);
    cyl(3.5,3.5,2.2,M.gold,0,1.1,0,6,a);cyl(2.7,2.7,3.6,M.gold,0,3.6,0,20,a);             /* SMA do gateway */
    cyl(3.6,3.6,6.4,M.knurl,0,8,0,18,a);cyl(3.2,3.6,1,M.rubberD,0,11.6,0,24,a);            /* porca recartilhada */
    var sw=new T.Group();sw.position.y=12;sw.rotation.y=yaw;a.add(sw);
    cyl(3.9,3.9,10,M.rubber,0,5,0,28,sw);
    [2.2,4.4,6.6].forEach(function(y){cyl(4.02,4.02,0.5,M.rubberD,0,y,0,28,sw)});          /* anéis do corpo */
    [-3.05,3.05].forEach(function(x){                                                       /* garfo da dobradiça */
      box(2.1,8,7.4,M.rubber,x,13.6,0,sw);var c=cyl(3.7,3.7,2.1,M.rubber,x,17.6,0,24,sw);c.rotation.z=Math.PI/2});
    var pin=cyl(1.25,1.25,8.5,M.steel,0,17.6,0,16,sw);pin.rotation.z=Math.PI/2;
    var arm=new T.Group();arm.position.y=17.6;arm.rotation.x=tilt;sw.add(arm);
    var kn=cyl(3.6,3.6,3.9,M.rubber,0,0,0,24,arm);kn.rotation.z=Math.PI/2;
    var whip=new T.Mesh(WHIP,M.rubber);whip.position.y=1.2;arm.add(whip);
    cyl(4.56,4.56,0.7,M.rubberD,0,30.6,0,28,arm);
    var mark=new T.Object3D();mark.position.set(0,64,0);arm.add(mark);
    ANT[s>0?'top':'bottom']={arm:arm,mark:mark};
  }
  /* de cima: antena celular; de baixo: antena Wi-Fi externa. A celular fica para cima e dobra para a frente quando a câmera vai aos bornes de cima; a Wi-Fi aponta para a frente */
  antenna(1,0.14,0);antenna(-1,1.45,0);


  /* ---------- API usada pelo player ---------- */
  ANT.top.arm.rotation.x=1.2;   /* na vista dos bornes de cima a antena celular fica dobrada para a frente */
  scene.updateMatrixWorld(true);
  var wires={}, wireG=new T.Group(), GA_N=new T.Vector3(0,Math.cos(GA),Math.sin(GA));g.add(wireG);
  function mkWire(n,col){
    var t=term[n], s=t.s, grp=new T.Group(), fan=t.x/PITCH*0.7, P=new T.Vector3(t.x,t.y,t.z), N=t.n;
    var cu=new T.CatmullRomCurve3([P.clone().addScaledVector(N,2.2),P.clone().addScaledVector(N,20),
      new T.Vector3(t.x+fan*2.5,s*98,t.z-21),new T.Vector3(t.x+fan*6,s*150,t.z-34),new T.Vector3(t.x+fan*8,s*230,t.z-50)]);
    grp.add(new T.Mesh(new T.TubeGeometry(cu,56,1.45,12),mat(new T.Color(col).getHex(),{roughness:0.5})));
    var tip=new T.Mesh(new T.CylinderGeometry(0.75,0.75,7,10),M.copper);tip.position.copy(P).addScaledVector(N,-0.6);
    tip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),N);grp.add(tip);
    wireG.add(grp);return {grp:grp,n:N,col:col};
  }
  /* chave de fenda: ponta na origem, cabo ao longo de +y */
  var drv=new T.Group(), spin=new T.Group();drv.add(spin);drv.visible=false;scene.add(drv);
  (function(){
    function c(rt,rb,h,m,y){var o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,20),m);o.position.y=y+h/2;spin.add(o)}
    c(0.5,1.1,3,M.steel,0);c(1.1,1.1,34,M.steel,3);c(4.4,3.4,6,mat(0xe8c21c,{roughness:0.5}),37);
    c(4.4,4.4,22,mat(0xe8c21c,{roughness:0.5}),43);c(4.5,4.5,4,M.dark,50);
    var flat=new T.Mesh(new T.BoxGeometry(2.6,0.5,0.45),M.steel);flat.position.y=0.2;spin.add(flat);
  })();
  var view={x:0,y:53,z:7,r:108,th:0.5,ph:0.42}, lw=0, lh=0, P0=new T.Vector3();
  function place(){var sp=Math.sin(view.ph);camera.position.set(view.x+view.r*sp*Math.sin(view.th),view.y+view.r*Math.cos(view.ph),view.z+view.r*sp*Math.cos(view.th));camera.lookAt(view.x,view.y,view.z)}
  place();
  return {
    wire:function(n,col,p){
      var w=wires[n];if(!w||w.col!==col){if(w)wireG.remove(w.grp);w=wires[n]=mkWire(n,col)}
      w.grp.visible=p>0.001;var e=p<0?0:p>1?1:p;e=e*e*(3-2*e);w.grp.position.copy(w.n).multiplyScalar((1-e)*36);
    },
    screw:function(n,deg){if(term[n])term[n].screw.rotation.y=-deg*Math.PI/180},
    driver:function(n,amount,deg){
      if(!n||!term[n]||amount<=0.02){drv.visible=false;return}
      var t=term[n], N=new T.Vector3(0,t.s*GA_N.y,GA_N.z);
      t.screw.getWorldPosition(P0);drv.position.copy(P0).addScaledVector(N,0.3+(1-amount)*26);
      drv.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),N);spin.rotation.y=-deg*Math.PI/180;drv.visible=true;
    },
    reset:function(){Object.keys(wires).forEach(function(k){wireG.remove(wires[k].grp)});wires={};
      Object.keys(term).forEach(function(k){term[k].screw.rotation.y=0});drv.visible=false},
    draw:function(){
      var w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
      if(w!==lw||h!==lh){lw=w;lh=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
      renderer.render(scene,camera);
    }
  };
}
window.IGATE3D={create:function(canvas,opts){try{return create(canvas,opts)}catch(e){if(window.console)console.error(e);return null}}};
})();
