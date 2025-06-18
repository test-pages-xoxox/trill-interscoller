var
    autoGalleryAnim,
    nextOffer = 0,
    choosen = [],
    choosenNr = -1,
    isAnimating = null,
    isDisappearing = null,
	imgs = [],
    gallery = {
        enabled: true,
        bindGalleryUIActions: function () {
            e.offer.on('mouseenter', function (ev) {
				ev.preventDefault();
                var id = $(this).data('id');
                gallery.showGallery(id, 500);
                nextOffer = id === o.offersCount - 1 ? 0 : id + 1;
                gallery.galleryAnim.stop();
                ev.preventDefault();
                var thisOffer = $(this);
                banner.changeOfferZindex(id)
				setTimeout(function(){banner.frameAnim.frameHover(id)},16);
				gallery.galleryAnim.pixelateCanvas(id,false);
                thisOffer.anim({
                    opacity: 0,
                    scale: 1.25
                }, {
                    queue: false,
                    duration: 0
                });
                thisOffer.anim({
                    opacity: 1,
                    scale: 1
                }, {
                    queue: false,
                    duration: 250,
                    complete: function () {
                        thisOffer.css('transform', 'none')
						gallery.galleryAnim.pixelateCanvas(id,false);
                    }
                });
            });
			e.offer.on('mouseleave',function(){
				setTimeout(function(){banner.frameAnim.frameHover(-1)},16);
			});
            e.offerHover.on('mouseenter', function (ev) {
                gallery.galleryAnim.stop();
                ev.preventDefault();
            });

            e.banner.on('mouseenter', function (ev) {
                e.gallery.anim({
                    opacity: 1
                }, {
                    duration: 300,
                    queue: false
                });
                gallery.galleryAnim.stop();
            });

            e.banner.on('mouseleave', function (ev) {
                if (banner.flags.theEnd) return;
                if (!e.gallery.hasClass('hover-anim')) {
                    gallery.galleryAnim.start();
                    ev.preventDefault();
                }
            });

        },
        galleryAnim: {
            start: function () {
                e.gallery.addClass('hover-anim');
				clearTimeout(autoGalleryAnim);
                autoGalleryAnim = setTimeout(function () {
                    banner.changeOfferZindex(nextOffer);
					banner.frameAnim.frameHover(nextOffer);
                    var currentOffer = e.offerArr[nextOffer];
					var currentNr = nextOffer;
					gallery.galleryAnim.pixelateCanvas(currentNr,false);
                    currentOffer.anim({
                        opacity: 0,
                        scale: 1.15
                    }, {
                        queue: false,
                        duration: 0
                    });
                    currentOffer.anim({
                        opacity: 1,
                        scale: 1
                    }, {
                        queue: false,
                        duration: 250,
                        complete: function () {
                            currentOffer.css('transform', 'none');
							gallery.galleryAnim.pixelateCanvas(currentNr,true);
                        }
                    });
                    gallery.showGallery(nextOffer, 500);
                    nextOffer = nextOffer === o.offersCount - 1 ? 0 : nextOffer + 1;
                    gallery.galleryAnim.start();
                }, o.hoverAnimInterval);
            },
            stop: function () {
                banner.frameAnim.frameHover(-1);
                clearTimeout(autoGalleryAnim);
            },
			pixelateCanvas: function(id, ok){
				if(canvases.length === 0 || currentZoom != 1) return;
				canvases[id].css('image-rendering',ok?'pixelated':'auto');
			}
        },
        showGallery: function (nr, time) {
            if (choosenNr == nr) return;
            choosenNr = nr;
            banner.changeOfferZindex(nr);

            function anim(img, ok) {
                var noScale = false;
                img.stop();
                if (ok) {
                    if (isAnimating === img) {
                        time = time / 4;
                    }
                    img.css('z-index', 2);
                    isAnimating = img;
					if (supportTransition){
						img
							.css('transition-property','none')
							.css('transition-duration','0s')
							.css('opacity','0')
							.css('transform','scale(0.75)')
						img.animTimeout = setTimeout(function(){
							img
								.css('transition-property','opacity, transform')
								.css('transition-duration', Math.round(time/10)/100+'s')
								.css('opacity','1')
								.css('transform','scale(1)')
							},16);
						if(img.completeAnimTimeout)clearTimeout(img.completeAnimTimeOut);
						img.completeAnimTimeout = setTimeout(function(){isAnimating = null;},time);
					}else{
						img.anim(
						{
							opacity: 0,
							scale: .75
						}, {
							queue: false,
							duration: 0
						});
						img.anim({
							opacity: 1,
							scale: 1
						}, {
							queue: false,
							duration: time,
							complete: function () {
								isAnimating = null;
							}
						});
					}
                } else {
                    img.css('z-index', 1);
                    if (isDisappearing === img) {
                        time = time / 4;
                    }
                    isDisappearing = img;
					if (supportTransition){
						img
							.css('transition-property','opacity, transform')
							.css('transition-duration',Math.round(time/10)/100+'s')
							.css('opacity','0')
							.css('transform','scale(1.25)')
						
						if(img.completeDisappearTimeout)clearTimeout(img.completeDisappearTimeOut);
						if(img.animTimeout) clearTimeout(img.animTimeout);
						img.completeDisappearTimeout = setTimeout(
							function(){
								if(isDisappearing)isDisappearing
									.css('transition-property','none')
									.css('transition-duration','0s')
									.css('opacity','0')
									.css('transform','scale(0.75)');
								isDisappearing = null;
							}
						,time);
					}else{
						img.anim(
						{
							opacity: 0,
							scale: 1.25
						}, {
							queue: false,
							duration: time,
							complete: function () {
								isDisappearing = null;
							}
						});
					}
                }
            }
            for (var i = 0; i < o.offersCount; i++) {
                var ok = (i == nr);
                var img = imgs[i];
                if (choosen[i] != ok) {
                    anim(img, ok);
                } else {
                    img.css('z-index', 0);
					img
						.css('transition-property','none')
						.css('transition-duration','0s')
						.css('opacity','0')
						.css('transform','scale(0.75)')
                }
                choosen[i] = ok;
            }
        },
		initImages: function(){
			for (var i = 0; i < o.offersCount; i++) {
				imgs[i] = $('#galImg' + i);
				imgs[i].parent().css('display','block')
				imgs[i].css('opacity',Number(i==o.offersCount-1))
			}
		}
    }