// Cursor — len na zariadeniach s myšou
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring')
  let cx=innerWidth/2,cy=innerHeight/2,rx=cx,ry=cy
  document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY})
  ;(function animCur(){rx+=(cx-rx)*.16;ry+=(cy-ry)*.16;cur.style.left=cx+'px';cur.style.top=cy+'px';ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animCur)})()
}

// Scroll reveal
const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');obs.unobserve(x.target)}})},{threshold:.1})
document.querySelectorAll('.r').forEach(el=>obs.observe(el))

// Hero – fluid metaball wave background
;(()=>{
  const canvas=document.getElementById('heroCanvas')
  const gl=canvas.getContext('webgl')
  if(!gl) return

  const hero=document.getElementById('hero')
  let W,H,mouse={x:.5,y:.5},tmouse={x:.5,y:.5},t=0

  function resize(){
    W=canvas.width=hero.offsetWidth
    H=canvas.height=hero.offsetHeight
    gl.viewport(0,0,W,H)
  }
  resize(); window.addEventListener('resize',resize)

  hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect()
    tmouse.x=(e.clientX-r.left)/r.width
    tmouse.y=1-(e.clientY-r.top)/r.height
  })

  const vert=`
    attribute vec2 a;
    void main(){gl_Position=vec4(a,0,1);}
  `

  const frag=`
    precision highp float;
    uniform vec2 u_res;
    uniform vec2 u_mouse;
    uniform float u_t;

    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.-2.*f);
      float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1));
      return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.,a=.5;
      for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.3,2.1);a*=.5;}
      return v;
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/u_res;
      vec2 m=u_mouse;

      // distort uv with flowing fbm
      float spd=u_t*.07;
      vec2 q=vec2(fbm(uv+vec2(spd*.6,spd*.4)),fbm(uv+vec2(spd*.3,spd*.7)));
      vec2 r2=vec2(fbm(uv+2.2*q+vec2(1.7,9.2)+spd*.25),fbm(uv+2.2*q+vec2(8.3,2.8)+spd*.2));

      // cursor pulls the flow
      vec2 d=uv-m;
      float pull=exp(-dot(d,d)*3.)*0.22;
      r2+=pull*(m-uv)*1.5;

      float f=fbm(uv+2.*r2+spd*.1);

      // color bands — dark teal to bg
      vec3 c1=vec3(0.0,0.55,0.52);   // teal highlight
      vec3 c2=vec3(0.0,0.22,0.25);   // deep teal
      vec3 c3=vec3(0.09,0.09,0.12);  // near bg
      vec3 col=mix(c3,c2,clamp(f*1.8,0.,1.));
      col=mix(col,c1,clamp((f-.45)*2.2,0.,1.));

      // subtle cursor glow
      float cglow=exp(-dot(d,d)*6.)*0.12;
      col+=vec3(0.,cglow*1.4,cglow*1.3);

      // vignette
      float vig=1.-dot(uv-.5,uv-.5)*1.4;
      col*=clamp(vig,0.,1.);

      gl_FragColor=vec4(col,1.);
    }
  `

  function shader(type,src){
    const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s
  }
  const prog=gl.createProgram()
  gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert))
  gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag))
  gl.linkProgram(prog); gl.useProgram(prog)

  const buf=gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,buf)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
  const a=gl.getAttribLocation(prog,'a')
  gl.enableVertexAttribArray(a)
  gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)

  const uRes=gl.getUniformLocation(prog,'u_res')
  const uMouse=gl.getUniformLocation(prog,'u_mouse')
  const uT=gl.getUniformLocation(prog,'u_t')

  ;(function frame(){
    mouse.x+=(tmouse.x-mouse.x)*.055
    mouse.y+=(tmouse.y-mouse.y)*.055
    t+=.016
    gl.uniform2f(uRes,W,H)
    gl.uniform2f(uMouse,mouse.x,mouse.y)
    gl.uniform1f(uT,t)
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
    requestAnimationFrame(frame)
  })()
})()

// Work glow
document.querySelectorAll('.work').forEach(w=>{const g=w.querySelector('.work-glow');w.addEventListener('mousemove',e=>{const r=w.getBoundingClientRect();g.style.left=(e.clientX-r.left)+'px';g.style.top=(e.clientY-r.top)+'px'})})

