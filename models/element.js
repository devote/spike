/*
 * element.js DOM Element Model v0.1.3 for Internet Explorer < 8
 *
 * Copyright 2012, Dmitriy Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 09-05-2012
 */

(function( window, undefined ) {

	"use strict";

	var document = window.document;

	// if not exists Element interface
	if ( !window.Element && document.attachEvent ) {

		var ready = false,
		    // save originals methods
		    __getElementById = document.getElementById,
		    __getElementsByTagName = document.getElementsByTagName,
		    __createElement = document.createElement,
		    __createDocumentFragment = document.createDocumentFragment,
		    __attachEvent = document.attachEvent,
		    // cache for new elements, it no parent
		    newElements = [],
		    // for store the method names
		    prototypeNames = [],
		    // for store index on method names
		    prototypeIndexes = {},
		    // interface Element
		    Element = function(){},
		    proto,

		// intercept change element content
		propChange = function() {
			if ( window.event.propertyName === "innerHTML" ) {
				addMethods( window.event.srcElement );
			}
		},

		// set methods from prototype Element to new/all element
		addMethods = function( elems, methodName, only ) {

			var i = prototypeNames.length,
			    l, idx, name, elem;

			if ( elems && elems.nodeType || !elems ) {
				elems = elems && elems.getElementsByTagName( '*' ) || __getElementsByTagName( '*' );
			}

			for( l = elems.length; elem = elems[ --l ]; ) {

				if ( elem.nodeType === 1 ) {

					// if element is attached in DOM object, remove him from cache
					if ( elem.$_sIdx && elem.parentNode &&
						elem.document && elem.document.nodeType !== 11 ) {

						// remove attached element from cache
						newElements.splice( --elem.$_sIdx, 1 );
						// shifting indices elements in cache
						for( ; idx = newElements[ elem.$_sIdx++ ]; ) {
							idx.$_sIdx = elem.$_sIdx;
						}
						// remove index
						elem.$_sIdx = undefined;
					}

					if ( !only || only === elem ) {

						if ( methodName ) {
							if ( elem[ methodName ] !== proto[ methodName ] ) {
								elem[ methodName ] = proto[ methodName ];
							}
						} else {
							for( idx = i; name = prototypeNames[ --idx ]; ) {
								if ( elem[ name ] !== proto[ name ] ) {
									elem[ name ] = proto[ name ];
								}
							}
							if ( !elem.$_sOPC ) {
								elem.$_sOPC = 1;
								elem.attachEvent( "onpropertychange", propChange );
							}
						}
					}
				}
			}

			return elems[ 0 ] || null;
		}

		Element.prototype = proto = document.createComment( "" );

		proto.attachEvent( 'onpropertychange', function() {

			var name = window.event.propertyName;

			// if the property does not exist in the list
			if ( prototypeIndexes[ name ] === undefined ) {
				// prototypeIndexes needed for optimization search name
				prototypeIndexes[ name ] = prototypeNames.push( name ) - 1;
			}

			// add new property to all elements in DOM object
			addMethods( document, name );
			// add new property for elements it added no in DOM object
			addMethods( newElements, name );

		});

		// append commentElement to DOM object for normally work
		// property change event in virtual Element model
		document.documentElement.firstChild.appendChild( proto );

		document.getElementById = function( id ) {
			return addMethods( [ __getElementById( id ) ] );
		}

		document.createElement = function( tagName ) {

			var elem = __createElement( tagName );
			// add new element to cache
			elem.$_sIdx = newElements.push( elem );

			addMethods( newElements, null, elem );

			return elem;
		}

		document.createDocumentFragment = function() {

			return addMethods( [  __createDocumentFragment() ] );
		}

		window.Element = Element;

		if ( document.readyState === "complete" ) {

			addMethods();
		} else {

			var DOMContentLoaded = function() {
				if ( !ready && document.readyState === "complete" ) {
					ready = true;
					document.detachEvent( "onreadystatechange", DOMContentLoaded );
					// restore the original methods after document status complete
					document.attachEvent = __attachEvent;
					document.getElementsByTagName = __getElementsByTagName;
					addMethods();
				}
			}

			__attachEvent( "onreadystatechange", DOMContentLoaded );
			window.attachEvent( "onload", DOMContentLoaded );

			// temporarily replace the original methods,
			// while the status of the document is not completed
			document.attachEvent = function( event, listener ) {
				// while loading a document, this method works temporarily
				if ( "onreadystatechange" === event ) {
					// if there is an attempt to set onreadystatechange event is our event
					// to move the latter, what would it work before others
					document.detachEvent( event, DOMContentLoaded );
					var result = __attachEvent( event, listener );
					__attachEvent( event, DOMContentLoaded );
					return result;
				}
				return __attachEvent( event, listener );
			}

			// temporarily replace the original methods
			document.getElementsByTagName = function( tagName ) {
				// while loading a document, this method works temporarily
				addMethods();
				return __getElementsByTagName( tagName );
			}
		}
	}

})( window );
