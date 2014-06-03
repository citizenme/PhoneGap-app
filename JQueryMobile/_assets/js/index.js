(function( $, undefined ) {
	//special click handling to make widget work remove after nav changes in 1.4
	var href,
		ele = "";
	$( document ).on( "click", "a", function( e ) {
		href = $( this ).attr( "href" );
		var hash = $.mobile.path.parseUrl( href );
		if( typeof href !== "undefined" && hash !== "" && href !== href.replace( hash,"" ) && hash.search( "/" ) !== -1 ){
			//remove the hash from the link to allow normal loading of the page.
			var newHref = href.replace( hash,"" );
			$( this ).attr( "href", newHref );
		}
		ele = $( this );
	});
	$( document ).on( "pagebeforechange", function( e, f ){
			f.originalHref = href;
	});
	$( document ).on("pagebeforechange", function( e,f ){
		var hash = $.mobile.path.parseUrl(f.toPage).hash,
			hashEl, hashElInPage;

		try {
			hashEl = $( hash );
		} catch( e ) {
			hashEl = $();
		}

		try {
			hashElInPage = $( ".ui-page-active " + hash );
		} catch( e ) {
			hashElInPage = $();
		}

		if( typeof hash !== "undefined" &&
			hash.search( "/" ) === -1 &&
			hash !== "" &&
			hashEl.length > 0 &&
			!hashEl.hasClass( "ui-page" ) &&
			!hashEl.hasClass( "ui-popup" ) &&
			hashEl.data('role') !== "page" &&
			!hashElInPage.hasClass( "ui-panel" ) &&
			!hashElInPage.hasClass( "ui-popup" ) ) {
			//scroll to the id
			var pos = hashEl.offset().top;
			$.mobile.silentScroll( pos );
			$.mobile.navigate( hash, '', true );
		} else if( typeof f.toPage !== "object" &&
			hash !== "" &&
			$.mobile.path.parseUrl( href ).hash !== "" &&
			!hashEl.hasClass( "ui-page" ) && hashEl.attr('data-role') !== "page" &&
			!hashElInPage.hasClass( "ui-panel" ) &&
			!hashElInPage.hasClass( "ui-popup" ) ) {
			$( ele ).attr( "href", href );
			$.mobile.document.one( "pagechange", function() {
				if( typeof hash !== "undefined" &&
					hash.search( "/" ) === -1 &&
					hash !== "" &&
					hashEl.length > 0 &&
					hashElInPage.length > 0 &&
					!hashEl.hasClass( "ui-page" ) &&
					hashEl.data('role') !== "page" &&
					!hashElInPage.hasClass( "ui-panel" ) &&
					!hashElInPage.hasClass( "ui-popup" ) ) {
					hash = $.mobile.path.parseUrl( href ).hash;
					var pos = hashElInPage.offset().top;
					$.mobile.silentScroll( pos );
				}
			} );
		}
	});
	$( document ).on( "mobileinit", function(){
		hash = window.location.hash;
		$.mobile.document.one( "pageshow", function(){
			var hashEl, hashElInPage;

			try {
				hashEl = $( hash );
			} catch( e ) {
				hashEl = $();
			}

			try {
				hashElInPage = $( ".ui-page-active " + hash );
			} catch( e ) {
				hashElInPage = $();
			}

			if( hash !== "" &&
				hashEl.length > 0 &&
				hashElInPage.length > 0 &&
				hashEl.attr('data-role') !== "page" &&
				!hashEl.hasClass( "ui-page" ) &&
				!hashElInPage.hasClass( "ui-panel" ) &&
				!hashElInPage.hasClass( "ui-popup" ) &&
				!hashEl.is( "body" ) ){
				var pos = hashElInPage.offset().top;
				setTimeout( function(){
					$.mobile.silentScroll( pos );
				}, 100 );
			}
		});
	});
	//h2 widget
	$( document ).on( "mobileinit", function(){
		$.widget( "mobile.h2linker", {
			options:{
				initSelector: ":jqmData(quicklinks='true')"
			},

			_create:function(){
				var self = this,
					bodyid = "ui-page-top",
					panel = "<div data-role='panel' class='jqm-nav-panel jqm-quicklink-panel' data-position='right' data-display='overlay' data-theme='a'><ul data-role='listview' data-inset='false' data-theme='a' data-divider-theme='a' data-icon='false' class='jqm-list'><li data-role='list-divider'>Quick Links</li></ul></div>",
					first = true,
					h2dictionary = new Object();
					if(typeof $("body").attr("id") === "undefined"){
						$("body").attr("id",bodyid);
					} else {
						bodyid =  $("body").attr("id");
					}
					this.element.find("div.jqm-content>h2").each(function(){
						var id, text = $(this).text();

						if(typeof $(this).attr("id") === "undefined"){
							id = text.replace(/[^\.a-z0-9:_-]+/gi,"");
							$(this).attr( "id", id );
						} else {
							id = $(this).attr("id");
						}

						h2dictionary[id] =  text;
						if(!first){
							$(this).before( "<a href='#" + bodyid + "' class='jqm-deeplink ui-icon-carat-u ui-alt-icon'>Top</a>");
						} else {
							$(this).before("<a href='#' data-ajax='false' class='jqm-deeplink jqm-open-quicklink-panel ui-icon-carat-l ui-alt-icon'>Quick Links</a>");
						}
						first = false;
					});
					this._on(".jqm-open-quicklink-panel", {
						"click": function(){
							$(".ui-page-active .jqm-quicklink-panel").panel("open");
							return false;
						}
					});
					this._on( document, {
						"pagebeforechange": function(){
							this.element.find(".jqm-quicklink-panel").panel("close");
							this.element.find(".jqm-quicklink-panel .ui-btn-active").removeClass("ui-btn-active");
						}
					});
					if( $(h2dictionary).length > 0 ){
						this.element.prepend(panel)
						this.element.find(".jqm-quicklink-panel").panel().find("ul").listview();
					}
					$.each(h2dictionary,function(id,text){
						self.element.find(".jqm-quicklink-panel ul").append("<li><a href='#"+id+"'>"+text+"</a></li>");
					});
					self.element.find(".jqm-quicklink-panel ul").listview("refresh");

			}
		});
	});
	$( document ).bind( "pagecreate create", function( e ) {
		var initselector = $.mobile.h2linker.prototype.options.initSelector;
		if($(e.target).data("quicklinks")){
			$(e.target).h2linker();
		}
	});
})( jQuery );

