/*
 * element.js DOM Element Model v0.0.2 for Internet Explorer < 8
 *
 * Copyright 2012, Dmitriy Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 23-04-2012
 */

(function( window, undefined ) {

	"use strict";

	var document = window.document;

	if ( !window.Element && document.attachEvent ) {

		var ready = false,
			__getElementById = document.getElementById,
			__createElement = document.createElement,
			__createDocumentFragment = document.createDocumentFragment,
			prototype = {},
			Element = function(){}

		Element.prototype = document.createComment( "" );
		Element.prototype.attachEvent( 'onpropertychange', function() {

			var name = window.event.propertyName;

			prototype[ name ] = 1;

			var elems = document.getElementsByTagName( '*' );

			for( var l = elems.length; elem = elems[ --l ]; ) {
				if ( elem.nodeType === 1 ) {
					elem[ name ] = Element.prototype[ name ];
				}
			}
		});
		document.documentElement.firstChild.appendChild( Element.prototype );

		window.Element = Element;

		var copyMethod = function( elem ) {
			if ( elem && elem.nodeType === 1 ) {
				for( var key in prototype ) {
					if ( Object.prototype.hasOwnProperty.call( prototype, key ) ) {
						elem[ key ] = Element.prototype[ key ];
					}
				}
				elem.attachEvent( "onpropertychange", propChange );
			}
			return elem;
		}

		var propChange = function( e ) {
			e = e || window.event;
			if ( e.propertyName === "innerHTML" ) {
				var elems = copyMethod( e.target || e.srcElement ).getElementsByTagName( '*' );
				for( var l = elems.length; copyMethod( elems[ --l ] ); ) {}
			}
		}

		var ie7setMethods = function() {
			if ( ready ) {
				return;
			}
			ready = true;
			var elems = document.getElementsByTagName( '*' );
			for( var l = elems.length; copyMethod( elems[ --l ] ); ) {}
		}

		document.getElementById = function( id ) {
			return copyMethod( __getElementById( id ) );
		}

		document.createElement = function( tagName ) {
			return copyMethod( __createElement( tagName ) );
		}

		document.createDocumentFragment = function() {
			return copyMethod( __createDocumentFragment() );
		}

		if ( document.readyState === "complete" ) {

			ie7setMethods();
		} else {

			var __attachEvent = document.attachEvent,
				readystate = function(){
					if ( document.readyState === "complete" ) {
						document.detachEvent( "onreadystatechange", readystate );
						ie7setMethods();
						document.attachEvent = __attachEvent;
					}
				}

			document.attachEvent = function( event, listener ) {
				if ( "onreadystatechange" === event ) {
					document.detachEvent( event, readystate );
					var result = __attachEvent( event, listener );
					__attachEvent( event, readystate );
					return result;
				}
				return __attachEvent( event, listener );
			}

			__attachEvent( "onreadystatechange", readystate );

			window.attachEvent( "onload", ie7setMethods );
		}
	}

})( window );
