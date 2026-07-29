"use strict";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const CONFIG = {

    EVENT_NAME: "XV Sara Sofía",

    API_URL:
        "https://script.google.com/macros/s/AKfycbyWUk6Tt_gffF5whQzWnKrgxchUoVp8Poe_onVhB1t6EqPR4NSDgjICQB5X0REa2uYw/exec",

    GOOGLE_FORM_URL:
        "https://forms.gle/udcQ727vQbSTaZUYA",

    AUTO_REFRESH: true,

    REFRESH_DELAY: 2500,

    TOAST_DURATION: 4000

};

/* ==========================================================
   BIBLIOTECA DE RECUERDOS
   XV Sara Sofía
========================================================== */

class GalleryApp {

    constructor(){

        /*==================================
        Configuración
        ==================================*/

        this.googleFormURL=
            CONFIG.GOOGLE_FORM_URL;

        this.albumURL=
            CONFIG.GOOGLE_PHOTOS_URL;

        /*==================================
        Estado
        ==================================*/

        this.images=[];

        this.currentIndex=0;

        /*==================================
        Inicialización
        ==================================*/

        this.cacheDOM();

        this.bindEvents();

        this.loadGallery();

    }

    /*==================================
    Cache DOM
    ==================================*/

    cacheDOM(){
        this.photoAuthor=

            document.getElementById("photoAuthor");

        this.photoDate=

            document.getElementById("photoDate");

        this.photoCounter=

            document.getElementById("photoCounter");

        this.btnUpload=

            document.getElementById("btnUpload");

        this.btnAlbum=

            document.getElementById("btnAlbum");

        this.btnAlbumCompleto=

            document.getElementById("btnAlbumCompleto");

        this.gallery=

            document.getElementById("galleryGrid");

        this.modal=

            document.getElementById("uploadModal");

        this.closeModalButton=

            document.getElementById("closeModal");

        this.continueButton=

            document.getElementById("continueButton");

        this.lightbox=

            document.getElementById("lightbox");

        this.lightboxImage=

            document.getElementById("lightboxImage");

        this.closeLightbox=

            document.getElementById("closeLightbox");

        this.prevPhoto=

            document.getElementById("prevPhoto");

        this.nextPhoto=

            document.getElementById("nextPhoto");

    }

    /*==================================
    Eventos
    ==================================*/

    bindEvents(){

        this.btnUpload.addEventListener(

            "click",

            ()=>this.openModal()

        );

        this.closeModalButton.addEventListener(

            "click",

            ()=>this.closeModal()

        );

        this.continueButton.addEventListener(

            "click",

            ()=>this.openGoogleForm()

        );

        this.closeLightbox.addEventListener(

            "click",

            ()=>this.closeViewer()

        );

        this.prevPhoto.addEventListener(

            "click",

            ()=>this.previousImage()

        );

        this.nextPhoto.addEventListener(

            "click",

            ()=>this.nextImage()

        );

        window.addEventListener(

            "focus",

            ()=>this.onReturnFromForm()

        );

    }

    /*==================================
    Abrir Modal
    ==================================*/

    openModal(){

        this.modal.classList.remove("hidden");

        document.body.style.overflow="hidden";

    }

    /*==================================
    Cerrar Modal
    ==================================*/

    closeModal(){

        this.modal.classList.add("hidden");

        document.body.style.overflow="";

    }

    /*==================================
    Abrir Formulario
    ==================================*/

    openGoogleForm(){

        this.closeModal();

        window.open(

            this.googleFormURL,

            "_blank"

        );

    }

    /*==================================
    Cuando el usuario vuelve
    ==================================*/

    onReturnFromForm(){

        if(!CONFIG.AUTO_REFRESH){

            return;

        }

        this.showToast(

            "✨ Actualizando la galería..."

        );

        setTimeout(()=>{

            this.loadGallery();

        },CONFIG.REFRESH_DELAY);

    }

    /*==================================
    Notificaciones
    ==================================*/

    showToast(message){

        let toast=document.getElementById("toast");

        if(!toast){

            toast=document.createElement("div");

            toast.id="toast";

            document.body.appendChild(toast);

        }

        toast.textContent=message;

        toast.classList.add("show");

        clearTimeout(this.toastTimer);

        this.toastTimer=setTimeout(()=>{

            toast.classList.remove("show");

        },CONFIG.TOAST_DURATION);

    }

    /*==================================
    Cargar galería
    ==================================*/

    async loadGallery(){

        try{

            const response = await fetch(CONFIG.API_URL);

            if(!response.ok){

                throw new Error(
                    "No fue posible cargar la galería."
                );

            }

            const data = await response.json();

            this.images = data.gallery;

            this.renderGallery();

        }
        catch(error){

            console.error(error);

            this.showToast(

                "No fue posible cargar las fotografías."

            );

        }

    }

    /*==================================
    Renderizar galería
    ==================================*/

    renderGallery(){

        this.gallery.innerHTML="";

        if(this.images.length===0){

            this.gallery.innerHTML=

                `

            <div class="empty-gallery">

                <h3>

                    Aún no hay recuerdos compartidos.

                </h3>

                <p>

                    Sé el primero en subir una fotografía.

                </p>

            </div>

        `;

            return;

        }

        this.images.forEach((photo,index)=>{

            const card=document.createElement("article");

            card.className="gallery-card";

            card.innerHTML=`

            <img

                loading="lazy"

                src="${photo.image}"

                alt="${photo.author}"

            >

        `;

            card.addEventListener(

                "click",

                ()=>this.openLightbox(index)

            );

            this.gallery.appendChild(card);

        });

    }

    /*==================================
    Abrir Lightbox
    ==================================*/

    openLightbox(index){

        this.currentIndex=index;

        this.updateLightbox();

        this.lightbox.classList.remove("hidden");

        document.body.style.overflow="hidden";

    }

    /*==================================
    Actualizar visor
    ==================================*/

    updateLightbox(){

        const photo=

            this.images[this.currentIndex];

        this.lightboxImage.src=

            photo.image;

        this.photoAuthor.textContent=

            photo.author;

        this.photoDate.textContent=

            photo.date;

        this.photoCounter.textContent=

            `${this.currentIndex+1} / ${this.images.length}`;

    }

    /*==================================
    Cerrar visor
    ==================================*/

    closeViewer(){

        this.lightbox.classList.add("hidden");

        document.body.style.overflow="";

    }

    /*==================================
    Siguiente fotografía
    ==================================*/

    nextImage(){

        this.currentIndex++;

        if(this.currentIndex>=this.images.length){

            this.currentIndex=0;

        }

        this.updateLightbox();

    }

    /*==================================
    Fotografía anterior
    ==================================*/

    previousImage(){

        this.currentIndex--;

        if(this.currentIndex<0){

            this.currentIndex=

                this.images.length-1;

        }

        this.updateLightbox();

    }
}

/*==========================================================
Inicialización
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>new GalleryApp()

);