// Turn off Ajax for local file browsing
if ( location.protocol.substr(0,4)  === 'file' ||
     location.protocol.substr(0,11) === '*-extension' ||
     location.protocol.substr(0,6)  === 'widget' ) {

	// Start with links with only the trailing slash and that aren't external links
	var fixLinks = function() {
		$( "a[href$='/'], a[href='.'], a[href='..']" ).not( "[rel='external']" ).each( function() {
			if( !$( this ).attr( "href" ).match("http") ){
				this.href = $( this ).attr( "href" ).replace( /\/$/, "" ) + "/index.html";
			}
		});
	};

	// Fix the links for the initial page
	$( fixLinks );

	// Fix the links for subsequent ajax page loads
	$( document ).on( "pagecreate", fixLinks );

	// Check to see if ajax can be used. This does a quick ajax request and blocks the page until its done
	$.ajax({
		url: '.',
		async: false,
		isLocal: true
	}).error(function() {
		// Ajax doesn't work so turn it off
		$( document ).on( "mobileinit", function() {
			$.mobile.ajaxEnabled = false;

			var message = $( '<div>' , {
				'class': "jqm-content",
				style: "border:none; padding: 10px 15px; overflow: auto;",
				'data-ajax-warning': true
			});

			message
			.append( "<h3>Note: Navigation may not work if viewed locally</h3>" )
			.append( "<p>The Ajax-based navigation used throughout the jQuery Mobile docs may need to be viewed on a web server to work in certain browsers. If you see an error message when you click a link, please try a different browser.</p>" );

			$( document ).on( "pagecreate", function( event ) {
				$( event.target ).append( message );
			});
		});
	});
}

