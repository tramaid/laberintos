/* comun.js — lo que comparten todas las paginas: el menu de telefono, la
   puerta de edad y los reveals. Se carga ANTES del script de cada pagina, que
   usa menuAbierto(), cerrarMenu() y puertaAbierta() de aca.
   OJO: los scripts clasicos comparten el mismo alcance global, asi que aca no
   se puede declarar nada que la pagina tambien declare (por eso movReducido y
   no R, que es el de index.html). */
const movReducido=matchMedia('(prefers-reduced-motion: reduce)');

/* Menu de telefono. Abajo de 900px los links de la barra no entran y el panel
   los muestra a pantalla completa. El panel es el MISMO <nav>, asi que el
   listener de scroll suave de aca abajo ya los toma con el selector que ya
   tenia: solo hay que cerrarle el menu antes de navegar. */
const botonMenu=document.getElementById('menu-boton');
const menuAbierto=()=>document.body.classList.contains('menu-abierto');
function cerrarMenu(devolverFoco){
  if(!menuAbierto()) return;
  document.body.classList.remove('menu-abierto');
  botonMenu.setAttribute('aria-expanded','false');
  botonMenu.textContent='Menú';
  /* al cerrar con Escape el foco tiene que volver al boton: si no queda en un
     link del panel, que en ese mismo instante pasa a display:none, y se pierde
     al principio del documento. */
  if(devolverFoco) botonMenu.focus();
}
botonMenu.addEventListener('click',()=>{
  if(menuAbierto()) return cerrarMenu(false);
  document.body.classList.add('menu-abierto');
  botonMenu.setAttribute('aria-expanded','true');
  botonMenu.textContent='Cerrar';
});
addEventListener('keydown',e=>{ if(e.key==='Escape') cerrarMenu(true); });

/* La barra se esconde al bajar y vuelve al subir. Arriba de todo siempre se ve.
   Los 6px de margen evitan que el temblor de un trackpad la haga titilar. */
const barra=document.querySelector('.nav');
let ultimoY=scrollY;
addEventListener('scroll',()=>{
  const y=scrollY, d=y-ultimoY;
  if(Math.abs(d)<6) return;
  barra.classList.toggle('is-oculta', d>0 && y>120);
  ultimoY=y;
},{passive:true});

const puertaAbierta=()=>document.documentElement.classList.contains('edad');

/* PUERTA DE EDAD. La clase .edad la pone el script del <head>; aca se maneja el
   formulario. Mientras esta abierta, el resto de la pagina va inert: ni el Tab
   ni un lector de pantalla pueden llegar detras. */
const puerta=document.getElementById('puerta');
if(puerta && puertaAbierta()){
  const form=document.getElementById('puerta-form'), error=document.getElementById('puerta-error');
  const campos=[...form.querySelectorAll('input')];
  const resto=[...document.body.children].filter(e=>e!==puerta);
  resto.forEach(e=>{ e.inert=true; });
  /* "el sistema generara un bloqueo automatico" (4.6.2.2): un menor queda
     bloqueado por la sesion, sin volver a ver el formulario */
  const bloquear=()=>{ puerta.classList.add('is-menor'); error.textContent='Este sitio es solo para mayores de 18 años.'; };
  let menor=false;
  try{ menor=sessionStorage.getItem('laberintos-edad')==='menor'; }catch(e){}
  if(menor) bloquear(); else campos[0].focus();

  /* solo digitos, y al completar un campo pasa al siguiente */
  campos.forEach((c,i)=>c.addEventListener('input',()=>{
    c.value=c.value.replace(/\D/g,'');
    if(c.value.length===c.maxLength && campos[i+1]) campos[i+1].focus();
  }));

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const [d,m,a]=campos.map(c=>+c.value), hoy=new Date(), f=new Date(a,m-1,d);
    /* new Date corre las fechas imposibles (31/02 da 3/03): si no vuelve igual, no existe */
    if(a<1900 || f.getFullYear()!==a || f.getMonth()!==m-1 || f.getDate()!==d || f>hoy){
      error.textContent='Revisá la fecha: día, mes y año.';
      return;
    }
    const cumplio=hoy.getMonth()>m-1 || (hoy.getMonth()===m-1 && hoy.getDate()>=d);
    if(hoy.getFullYear()-a-(cumplio?0:1)<18){
      try{ sessionStorage.setItem('laberintos-edad','menor'); }catch(e){}
      return bloquear();
    }
    try{ localStorage.setItem('laberintos-edad','18'); }catch(e){}
    resto.forEach(e=>{ e.inert=false; });
    const html=document.documentElement;
    const abrir=()=>{
      html.classList.remove('edad','edad-sale');
      /* el foco va al primer destino de la pagina ("Entrar" en la portada, el
         titulo en donde/ y en contacto/): si no, se pierde con el boton que
         desaparece */
      const destino=document.querySelector("[data-foco-inicial]");
      if(destino) destino.focus({preventScroll:true});
    };
    if(movReducido.matches) return abrir();
    html.classList.add('edad-sale');
    puerta.addEventListener('transitionend',abrir,{once:true});
    setTimeout(abrir,700);   // por si transitionend no llega
  });
}

const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  const g=[...e.target.parentElement.querySelectorAll('[data-reveal]')];
  const i=g.indexOf(e.target); if(i>0) e.target.style.setProperty('--d',i*90+'ms');
  e.target.classList.add('is-in'); io.unobserve(e.target);
}),{threshold:.15,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('[data-reveal]').forEach(e=>io.observe(e));