// Lens bubble
function makeLens(w,h,br,filter){
  const l=document.createElement('div')
  l.style.cssText=`position:absolute;width:${w};height:${h};border-radius:${br};pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);opacity:0;transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .35s ease;backdrop-filter:${filter} blur(1.5px) brightness(1.2) saturate(140%);-webkit-backdrop-filter:${filter} blur(1.5px) brightness(1.2) saturate(140%);background:radial-gradient(circle at 36% 28%,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 18%,rgba(255,255,255,0.04) 38%,transparent 55%),radial-gradient(circle at 66% 72%,rgba(255,255,255,0.15) 0%,transparent 45%);`
  const inner=document.createElement('div')
  inner.style.cssText=`position:absolute;inset:12%;border-radius:inherit;box-shadow:inset 0 0 0 0.75px rgba(255,255,255,0.22)`
  l.appendChild(inner);return l
}
function bindLens(el,lens,moveY){
  let lx=0,ly=0,tlx=0,tly=0,raf=null,inside=false
  function tick(){lx+=(tlx-lx)*.1;ly+=(tly-ly)*.1;lens.style.left=lx+'px';lens.style.top=ly+'px';if(inside)raf=requestAnimationFrame(tick)}
  el.addEventListener('mouseenter',e=>{inside=true;const r=el.getBoundingClientRect();lx=e.clientX-r.left;ly=moveY?e.clientY-r.top:r.height/2;tlx=lx;tly=ly;lens.style.opacity='1';lens.style.transform='translate(-50%,-50%) scale(1)';raf=requestAnimationFrame(tick)})
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();tlx=e.clientX-r.left;if(moveY)tly=e.clientY-r.top})
  el.addEventListener('mouseleave',()=>{inside=false;cancelAnimationFrame(raf);lens.style.opacity='0';lens.style.transform='translate(-50%,-50%) scale(0.1)'})
}

// Nav links — pill lens
document.querySelectorAll('.nav-links a').forEach(el=>{
  el.style.position='relative';el.style.overflow='hidden'
  const navH=el.closest('ul').getBoundingClientRect().height
  const elW=el.getBoundingClientRect().width+navH*.5
  const lens=makeLens(elW+'px',navH+'px','50px','url(#glass-lens-pill)')
  lens.style.transform='translate(-50%,-50%) scale(0)'
  el.appendChild(lens)
  bindLens(el,lens,false)
})

// Nav CTA — circle lens
;(()=>{
  const el=document.querySelector('.nav-cta')
  el.style.position='relative';el.style.overflow='hidden'
  const r=el.getBoundingClientRect()
  const sz=Math.max(Math.min(r.width,r.height)*1.1,70)
  const lens=makeLens(sz+'px',sz+'px','50%','url(#glass-lens)')
  el.appendChild(lens)
  bindLens(el,lens,true)
})()

// Nav links pill tilt
;(()=>{
  const pill=document.querySelector('.nav-links')
  if(!pill) return
  pill.style.transition='box-shadow .25s'
  let raf=null
  pill.addEventListener('mousemove',e=>{
    if(raf) cancelAnimationFrame(raf)
    raf=requestAnimationFrame(()=>{
      const r=pill.getBoundingClientRect()
      const x=(e.clientX-r.left)/r.width
      const y=(e.clientY-r.top)/r.height
      const rx=(y-.5)*8
      const ry=(x-.5)*-8
      pill.style.transform=`perspective(400px) rotateX(${rx}deg) rotateY(${ry}deg)`
    })
  })
  pill.addEventListener('mouseleave',()=>{
    if(raf) cancelAnimationFrame(raf)
    pill.style.transition='box-shadow .25s, transform .4s cubic-bezier(.22,1,.36,1)'
    pill.style.transform='perspective(400px) rotateX(0deg) rotateY(0deg)'
    pill.addEventListener('transitionend',()=>{
      pill.style.transition='box-shadow .25s'
    },{once:true})
  })
})()

