
document.addEventListener('DOMContentLoaded', () => {

    const envelope = document.getElementById('envelope-trigger');
    const overlay = document.getElementById('welcome-overlay');
    const main = document.getElementById('main-content');
    const musicBtn = document.getElementById('music-control');
    const music = document.getElementById('bg-music');

	const welcomeElements =	document.querySelector('.welcome-elements');

	envelope.addEventListener('click', () => {
		/* OCULTAR TODO */
		welcomeElements.classList.add('hide');
		navigator.vibrate?.(40);
		music.play().catch(() => {});
		/* MOSTRAR CONTENIDO */
		setTimeout(() => {
			overlay.style.opacity = '0';
			main.classList.remove('is-hidden');
			setTimeout(() => {
				main.classList.add('show-content');
			}, 100);
			musicBtn.classList.remove('is-hidden');
		}, 200);
		/* ELIMINAR OVERLAY */
		setTimeout(() => {
			overlay.remove();
		}, 2500);
	});

    let playing = true;

    musicBtn.addEventListener('click', () => {
        if(playing){
            music.pause();
            musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }else{
            music.play();
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
        }
        playing = !playing;
    });

    const eventDate = new Date("Aug 29, 2026 19:00:00").getTime();

    function updateCountdown(){
        const now = new Date().getTime();
        const diff = eventDate - now;
        if(diff > 0){
            document.getElementById('days').innerText =
            Math.floor(diff / (1000*60*60*24));
            document.getElementById('hours').innerText =
            Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
            document.getElementById('minutes').innerText =
            Math.floor((diff % (1000*60*60)) / (1000*60));
        } else {
            clearInterval(countdownTimer);
            document.querySelector('.countdown-grid').innerHTML = "<span class='title-font shimmer'>¡El momento ha llegado!</span>";
        }
    }

    updateCountdown(); // Llamada inicial
    const countdownTimer = setInterval(updateCountdown, 1000);

    const observer = new IntersectionObserver((entries)=>{
		entries.forEach(entry=>{
			if(entry.isIntersecting){
				entry.target.classList.add('visible');
				observer.unobserve(entry.target);
			}
		});
	});

    document.querySelectorAll('.fade-in')
    .forEach(el => observer.observe(el));

/* ======================================================
   OCULTAR FLECHA AL HACER SCROLL
====================================================== */

const scrollIndicator =
document.getElementById('scroll-indicator');

window.addEventListener('scroll', () => {

    if(window.scrollY > 80){

        scrollIndicator.classList.add('hide');

    }else{

        scrollIndicator.classList.remove('hide');
    }

});


/* ======================================================
   PETALOS
====================================================== */

const petalsContainer =
document.querySelector('.petals-container');

function createPetal(){

    const petal =
    document.createElement('div');

    petal.classList.add('petal');

    petal.style.left =
    Math.random() * window.innerWidth + 'px';

    petal.style.animationDuration =
    (7 + Math.random() * 6) + 's';

    petal.style.opacity =
    0.4 + Math.random();

    petal.style.transform =
    `scale(${0.5 + Math.random()})`;

    petal.style.rotate =
    Math.random() * 360 + 'deg';

    const size = 18 + Math.random() * 24;

    petal.style.width = size + 'px';
    petal.style.height = size + 'px';

    petalsContainer.appendChild(petal);

    setTimeout(() => {

        petal.remove();

    }, 14000);

}

setInterval(createPetal, 350);

    // --- Lógica RSVP con URL y Botones Directos (Nueva) ---

    // Obtener parámetros de la URL	
	const urlParams = new URLSearchParams(window.location.search);
	let guestName = null;
	let guestCount = null;
	const exp = urlParams.get('id');
			console.log(exp);
	if(exp){
			console.log(exp);
		try{
			str = exp.replace(/-/g, '+').replace(/_/g, '/');
			console.log(str);
			while(str.length % 4){
				str += '=';
			}
			console.log(str);
			const datos = JSON.parse(atob(str));
			console.log(datos);

			guestName = datos.i;
			guestCount = parseInt(datos.c);
		}catch(error){
			console.error(
				"Error al decodificar invitación",
				error
			);
		}
	}
	
	
    const guestText = document.getElementById('rsvp-guest-text');
	const guestBadge = document.getElementById('guest-badge');
	const guestCountText = document.getElementById('guest-count-text');

    // Personalizar texto si hay nombre
    if (guestName) {
        guestText.innerText = `${guestName}`;
    }
	
	//CANTIDAD DE PERSONAS
	if(guestCount){
		guestBadge.classList.remove('is-hidden');
		guestCountText.innerText = `Invitación válida para ${guestCount} persona${guestCount > 1 ? 's' : ''}`;
	}

    // Botones directos
    const btnNo = document.getElementById('rsvp-no');
    const btnYes = document.getElementById('rsvp-yes');
    const responseMessage = document.getElementById('rsvp-response-message');
    const rsvpButtonsContainer = document.querySelector('.rsvp-buttons');

    // Endpoint Local o Apps Script (Actualízalo cuando desployes el backend)
    const SCRIPT_URL = 'URL_DE_TU_APPS_SCRIPT'; 

    const enviarRSVP = (asistencia) => {
        // Deshabilitar botones
        btnNo.disabled = true;
        btnNo.innerText = 'No...';
        btnYes.disabled = true;
        btnYes.innerText = 'Sí...';

        // Obtener el nombre. Si no hay nombre en la URL, usar 'Invitado'
        const name = guestName ? guestName : 'Invitado';

        // Datos a enviar
        const data = { nombre: name, asistencia: asistencia };

        fetch(SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(() => {
            // Ocultar botones y mostrar mensaje de éxito directamente en la sección
            rsvpButtonsContainer.classList.add('is-hidden');
            responseMessage.innerText = `¡Gracias por tu respuesta!`;
            responseMessage.classList.remove('is-hidden');
        })
        .catch(err => {
            console.error('Error de red al enviar RSVP:', err);
            alert('Error de conexión local. Verifica tu endpoint o conexión a internet.');
            // Reabilitar botones
            btnNo.disabled = false;
            btnNo.innerText = 'No podré asistir';
            btnYes.disabled = false;
            btnYes.innerText = 'Seguro, allí estaré';
        });
    };

    // Eventos de clic
    btnNo.addEventListener('click', () => enviarRSVP('No podré asistir'));
    btnYes.addEventListener('click', () => enviarRSVP('Seguro, allí estaré'));
});

