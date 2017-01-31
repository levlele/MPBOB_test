// Menu mobile
var slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu-mobile'),
  'padding': 300,
  'tolerance': 70,
  'side': 'right',
  'fx': 'ease-in-out',
  'touch': 'false'
});

$('.toggle-button').on('click', function() {
  slideout.toggle();
  $(this).find("span").toggleClass('on');
  $('#panel').toggleClass('slideout-panel-overlay');
  $('#menu-mobile').toggleClass('open');
  slideout.disableTouch();
});

$(window).resize(function(){
  if(slideout.isOpen()){
    slideout.close();
    $('#panel').removeClass('slideout-panel-overlay');
    $('#menu-mobile').removeClass('open');
    $('.toggle-button span').removeClass('on');
  }
});

$('html').click(function() {
 slideout.close();
 $('#panel').removeClass('slideout-panel-overlay');
 $('#menu-mobile').removeClass('open');
 $('.toggle-button span').removeClass('on');
});

$('#menu-mobile').click(function(event){
   event.stopPropagation();
});

$('#Hamburger-Icon').click(function(event){
   event.stopPropagation();
});

// Events Merchants
$(function() {
  $('.category__logos a').on('click', function() {
    var merchant = $(this)[0].id;
    var category = $(this).parents('.category__container').attr('id');
    var parametro = 'compras' + '-' + merchant + '-' + category;
    ga('send', 'event', 'LANDINGS', 'ALWAYSON', parametro, 4);
  });
});

// Events Links generales
$(function() {
  $('a:not(.category__logos a), input[type=submit]').on('click', function() {
    var link = $(this)[0].id;
    ga('send', 'event', 'LANDINGS', 'ALWAYSON', link, 4);
  });
});

// Fallback for SVG
$(function() {
  $(".section-icon img").error(function() {
    $(this).attr("src",function() {
      return $(this).attr("src").replace(".svg",".png");
    });
  });
});

// Search ML
$(function() {
  $('#btn-busqueda').click(function(event){
    event.preventDefault();
    var q = $('.search-shop__input').val();
    window.open('http://listado.mercadolibre.com.ar/' + q,'_blank');
  });
});

// Modal video
$('.venobox').venobox();

// Swiper - Slider header + Api medios de pago + Carrousel logos
$(document).ready(function () {
  // Inicializar Slider header
  var bannerSwiper = new Swiper ('#slider-banner', {
    loop: true,
    autoplay: 2500,
    speed: 1500,
    slidesPerView: 1,
    effect: 'fade',
    pagination: '.swiper-pagination',
    paginationClickable: true,
    grabCursor: true
  });

  // Inicializar Slider Logos
  var logoSwiper = new Swiper ('#slider-logos', {
    loop: true,
    autoplay: 2500,
    speed: 1500,
    slidesPerView: 6,
    effect: 'slide',
    spaceBetween: 20,
    centeredSlides: true,
    grabCursor: true,
    breakpoints: {
      // <= 320px
      320: {
        slidesPerView: 2,
        spaceBetween: 20
      },
      // <= 480px
      480: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      // <= 640px
      640: {
        slidesPerView: 4,
        spaceBetween: 20
      }
    }
  });

  // Inicializar Slider Api medios de pago
  var paymentSwiper = new Swiper ('#payment', {
    loop: true,
    autoplay: 1500,
    speed: 1500,
    effect: 'slide',
    slidesPerView: 4,
    spaceBetween: 20,
    grabCursor: true,
    breakpoints: {
      // <= 320px
      375: {
        slidesPerView: 2,
        spaceBetween: 20
      },
      // <= 480px
      480: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      // <= 768px
      768: {
        slidesPerView: 4,
        spaceBetween: 20
      },
      // <= 1023px
      1023: {
        slidesPerView: 5,
        spaceBetween: 20
      }
    }
  });

  // Informacion API medios de pago
  $.ajax({
    url: 'https://api.mercadolibre.com/sites/MLA/credit_card_promos',
    async: true
  }).then(function(data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {

        var idBanco			= data[key].issuer.id;
        var nombreBanco	= data[key].issuer.name;
        var cuotasBanco = data[key].max_installments;
        var fechaInicio = moment(data[key].start_date).format('DD/MM');
        var fechaFinal 	= moment(data[key].expiration_date).format('DD/MM');
        var className 	= 'issuer-' + idBanco;

        paymentSwiper.appendSlide(
          '<div class="swiper-slide">' +
            '<div class="payment__logo">' +
              '<span class="' + className + '"></span>' +
            '</div>' +
            '<div class="payment__logo-info">' +
              '<p><b>' + cuotasBanco + ' cuotas' + '</b></br>' +
                'Del ' + fechaInicio + ' al ' + fechaFinal +
              '</p>' +
            '</div>' +
          '</div>'
        );
      }
    }
  });
});
