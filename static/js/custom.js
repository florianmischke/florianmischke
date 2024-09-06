jQuery(function($) {
    function focustrigger() {
        if(location.hash && location.hash != '') {
            var id = location.hash.substring(1)
            var el = $('#'+id)
            el.trigger('focus')
        }
    }

    $( window ).on( 'hashchange', function( e ) {
        focustrigger()
    } );
    focustrigger()



    function createModal(modalId) {
        const markup = `
            <svg class="d-none" xmlns="http://www.w3.org/2000/svg">
                <symbol id="enlarge" viewBox="0 0 16 16">
                    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
                </symbol>
                <symbol id="exit" viewBox="0 0 16 16">
                    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
                </symbol>
            </svg>
            <div class="modal fade lightbox-modal" id="${modalId.substring(1)}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-fullscreen">
                    <div class="modal-content">
                    <button type="button" class="btn-fullscreen-enlarge" aria-label="Enlarge fullscreen">
                        <svg class="bi"><use href="#enlarge"></use></svg>
                    </button>
                    <button type="button" class="btn-fullscreen-exit d-none" aria-label="Exit fullscreen">
                        <svg class="bi"><use href="#exit"></use></svg>
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div class="modal-body">
                        <div class="lightbox-content">
                        <!-- JS content here -->
                        </div>
                    </div>
                    </div>
                </div>
            </div>`;
        return markup
    }

    function createIndicators (galleryLinks) {
        let markup = "";

        galleryLinks.each(function(i, value) {
            var src = $(value).attr('href')
            markup += `
                <button type="button" data-bs-target="#lightboxCarousel"
                data-bs-slide-to="${i}"
                ${i === 0 ? 'class="active" aria-current="true"' : ''}
                aria-label="Slide ${i + 1}" style="background-image: url('${src}')">
                </button>`;
        })

        return markup;
    }  
    
    function createCaption (caption) {
        return `<div class="carousel-caption d-none d-md-block">
            <h4 class="m-0">${caption}</h4>
            </div>`;
    }

    function createSlides (galleryLinks) {
        let markup = "";
        galleryLinks.each(function( i, link) {
            let img = $(link).find('img')
            let currentImgSrc = '';
            let imgSrc = $(link).attr('href');
            let imgAlt = $(link).siblings('figcaption').html();

            markup += `
                <div class="carousel-item${i === 0 ? " active" : ""}">
                    <img class="d-block  w-100" src=${imgSrc} alt="${imgAlt}">
                    ${imgAlt ? createCaption(imgAlt) : ""}
                </div>`;

        })

        return markup;
    }

    function createCarousel (galleryLinks) {
        const markup = `
            <!-- Lightbox Carousel -->
            <div id="lightboxCarousel" class="carousel slide" data-bs-ride="false">
            <!-- Indicators/dots -->
            <div class="carousel-indicators">
                ${createIndicators(galleryLinks)}
            </div>
            <!-- Wrapper for Slides -->
            <div class="carousel-inner justify-content-center mx-auto">
                ${createSlides(galleryLinks)}
            </div>
            <!-- Controls/icons -->
            <button class="carousel-control-prev" type="button" data-bs-target="#lightboxCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#lightboxCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
            </div>
            `;

        return markup;
    }

    function initLightbox() {
        let galleryLinks = $('a[data-gallery]');
        if(galleryLinks.length < 1)
            return;
        
        const modalId = galleryLinks.first().data('bs-target');
        const wrapper = galleryLinks.first().closest('main');

        const modal = createModal(modalId);
        wrapper.append(modal)

        var carousel = createCarousel(galleryLinks);
        $(modalId).find('.lightbox-content').append(carousel);

        const lightboxCarousel = $("#lightboxCarousel");
        const bsCarousel = new bootstrap.Carousel(lightboxCarousel);

        galleryLinks.on("click", function(e) {
            const href = $(this).attr('href');

            if (lightboxCarousel) {
                var index = -1;  // Standardwert, falls nichts gefunden wird
                galleryLinks.each(function(i, elem) {
                    if ($(elem).attr('href') === href) {
                        index = i;  // Setze den Index, wenn es eine Übereinstimmung gibt
                        return false;  // Schleife abbrechen
                    }
                });
                bsCarousel.to(index);
            }
        })

        const bsModal = new bootstrap.Modal(modalId);

        $(modalId).on('click', function(event) {
            if (!$(event.target).closest('.carousel-item, button').length) {
                bsModal.hide();
            }
        });

        // --- Support Fullscreen
        const fsEnlarge = $(".btn-fullscreen-enlarge");
        const fsExit = $(".btn-fullscreen-exit");

        function toggleFullscreen() {
            let elem = document.querySelector(modalId);
            
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch((err) => {
                alert(
                    `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
                );
                });
            } else {
                document.exitFullscreen();
            }
        }

        fsEnlarge.on("click", function(e) {
            e.preventDefault();
            toggleFullscreen(modalId);
        })

        fsExit.on("click", function(e) {
            e.preventDefault();
            toggleFullscreen(modalId);
        })

        $(modalId).find('.btn-close').on("click", function(e) {
            document.exitFullscreen();
        })

        document.addEventListener("fullscreenchange", function() {
            if (!document.fullscreenElement) {
                fsEnlarge.removeClass('d-none')
                fsExit.addClass('d-none')
            } else {
                console.log("Vollbildmodus wurde betreten");
                fsEnlarge.addClass('d-none')
                fsExit.removeClass('d-none')
            }
        });
    }

    initLightbox();

})