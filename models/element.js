/*
 * element.js DOM Element Model v0.0.1 for Internet Explorer < 8
 *
 * Copyright 2012, Dmitriy Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 22-04-2012
 */

(function( window, undefined ) {

	"use strict";

	var document = window.document;

	if ( !window.Element && document.attachEvent ) {

		window.Element = function(){}

		var ready = false,
			__getElementById = document.getElementById,
			__createElement = document.createElement,
			__createDocumentFragment = document.createDocumentFragment;

		var copyMethod = function( elem ) {
			if ( elem && elem.nodeType === 1 && !elem.prototypeAdded ) {
				for( var key in window.Element.prototype ) {
					if ( Object.prototype.hasOwnProperty.call( window.Element.prototype, key ) ) {
						elem[ key ] = window.Element.prototype[ key ];
					}
				}
				elem.attachEvent( "onpropertychange", propChange );
				elem.prototypeAdded = 1;
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
