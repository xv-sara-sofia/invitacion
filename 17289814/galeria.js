"use strict";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */
const CONFIG = {
    API_URL:
        "https://script.google.com/macros/s/AKfycbyWUk6Tt_gffF5whQzWnKrgxchUoVp8Poe_onVhB1t6EqPR4NSDgjICQB5X0REa2uYw/exec",
    GOOGLE_FORM_URL:
        "https://forms.gle/udcQ727vQbSTaZUYA",
    ITEMS_PER_BATCH: 24,
    AUTO_REFRESH: true,
    REFRESH_DELAY: 2500,
    TOAST_DURATION: 4000
};

/* ==========================================================
   BIBLIOTECA DE RECUERDOS
   XV Sara Sofía
========================================================== */
class GalleryApp {
    constructor() {
        /*==================================
        Configuración
        ==================================*/
        this.googleFormURL =
            CONFIG.GOOGLE_FORM_URL;
        /*==================================
        Estado
        ==================================*/
        this.images = [];
        this.currentIndex = 0;
        this.renderedItems = 0;
        this.loadingMore = false;
        /*==================================
        Gestos táctiles
        ==================================*/
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 60;
        /*==================================
        Inicialización
        ==================================*/
        this.init();
    }

    /*==================================
    Inicialización
    ==================================*/
    async init() {
        this.cacheDOM();
        this.bindEvents();
        this.createImageObserver();
        await this.loadGallery();
    }