// Contact glass tilt + sheen
;(()=>{
  const card=document.querySelector('.contact-glass')
  const sheen=card.querySelector('.contact-glass-sheen')
  card.style.transition='box-shadow .25s'
  let tx=0,ty=0,cx=0,cy=0,mx=0.5,my=0.5,raf=null,inside=false
  const ease=0.04 // 0=žiadne sledovanie, 1=okamžité

  function loop(){
    cx+=(tx-cx)*ease
    cy+=(ty-cy)*ease
    const rx=cy*8
    const ry=cx*-8
    card.style.transform=`perspective(600px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(1.02)`
    sheen.style.setProperty('--sx',((mx*100)).toFixed(1)+'%')
    sheen.style.setProperty('--sy',((my*100)).toFixed(1)+'%')
    const gx=mx*100,gy=my*100
    card.style.background=`linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.012)),radial-gradient(circle at ${gx}% ${gy}%,rgba(255,255,255,0.06) 0%,transparent 55%)`
    if(inside) raf=requestAnimationFrame(loop)
  }

  card.addEventListener('mouseenter',()=>{
    inside=true
    card.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.18),0 24px 60px rgba(0,0,0,0.45),0 0 0 1px rgba(0,229,200,0.06)'
    sheen.style.opacity='1'
    raf=requestAnimationFrame(loop)
  })
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect()
    mx=(e.clientX-r.left)/r.width
    my=(e.clientY-r.top)/r.height
    tx=mx-.5
    ty=my-.5
  })
  card.addEventListener('mouseleave',()=>{
    inside=false
    cancelAnimationFrame(raf)
    tx=0;ty=0;cx=0;cy=0
    card.style.transition='box-shadow .25s, transform .5s cubic-bezier(.22,1,.36,1)'
    card.style.transform='perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)'
    card.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.14),0 8px 40px rgba(0,0,0,0.3)'
    card.style.background=''
    sheen.style.opacity='0'
    card.addEventListener('transitionend',()=>{
      card.style.transition='box-shadow .25s'
    },{once:true})
  })
})()
// Lightbox galería
;(()=>{
  const galleries={
    tomax:['images/mockup1.jpg','images/mockup2.jpg']
  }
  const lb=document.getElementById('lightbox')
  const img=document.getElementById('lb-img')
  const counter=document.getElementById('lb-counter')
  let current=0,photos=[]

  function open(gallery,index){
    photos=galleries[gallery]||[]
    if(!photos.length) return
    current=index||0
    show()
    lb.classList.add('open')
    lb.setAttribute('aria-hidden','false')
    document.body.style.overflow='hidden'
  }
  function close(){
    lb.classList.remove('open')
    lb.setAttribute('aria-hidden','true')
    document.body.style.overflow=''
  }
  function show(){
    img.style.opacity='0'
    img.style.transform='scale(.95)'
    setTimeout(()=>{
      img.src=photos[current]
      img.onload=()=>{img.style.opacity='1';img.style.transform='scale(1)'}
      counter.textContent=(current+1)+' / '+photos.length
      document.getElementById('lb-prev').style.display=photos.length<2?'none':'flex'
      document.getElementById('lb-next').style.display=photos.length<2?'none':'flex'
    },80)
  }
  function prev(){current=(current-1+photos.length)%photos.length;show()}
  function next(){current=(current+1)%photos.length;show()}

  document.querySelectorAll('.work-has-gallery').forEach(el=>{
    el.addEventListener('click',()=>open(el.dataset.gallery,0))
  })
  document.getElementById('lb-close').addEventListener('click',close)
  document.getElementById('lb-prev').addEventListener('click',e=>{e.stopPropagation();prev()})
  document.getElementById('lb-next').addEventListener('click',e=>{e.stopPropagation();next()})
  lb.addEventListener('click',e=>{if(e.target===lb||e.target===document.getElementById('lb-img-wrap'))close()})
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open')) return
    if(e.key==='Escape') close()
    if(e.key==='ArrowLeft') prev()
    if(e.key==='ArrowRight') next()
  })
})()

document.getElementById('submitBtn').addEventListener('click',()=>{const b=document.getElementById('submitBtn');b.textContent='Odoslane \u2713';b.style.opacity='.75';setTimeout(()=>{b.textContent='Odosla\u0165 spr\u00e1vu \u2192';b.style.opacity='1'},3000)})