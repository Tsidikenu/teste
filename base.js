$(document).ready(function() {

    //DOTCMS
    if(isEditMode){
        $('nav.navbar').css('position', 'relative');
    }

    //if services slider is not created its title is hidden
    if(!$('.services-slider').length) {
        $('footer .services-title').parent().hide();
    }

	var globals = {
		scrollValInit: 40,
		scrollOffsetMax: 100,
		headerOffset: 80,
		didScroll: '',
		eventType: 'click'
	};

	function init() {
		stickyHeader();
		initSlider();
		// brodrigues: update for each row article containers to have the height
		// of the highest column inside its row parent
		$('main .row').each(function(i, rowElement) {
			updateContainerHeightInWrapper('.resize-col', rowElement);
		});
		buildSideNav();
		buildSelect();
		organizeEvenOdd();
		updateContainerHeights();
	}

    /* Before init check if news list items exist and if so change to correct excerpt */
    updateNewsListArticlesExcerpt();
    
    init();
	
	function updateContainerHeights() {
        // brodrigues: update for each row article containers to have the height of the highest column inside its row parent
		$('main .row').each(function(i, rowElement) {
			updateContainerHeightInWrapper($(rowElement).find('.resize-col'), rowElement);
		});
		//rlima: update for height adjustment on contained rows
		$('main .max-height-wrapper').each(function(i, rowElement) {
			updateContainerHeightInWrapper($(rowElement).find('.resize-col-contained'), rowElement);
		});
    }

	//Functions on window scroll
	window.addEventListener('scroll', function() {

		eventsHelpers.debounce(function() {
			stickyHeader();
		}, 0)();

		//close BCH Net widget if after scroll the distance scrolled is > scrollOffsetMax
		var posInit = window.pageYOffset;
		eventsHelpers.debounce(function() {
			var posFinal = window.pageYOffset;
			if (Math.abs(posFinal - posInit) > globals.scrollOffsetMax) {
				closeBchNetWidget();
			}
		}, 300)();

	});

	//Functions on window resize
	window.addEventListener('resize', function() {

		eventsHelpers.debounce(function() {
			//re-affix sidenav on resize due to constraints on header and footer sizes
			affixSideNav();
			if ($(window).width() >= 992) {
				$('#header-nav').removeClass('in');
			}
		}, 0)();

	});

	var eventsHelpers = {
		// Debounce is needed for performance improvments for scroll & resize events
		// ============================================================
		debounce: function(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this,
					args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		}
	}

	//FIXED HEADER AND RWD NAV ON SCROLL
	function stickyHeader() {
		var el = $('.navbar');
		if (window.pageYOffset > globals.scrollValInit) {
			el.addClass('scrolled-header');
		} else {
			el.removeClass('scrolled-header');
		}
	}

	/*
	 * updateContainerHeightInWrapper
	 *
	 * Calculates the highest column in a given wrapper and updates
	 * all wrapper columns's height with this value
	 *
	 * ARGUMENTS EXAMPLE
	 * identifier = '.resize-col'
	 *
	 
	function updateContainerHeightInWrapper(identifier, parentElem) {
		/* this function is only used for tablets and higher 
		if ($(window).width() >= 768) {
			var rowHeightValuesList = [];
			var heightMaxValue = -1;

			$(identifier, parentElem).each(function(j, articleElem) {
				if ($(articleElem).is(':visible')) {
					rowHeightValuesList.push($(articleElem).height());
				}
			});

			heightMaxValue = Math.max.apply(Math, rowHeightValuesList);

			$(identifier, parentElem).height(heightMaxValue);
		}
	}
*/
	function updateContainerHeightInWrapper(identifier, parentElem) {
	
	    /*reset heights*/
	    $(identifier, parentElem).css('height', '');
	    
		/* this function is only used for tablets and higher */
		if ($(window).width() >= 768) {
			var rowHeightValuesList = [];
			var heightMaxValue = -1;

			window.setTimeout(function(){
			    $(identifier, parentElem).each(function(j, articleElem) {
    				if ($(articleElem).is(':visible')) {
    					rowHeightValuesList.push($(articleElem).height());
    				}
    			});
    			
    			heightMaxValue = Math.max.apply(Math, rowHeightValuesList);
			    $(identifier, parentElem).height(heightMaxValue);
			}, 300);

		}
	}

	function initSlider() {
		$('.services-slider').slick({
			dots: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 1000,
			speed: 1500,
			slidesToShow: 3,
			slidesToScroll: 1,
			responsive: [{
					breakpoint: 769,
					settings: {
						slidesToShow: 2,
						slidesToScroll: 1
					}
				},
				{
					breakpoint: 426,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1
					}
				}
				// You can unslick at a given breakpoint now by adding:
				// settings: "unslick"
				// instead of a settings object
			]
		});
	}

	function closeBchNetWidget() {
		$('.bchnet_widget').fadeOut(300);
	};

	//rlima: codigo para activar menu lateral (affix.js)
	//este código deverá residir no container de sidenav?
	function buildSideNav() {
		var $root = $('html, body');
		//build actual sidenav based on identifiers on container titles
		var $wrapper = $('.sidenav-wrapper');
		if ($wrapper.length) {
			var $sidenav = $('<ul id="sidenav" class="nav nav-tabs nav-stacked">').appendTo($wrapper);
			$('.is-anchor').each(function(i, anchorEl) {
				var id = 'anchor' + i;
                                    var anchorLabel = $(anchorEl).data('elemlabel');
				$(anchorEl).parent().attr('id', id);
				var $item = $('<li><a href="#' + id + '">' + anchorLabel + '</a></li>').appendTo($sidenav);
				//smooth scrolling for anchors
				$item.find('a').click(function() {
					$root.animate({
						//Conpensate offset due to header
						scrollTop: $($.attr(this, 'href')).offset().top - globals.headerOffset
					}, 400);
					return false;
				});
			});
			//Start scrollspy and add offset
			$("body").scrollspy({
				target: '#' + $wrapper.attr('id'),
				offset: globals.headerOffset + 5
			});
		}
		affixSideNav();
		//build top bar for mobile
		if ($('#sidenav').length) {
			var $container = $('<div class="sidenav-container closed hidden-lg hidden-md col-xs-12">').insertBefore($('main>.container'));
			var $toggle = $('<span class="sidenav-container--icon"></span>').appendTo($container);
			var $navlist = $('<ul class="nav-list-mobile">').appendTo($container);
			$navlist.append($("#sidenav").children().clone(true));
			$toggle.on('click', function() {
				$(this).parent().toggleClass('closed opened');
			});
		}
	}

	function affixSideNav() {
		if ($('#sidenav').length) {
			$('#sidenav').affix({
				offset: {
					top: function() {
						return (this.top = $('nav').outerHeight(true) + ($('.banner-container').outerHeight(true) || 10))
					},
					bottom: function() {
						return (this.bottom = $('footer').outerHeight(true) + 40)
					}
				}
			});
			$("#sidenav").width($(".sidenav-wrapper").width());
		}
	};

	//rlima: codigo para activar "select"
	//TODO: Actualmente só contempla 1 select por página, optimizar para permitir vários?
	function buildSelect() {
		if ($('.select-accordeon--wrapper').length) {
			var label = '';
			var clickableWrapper = $('<div class="clickable"></div>').appendTo($('.select-accordeon--wrapper'));
			var title = $('<div class="title-secondary"></div>').appendTo(clickableWrapper);
			var selector = $('<div class="icon-open"></div>').appendTo(clickableWrapper);
			var select = $('<ul class="select-accordeon">').appendTo(clickableWrapper);
			$('.isSelectable').each(function(i, selectable) {
				//label becomes the one of the first set found
				label = label ? label : $(selectable).data('selectlabel');
				var item = $('<li id="' + $(selectable).data('selectid') + '"' +
					' data-selectlabel="' + $(selectable).data('selectlabel') + '"' +
					' class="body-secondary">' + $(selectable).data('selectlabel') +
					'</li>').appendTo(select);
				if ($(selectable).data('mapkey')) {
					item.data('mapkey', $(selectable).data('mapkey'));
				}
				item.on('click', function(e) {
					e.stopPropagation();
					var id = $(this).attr('id');
					title.html($(this).data('selectlabel'));
					if ($(this).data('mapkey')) {
						$(".isSelectable[data-selectid='" + id + "']").find('iframe').attr('src', 'https://www.google.com/maps/d/embed?mid=' + $(this).data('mapkey'));
					} else {
						$('.isSelectable').hide();
						$(".isSelectable[data-selectid='" + id + "']").fadeIn(500);
					}
					select.removeClass('active');
				});
			});
			clickableWrapper.on('click', function() {
				$('.select-accordeon', $(this)).toggleClass('active');
			});
			title.html(label);
		}
	}

	//Organização de artigos even-odd (alternação entre imagem à esquerda/direita)
	function organizeEvenOdd() {
		var count = 0;
		$('.even-odd-container').each(function(i, container) {
			var row = $(container).closest('.row');
			if (!row.hasClass('img-left') && !row.hasClass('img-right')) {
				//only add left/right if row hasn't been classified yet;
				//support multiple containers in row
				++count;
				row.addClass((count % 2) ? 'img-left' : 'img-right');
			}
		});
	}
	
	
	if(!($('body').hasClass('homepage'))) {
	    $('.banner-call').removeClass('display');
	    $('.banner-call').addClass('display-white');
	}
	
	function updateNewsListArticlesExcerpt() {
	
        if($('#news_list').length){
            $('#news_list .article-container .body').each(function(i, elem) {
    				
    				var htmlStrippedString = elem.textContent;
    				if(htmlStrippedString.length > totalExcerptChars) {
    				    htmlStrippedString = htmlStrippedString.substr(0, (totalExcerptChars - 1)) + " ...";
    				}
    				$(elem).html(htmlStrippedString);
    				
    			});
    			
    		$('#news_list .article-container .article-date span').each(function(j, dateElem) {
    		    
    		    var dateString = dateElem.textContent;
    		    var dStrResult = getUiDateFormat(dateString);
    		      
    		    $(dateElem).html(dStrResult);
    		    
    		});
		}
		
    }
    
//TEMPLATE BUG FIX MSANTOS 2021/07/07
var getAnchor4 = $(".page-content #anchor4.row"), getAnchor5 = $(".page-content #anchor5.row")

if(getAnchor4){ 
    if(!getAnchor4.hasClass("img-right") || !getAnchor4.hasClass("img-left")){
        getAnchor4.css({'margin-bottom':'0'});
    }
}

if(getAnchor5){ 
    if(!getAnchor5.hasClass("img-right") || !getAnchor5.hasClass("img-left")){
        getAnchor5.css({'margin-bottom':'0'});
    }
}
});