$( document ).on( "pagecreate", ".jqm-demos", function( event ) {
	var search,
		page = $( this ),
		that = this,
		searchUrl = ( $( this ).hasClass( "jqm-home" ) ) ? "_search/" : "../_search/",
		searchContents = $( ".jqm-search ul.jqm-list" ).find( "li:not(.ui-collapsible)" ),
		version = $.mobile.version || "dev",
		words = version.split( "-" ),
		ver = words[0],
		str = words[1] || "",
		text = ver;

	// Insert jqm version in header
	if ( str.indexOf( "rc" ) == -1 ) {
		str = str.charAt( 0 ).toUpperCase() + str.slice( 1 );
	} else {
		str = str.toUpperCase().replace( ".", "" );
	}

	if ( $.mobile.version && str ) {
		text += " " + str;
	}

	$( ".jqm-version" ).html( text );

	// Global navmenu panel
	$( ".jqm-navmenu-panel ul" ).listview();

	$( document ).on( "panelopen", ".jqm-search-panel", function() {
		$( this ).find( "input" ).focus();
	})

	$( ".jqm-navmenu-link" ).on( "click", function() {
		page.find( ".jqm-navmenu-panel:not(.jqm-panel-page-nav)" ).panel( "open" );
	});

	// Turn off autocomplete / correct for demos search
	$( this ).find( ".jqm-search input" ).attr( "autocomplete", "off" ).attr( "autocorrect", "off" );

	// Global search
	$( ".jqm-search-link" ).on( "click", function() {
		page.find( ".jqm-search-panel" ).panel( "open" );
	});

	// Initalize search panel list and filter also remove collapsibles
	$( this ).find( ".jqm-search ul.jqm-list" ).html( searchContents ).listview({
		inset: false,
		theme: null,
		dividerTheme: null,
		icon: false,
		autodividers: true,
		autodividersSelector: function ( li ) {
			return "";
		},
		arrowKeyNav: true,
		enterToNav: true,
		highlight: true,
		submitTo: searchUrl
	}).filterable();

	// Initalize search page list and remove collapsibles
	$( this ).find( ".jqm-search-results-wrap ul.jqm-list" ).html( searchContents ).listview({
		inset: true,
		theme: null,
		dividerTheme: null,
		icon: false,
		arrowKeyNav: true,
		enterToNav: true,
		highlight: true
	}).filterable();

	// Fix links on homepage to point to sub directories
	if ( $( event.target ).hasClass( "jqm-home") ) {
		$( this ).find( "a" ).each( function() {
			$( this ).attr( "href", $( this ).attr( "href" ).replace( "../", "" ) );
		});
	}

	// Search results page get search query string and enter it into filter then trigger keyup to filter
	if ( $( event.target ).hasClass( "jqm-demos-search-results") ) {
		search = $.mobile.path.parseUrl( window.location.href ).search.split( "=" )[ 1 ];
		setTimeout(function() {
			e = $.Event( "keyup" );
			e.which = 65;
			$( that ).find( ".jqm-content .jqm-search-results-wrap input" ).val( search ).trigger(e).trigger( "change" );
		}, 0 );
	}
});

// Append keywords list to each list item
$( document ).one( "pagecreate", ".jqm-demos", function( event ) {
	$( this ).find( ".jqm-search-results-list li, .jqm-search li" ).each(function() {
		var text = $( this ).attr( "data-filtertext" );

		$( this )
			.find( "a" )
			.append( "<span class='jqm-search-results-keywords ui-li-desc'>" + text + "</span>" );
	});
});

// Functions for highlighting text used for keywords highlight in search
jQuery.fn.highlight = function( pat ) {
	function innerHighlight( node, pat ) {
		var skip = 0;
		if ( node.nodeType == 3 ) {
			var pos = node.data.toUpperCase().indexOf( pat );
			if ( pos >= 0 ) {
				var spannode = document.createElement( "span" );
				spannode.className = "jqm-search-results-highlight";
				var middlebit = node.splitText( pos );
				var endbit = middlebit.splitText( pat.length );
				var middleclone = middlebit.cloneNode( true );
				spannode.appendChild( middleclone );
				middlebit.parentNode.replaceChild( spannode, middlebit );
				skip = 1;
			}
		} else if ( node.nodeType == 1 && node.childNodes && !/(script|style)/i.test( node.tagName ) ) {
			for ( var i = 0; i < node.childNodes.length; ++i ) {
				i += innerHighlight( node.childNodes[i], pat );
			}
		}
		return skip;
	}
	return this.length && pat && pat.length ? this.each(function() {
		innerHighlight( this, pat.toUpperCase() );
	}) : this;
};