    createImageObserver() {
        this.imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.onload = () => {
                        image.closest(".gallery-card")
                            .classList.add("loaded");
                    };
                    this.imageObserver.unobserve(image);
                });
            },
            {
                rootMargin: "300px"
            }
        );
    }

    /*==================================
    Cache DOM
    ==================================*/
    cacheDOM() {
        this.photoAuthor =
            document.getElementById("photoAuthor");
        this.photoDate =
            document.getElementById("photoDate");
        this.photoCounter =
            document.getElementById("photoCounter");
        this.btnUpload =
            document.getElementById("btnUpload");
        this.btnAlbum =
            document.getElementById("btnAlbum");
        this.gallery =
            document.getElementById("galleryGrid");
        this.lightbox =
            document.getElementById("lightbox");
        this.lightboxMedia =
            document.getElementById("lightboxMedia");
        this.closeLightbox =
            document.getElementById("closeLightbox");
        this.prevPhoto =
            document.getElementById("prevPhoto");
        this.nextPhoto =
            document.getElementById("nextPhoto");
        this.galleryStats =
            document.getElementById("galleryStats");
        this.galleryUpdate =
            document.getElementById("galleryUpdate");
    }

    /*==================================
    Eventos
    ==================================*/
    bindEvents() {
        this.btnUpload.addEventListener(
            "click",
            () => this.openGoogleForm()
        );
        this.closeLightbox.addEventListener(
            "click",
            () => this.closeViewer()
        );
        this.prevPhoto.addEventListener(
            "click",
            () => this.previousImage()
        );
        this.nextPhoto.addEventListener(
            "click",
            () => this.nextImage()
        );
        this.lightbox.addEventListener(
            "click",
            (event) => this.handleLightboxClick(event)
        );
        this.lightboxMedia.addEventListener(
            "touchstart",
            (event) => this.handleTouchStart(event),
            {passive: true}
        );
        this.lightboxMedia.addEventListener(
            "touchend",
            (event) => this.handleTouchEnd(event),
            {passive: true}
        );
        document.addEventListener(
            "keydown",
            (event) => this.handleKeyboard(event)
        );
        window.addEventListener(
            "focus",
            () => this.onReturnFromForm()
        );
        window.addEventListener(
            "scroll",
            () => this.handleScroll()
        );
    }

    /*==================================
    Atajos de teclado
    ==================================*/
    handleKeyboard(event) {
        if (this.lightbox.classList.contains("hidden")) {
            return;
        }
        switch (event.key) {
            case "ArrowRight":
                this.nextImage();
                break;
            case "ArrowLeft":
                this.previousImage();
                break;
            case "Escape":
                this.closeViewer();
                break;
        }
    }

    /*==================================
    Inicio del gesto
    ==================================*/
    handleTouchStart(event) {
        this.touchStartX =
            event.changedTouches[0].clientX;
    }

    /*==================================
    Fin del gesto
    ==================================*/

    handleTouchEnd(event) {
        this.touchEndX =
            event.changedTouches[0].clientX;
        this.handleSwipe();
    }

    /*==================================
    Detectar Swipe
    ==================================*/
    handleSwipe() {
        const distance =
            this.touchEndX -
            this.touchStartX;
        if (
            Math.abs(distance) <
            this.minSwipeDistance
        ) {
            return;
        }
        if (distance > 0) {
            this.previousImage();
        } else {
            this.nextImage();
        }
    }

    /*==================================
    Abrir Formulario
    ==================================*/
    openGoogleForm() {
        window.open(
            this.googleFormURL,
            "_blank",
            "noopener,noreferrer"
        );
    }

    /*==================================
    Cuando el usuario vuelve
    ==================================*/
    onReturnFromForm() {
        if (!CONFIG.AUTO_REFRESH) {
            return;
        }
        this.showToast(
            "✨ Actualizando la galería..."
        );
        setTimeout(() => {
            this.loadGallery();
        }, CONFIG.REFRESH_DELAY);
    }

    /*==================================
    Notificaciones
    ==================================*/
    showToast(message) {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, CONFIG.TOAST_DURATION);
    }

    /*==================================
    Cargar galería
    ==================================*/
    async loadGallery() {
        this.showSkeleton();
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) {
                throw new Error(
                    "No fue posible cargar la galería."
                );
            }
            const data = await response.json();
            this.parseGalleryData(data);
        } catch (error) {
            console.error(error);
            this.showToast(
                "No fue posible cargar las fotografías."
            );
        } finally {
            this.loadingMore = false;
        }
    }

    /*==================================
    Procesar respuesta de la API
    ==================================*/
    parseGalleryData(data) {
        this.images = data.gallery || [];
        this.galleryStatsData = data.stats || {};
        this.galleryUpdateData = data.event || {};
        this.updateGallery();
    }

    /*==================================
    Actualizar interfaz
    ==================================*/
    updateGallery() {
        this.renderStats();
        this.renderGallery();
    }

    /*==================================
    Renderizar estadísticas
    ==================================*/
    renderStats() {
        if (!this.galleryStats) {
            return;
        }
        const stats = this.galleryStatsData;
        if (!stats) {
            return;
        }
        this.galleryStats.innerHTML = `
        💜 <strong>${stats.totalItems} recuerdos</strong>
        📸 ${stats.totalImages} fotografías
        •
        🎥 ${stats.totalVideos} videos
    `;
    }

    /*==================================
    Renderizar galería
    ==================================*/
    renderGallery() {
        this.resetGallery();
        this.renderNextBatch();
    }

    /*==================================
    Reiniciar galería
    ==================================*/
    resetGallery() {
        this.gallery.innerHTML = "";
        this.renderedItems = 0;
    }

    /*==================================
   Renderizar siguiente lote
   ==================================*/
    renderNextBatch() {
        const end = Math.min(
            this.renderedItems + CONFIG.ITEMS_PER_BATCH,
            this.images.length
        );
        for (
            let i = this.renderedItems;
            i < end;
            i++
        ) {
            const item = this.images[i];
            const card = this.createGalleryCard(
                item,
                i
            );
            this.gallery.appendChild(card);
        }
        this.renderedItems = end;
    }

    /*==================================
    Crear tarjeta
    ==================================*/
    createGalleryCard(item, index) {
        const card = document.createElement("article");
        card.className = "gallery-card";
        card.innerHTML = `
            <div class="card-loader"></div>
               <img
                data-src="${item.thumbnail}"
                alt="${item.name}"
                class="gallery-image"
            >
            ${
            item.type === "video"
                ? '<div class="video-badge">▶</div>'
                : ""
        }
        `;
        const image = card.querySelector(".gallery-image");
        this.imageObserver.observe(image);
        card.addEventListener(
            "click",
            () => this.openLightbox(index)
        );
        return card;
    }

    /*==================================
    Scroll infinito
    ==================================*/
    handleScroll() {
        if (this.loadingMore) {
            return;
        }
        if (
            this.renderedItems >= this.images.length
        ) {
            return;
        }
        const threshold = 300;
        if (
            window.innerHeight +
            window.scrollY >=
            document.body.offsetHeight -
            threshold
        ) {
            this.loadingMore = true;
            this.renderNextBatch();
            this.loadingMore = false;
        }
    }

    /*==================================
    Abrir Lightbox
    ==================================*/
    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightbox();
        this.lightbox.classList.remove("hidden");
        requestAnimationFrame(() => {
            this.lightbox.classList.add("visible");
        });
        document.body.style.overflow = "hidden";
    }

    /*==================================
    Actualizar visor
    ==================================*/
    updateLightbox() {
        const item = this.images[this.currentIndex];
        this.renderViewer(item);
        this.photoAuthor.textContent =
            item.name;
        this.photoDate.textContent =
            this.formatDate(item.updated);
        this.photoCounter.textContent =
            `${this.currentIndex + 1} / ${this.images.length}`;
        this.preloadAdjacentImages();
    }

    /*==================================
    Formatear fecha y hora
    ==================================*/
    formatDate(date) {
        return new Intl.DateTimeFormat(
            "es-CO",
            {
                dateStyle: "long"
            }
        ).format(
            new Date(date)
        );
    }

    /*==================================
    Renderizar visor
    ==================================*/
    renderViewer(item) {
        this.lightboxMedia.innerHTML = "";
        if (item.type === "image") {
            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;
            image.loading = "eager";
            this.lightboxMedia.appendChild(image);
        } else if (item.type === "video") {
            const iframe = document.createElement("iframe");
            iframe.src = item.image;
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.allow = "autoplay; fullscreen";
            iframe.allowFullscreen = true;
            iframe.style.border = "0";
            this.lightboxMedia.appendChild(iframe);
        }
    }

    /*==================================
    Precargar imagen
    ==================================*/
    preloadImage(index) {
        if (index < 0 || index >= this.images.length) {
            return;
        }
        const item = this.images[index];
        if (item.type !== "image") {
            return;
        }
        const image = new Image();
        image.src = item.image;
    }

    /*==================================
    Precargar imágenes cercanas
    ==================================*/
    preloadAdjacentImages() {
        const previous =
            (this.currentIndex - 1 + this.images.length)
            % this.images.length;
        const next =
            (this.currentIndex + 1)
            % this.images.length;
        this.preloadImage(previous);
        this.preloadImage(next);
    }

    /*==================================
    Cerrar visor
    ==================================*/
    closeViewer() {
        this.lightbox.classList.remove("visible");
        setTimeout(() => {
            this.lightboxMedia.innerHTML = "";
            this.lightbox.classList.add("hidden");
        }, 250);
        document.body.style.overflow = "";
    }

    /*==================================
    Cerrar al hacer click fuera
    ==================================*/
    handleLightboxClick(event) {
        if (event.target === this.lightbox) {
            this.closeViewer();
        }
    }

    /*==================================
    Siguiente fotografía
    ==================================*/
    nextImage() {
        this.currentIndex++;
        if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        }
        this.updateLightbox();
    }

    /*==================================
    Fotografía anterior
    ==================================*/
    previousImage() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex =
                this.images.length - 1;
        }
        this.updateLightbox();
    }

    /*==================================
    Skeleton Loader
    ==================================*/
    showSkeleton() {
        this.gallery.innerHTML = "";
        for (let i = 0; i < 12; i++) {
            const skeleton = document.createElement("article");
            skeleton.className = "gallery-card skeleton-card";
            skeleton.innerHTML = `
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
    () => {
        new GalleryApp();
    }
);