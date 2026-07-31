"use strict";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const CONFIG = {

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

        /*==================================
        Estado
        ==================================*/

        this.images=[];

        this.currentIndex=0;

        /*==================================
        Inicialización
        ==================================*/

        this.init();

    }

    /*==================================
    Inicialización
    ==================================*/

    async init(){

        this.cacheDOM();

        this.bindEvents();

        await this.loadGallery();

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

        this.lightboxMedia=

            document.getElementById("lightboxMedia");

        this.closeLightbox=

            document.getElementById("closeLightbox");

        this.prevPhoto=

            document.getElementById("prevPhoto");

        this.nextPhoto=

            document.getElementById("nextPhoto");

        this.galleryStatsContainer =

            document.getElementById("galleryStats");

        this.galleryUpdate =

            document.getElementById("galleryUpdate");

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
        this.showSkeleton();
        try{

            const response = await fetch(CONFIG.API_URL);

            if(!response.ok){

                throw new Error(
                    "No fue posible cargar la galería."
                );

            }

            const data = await response.json();

            this.parseGalleryData(data);

        }
        catch(error){

            console.error(error);

            this.showToast(

                "No fue posible cargar las fotografías."

            );

        }

    }

    /*==================================
    Procesar respuesta de la API
    ==================================*/

    parseGalleryData(data){

        this.images=data.gallery||[];

        this.galleryStatsData=data.stats||{};

        this.galleryUpdateData=data.event||{};

        this.renderStats();

        this.renderGallery();

    }

    /*==================================
    Renderizar estadísticas
    ==================================*/

    renderStats(){

        if(!this.galleryStats){

            return;

        }

        const stats=this.galleryStatsData;

        if(!stats){

            return;

        }

        this.galleryStats.innerHTML=`

        💜 <strong>${stats.totalItems}</strong> recuerdos compartidos

        <br>

        📸 ${stats.totalImages} fotografías

        •

        🎥 ${stats.totalVideos} videos

    `;

        if(this.galleryUpdateData?.generatedAt){

            this.galleryUpdate.textContent=

                `Actualizado el ${this.formatDateTime(

                    this.galleryUpdateData.generatedAt

                )}`;

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

        this.images.forEach((item,index)=>{

            const card=document.createElement("article");

            card.className="gallery-card";

            card.style.opacity="0";

            card.style.transform="translateY(10px)";

            card.innerHTML=`

        <img

            loading="lazy"

            src="${item.thumbnail}"

            alt="${item.name}"

        >

        ${item.type==="video"

                ?'<div class="video-badge">▶</div>'

                :''}

    `;

            card.addEventListener(

                "click",

                ()=>this.openLightbox(index)

            );

            this.gallery.appendChild(card);

            requestAnimationFrame(()=>{

                card.style.transition="opacity .35s ease, transform .35s ease";

                card.style.opacity="1";

                card.style.transform="translateY(0)";

            });
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

        const item=this.images[this.currentIndex];

        this.renderViewer(item);

        this.photoAuthor.textContent=

            item.name;

        this.photoDate.textContent=

            this.formatDate(item.updated);

        this.photoCounter.textContent=

            `${this.currentIndex+1} / ${this.images.length}`;

    }

    /*==================================
    Formatear fecha y hora
    ==================================*/

    formatDateTime(date){

        return new Intl.DateTimeFormat(

            "es-CO",

            {

                dateStyle:"long",

                timeStyle:"short"

            }

        ).format(

            new Date(date)

        );

    }

    formatDate(date){

        return new Intl.DateTimeFormat(

            "es-CO",

            {

                dateStyle:"long"

            }

        ).format(

            new Date(date)

        );

    }

    /*==================================
    Renderizar visor
    ==================================*/

    renderViewer(item){

        this.lightboxMedia.innerHTML="";

        if(item.type==="image"){

            const image=document.createElement("img");

            image.src=item.image;

            image.alt=item.name;

            image.loading="eager";

            this.lightboxMedia.appendChild(image);

        }

        else if(item.type==="video"){

            const video=document.createElement("video");

            video.src=item.image;

            video.controls=true;

            video.autoplay=true;

            video.playsInline=true;

            this.lightboxMedia.appendChild(video);

        }

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

    /*==================================
    Skeleton Loader
    ==================================*/

    showSkeleton(){

        this.gallery.innerHTML="";

        for(let i=0;i<12;i++){

            const skeleton=document.createElement("article");

            skeleton.className="gallery-card skeleton-card";

            skeleton.innerHTML=`

            <div class="skeleton-image"></div>

        `;

            this.gallery.appendChild(skeleton);

        }

    }
}

/*==========================================================
Inicialización
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>new GalleryApp()

);