// Function to remove highlights in text
jQuery.fn.removeHighlight = function() {
	return this.find( "span.jqm-search-results-highlight" ).each(function() {
		this.parentNode.firstChild.nodeName;
		with ( this.parentNode ) {
			replaceChild( this.firstChild, this );
			normalize();
		}
	}).end();
};

// Extension to listview to add keyboard navigation
$( document ).on( "mobileinit", function() {
	(function( $, undefined ) {

	$.widget( "mobile.listview", $.mobile.listview, {
		options: {
			arrowKeyNav: false,
			enterToNav: false,
			highlight: false,
			submitTo: false
		},
		_create: function() {
			this._super();

			if ( this.options.arrowKeyNav ) {
				this._on( document, { "pageshow": "arrowKeyNav" });
			}

			if ( this.options.enterToNav ) {
				this._on( document, { "pageshow": "enterToNav" });
			}

		},
		submitTo: function() {
			var url,
				form = this.element.parent().find( "form" );

			form.attr( "method", "get" )
				.attr( "action", this.options.submitTo );

			url = this.options.submitTo + "?search=" + this.element.parent().find( "input" ).val();

			window.location =  url;
		},
		enterToNav: function() {
			var form = this.element.parent().find( "form" );

			form.append( "<button type='submit' data-icon='carat-r' data-inline='true' class='ui-hidden-accessible' data-iconpos='notext'>Submit</button>" )
				.parent()
				.trigger( "create" );

			this.element.parent().find( "form" ).children( ".ui-btn" ).addClass( "ui-hidden-accessible" );

			this._on( form, {
				"submit": "submitHandler"
			});
		},
		enhanced: false,
		arrowKeyNav: function() {
			var input = this.element.prev("form").find( "input" );

			if ( !this.enhanced ) {
				this._on( input, {
					"keyup": "handleKeyUp"
				});

				this.enhanced = true;
			}
		},
		handleKeyUp: function( e ) {
			var search,
				input = this.element.prev("form").find( "input" );

			if ( e.which === $.ui.keyCode.DOWN ) {
				if ( this.element.find( "li.ui-btn-active" ).length === 0 ) {
					this.element.find( "li:first" ).toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				} else {
					this.element.find( "li.ui-btn-active a" ).toggleClass( "ui-btn-active");
					this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).next().toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				}

				this.highlightDown();
			} else if ( e.which === $.ui.keyCode.UP ) {
				if ( this.element.find( "li.ui-btn-active" ).length !== 0 ) {
					this.element.find( "li.ui-btn-active a" ).toggleClass( "ui-btn-active");
					this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).prev().toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				} else {
					this.element.find( "li:last" ).toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				}
				this.highlightUp();
			} else if ( typeof e.which !== "undefined" ) {
				this.element.find( "li.ui-btn-active" ).removeClass( "ui-btn-active" );

				if ( this.options.highlight ) {
					search = input.val();

					this.element.find( "li" ).each(function() {
						$( this ).removeHighlight();
						$( this ).highlight( search );
					});
				}
			}
		},
		submitHandler: function() {
			if ( this.element.find( "li.ui-btn-active" ).length !== 0 ) {
				var href = this.element.find( "li.ui-btn-active a" ).attr( "href" );

				$( ":mobile-pagecontainer" ).pagecontainer( "change", href );
				return false;
			}

			if ( this.options.submitTo ) {
				this.submitTo();
			}
		},
		highlightDown: function() {
			if ( this.element.find( "li.ui-btn-active" ).hasClass( "ui-screen-hidden" ) ) {
				this.element.find( "li.ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).next().toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				this.highlightDown();
			}
			return;
		},
		highlightUp: function() {
			if ( this.element.find( "li.ui-btn-active" ).hasClass( "ui-screen-hidden" ) ) {
				this.element.find( "li.ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).prev().toggleClass( "ui-btn-active" ).find("a").toggleClass( "ui-btn-active" );
				this.highlightUp();
			}
			return;
		}
	});
})( jQuery );

});

// View demo source code

function attachPopupHandler( popup, sources ) {
	popup.one( "popupbeforeposition", function() {
		var
			collapsibleSet = popup.find( "[data-role='collapsibleset']" ),
			collapsible, pre;

		$.each( sources, function( idx, options ) {
			collapsible = $( "<div data-role='collapsible' data-collapsed='true' data-theme='" + options.theme + "' data-iconpos='right' data-collapsed-icon='carat-l' data-expanded-icon='carat-d' data-content-theme='b'>" +
					"<h1>" + options.title + "</h1>" +
					"<pre class='brush: " + options.brush + ";'></pre>" +
				"</div>" );
			pre = collapsible.find( "pre" );
			pre.append( options.data.replace( /</gmi, '&lt;' ) );
			collapsible
				.appendTo( collapsibleSet )
				.on( "collapsiblecollapse", function() {
					popup.popup( "reposition", { positionTo: "window" } );
				})
				.on( "collapsibleexpand", function() {
					var doReposition = true;

					collapsibleSet.find( ":mobile-collapsible" ).not( this ).each( function() {
						if ( $( this ).collapsible( "option", "expanded" ) ) {
							doReposition = false;
						}
					});

					if ( doReposition ) {
						popup.popup( "reposition", { positionTo: "window" } );
					}
				});
			SyntaxHighlighter.highlight( {}, pre[ 0 ] );
		});

		collapsibleSet.find( "[data-role='collapsible']" ).first().attr( "data-collapsed", "false" );
		popup.trigger( "create" );
	});
}

function getSnippet( type, selector, source ) {
	var text = "", el, absUrl, hash;

	if ( selector === "true" ) {
		selector = "";
	}

	// First, try to grab a tag in this document
	if ( !$.mobile.path.isPath( selector ) ) {
		el = source.find( type + selector );
		// If this is not an embedded style, try a stylesheet reference
		if ( el.length === 0 && type === "style" ) {
			el = source.find( "link[rel='stylesheet']" + selector );
		}
		text = $( "<div></div>" ).append( el.contents().clone() ).html();
		if ( !text ) {
			text = "";
			selector = el.attr( "href" ) || el.attr( "src" ) || "";
		}
	}

	// If not, try to SJAX in the document referred to by the selector
	if ( !text && selector ) {
		absUrl = $.mobile.path.makeUrlAbsolute( selector );
		hash = $.mobile.path.parseUrl( absUrl ).hash;

		// selector is a path to SJAX in
		$.ajax( absUrl, { async: false, dataType: "text" } )
			.success( function( data, textStatus, jqXHR ) {
				text = data;
				// If there's a hash we assume this is an HTML document that has a tag
				// inside whose ID is the hash
				if ( hash ) {
					text = $( "<div></div>" ).append( $( data ).find( hash ).contents().clone() ).html();
				}
			});
	}

	return text;
}

$( document ).bind( "pagebeforechange", function( e, data ) {
	var popup, sources;
	if ( data.options && data.options.role === "popup" && data.options.link ) {
		sources = data.options.link.jqmData( "sources" );
		if ( sources ) {
			popup = $( "<div id='jqm-view-source' class='jqm-view-source' data-role='popup' data-theme='none' data-position-to='window'>" +
								"<div data-role='collapsibleset' data-inset='true'></div>" +
							"</div>" );

			attachPopupHandler( popup, sources );
			popup
				.appendTo( $.mobile.activePage )
				.popup()
				.bind( "popupafterclose", function() {
					popup.remove();
				})
				.popup( "open" );

			e.preventDefault();
		}
	}
});


/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */

(function($) {
	var types = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
		for ( var i=types.length; i; ) {
			$.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
		}
	}
	$.event.special.mousewheel = {
		setup: function() {
			if ( this.addEventListener ) {
				for ( var i=types.length; i; ) {
					this.addEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = handler;
			}
		},
		teardown: function() {
			if ( this.removeEventListener ) {
				for ( var i=types.length; i; ) {
					this.removeEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = null;
			}
		}
	};
	$.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},

		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}
	});
	function handler(event) {
		var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
		event = $.event.fix(orgEvent);
		event.type = "mousewheel";

		// Old school scrollwheel delta
		if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
		if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
		// New school multidimensional scroll (touchpads) deltas
		deltaY = delta;
		// Gecko
		if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
			deltaY = 0;
			deltaX = -1*delta;
		}
		// Webkit
		if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
		if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
		// Add event and delta to the front of the arguments
		args.unshift(event, delta, deltaX, deltaY);

		return ($.event.dispatch || $.event.handle).apply(this, args);
	}
})(jQuery);
