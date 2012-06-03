/*
 * spike for IE JavaScript Library v0.1.1
 *
 * Copyright 2012, Dmitriy Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 24-05-2012
 *
 * element.js DOM Element Model v0.1.3 for Internet Explorer < 8
 */

(function( window, undefined ) {

	"use strict";

	var document = window.document;

	if ( !window.Element && document.attachEvent ) {

		var ready = false,
		    __getElementById = document.getElementById,
		    __getElementsByTagName = document.getElementsByTagName,
		    __createElement = document.createElement,
		    __createDocumentFragment = document.createDocumentFragment,
		    __attachEvent = document.attachEvent,
		    newElements = [],
		    prototypeNames = [],
		    prototypeIndexes = {},
		    Element = function(){},
		    proto,

		propChange = function() {
			if ( window.event.propertyName === "innerHTML" ) {
				addMethods( window.event.srcElement );
			}
		},

		addMethods = function( elems, methodName, only ) {

			var i = prototypeNames.length,
			    l, idx, name, elem;

			if ( elems && elems.nodeType || !elems ) {
				elems = elems && elems.getElementsByTagName( '*' ) || __getElementsByTagName( '*' );
			}

			for( l = elems.length; elem = elems[ --l ]; ) {

				if ( elem.nodeType === 1 ) {

					if ( elem.$_sIdx && elem.parentNode &&
						elem.document && elem.document.nodeType !== 11 ) {

						newElements.splice( --elem.$_sIdx, 1 );
						for( ; idx = newElements[ elem.$_sIdx++ ]; ) {
							idx.$_sIdx = elem.$_sIdx;
						}
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

			if ( prototypeIndexes[ name ] === undefined ) {
				prototypeIndexes[ name ] = prototypeNames.push( name ) - 1;
			}

			addMethods( document, name );
			addMethods( newElements, name );

		});

		document.documentElement.firstChild.appendChild( proto );

		document.getElementById = function( id ) {
			return addMethods( [ __getElementById( id ) ] );
		}

		document.createElement = function( tagName ) {

			var elem = __createElement( tagName );
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
					document.attachEvent = __attachEvent;
					document.getElementsByTagName = __getElementsByTagName;
					addMethods();
				}
			}

			__attachEvent( "onreadystatechange", DOMContentLoaded );
			window.attachEvent( "onload", DOMContentLoaded );

			document.attachEvent = function( event, listener ) {
				if ( "onreadystatechange" === event ) {
					document.detachEvent( event, DOMContentLoaded );
					var result = __attachEvent( event, listener );
					__attachEvent( event, DOMContentLoaded );
					return result;
				}
				return __attachEvent( event, listener );
			}

			document.getElementsByTagName = function( tagName ) {
				addMethods();
				return __getElementsByTagName( tagName );
			}
		}
	}

})( window );

/*
 * events.js DOM Event Model v0.0.2 for Internet Explorer
 */
(function( window, undefined ) {

	"use strict";

	var Element = window.Element,
		document = window.document,
		html = document.documentElement,
		spike = window.spike || {},
		listenersList = {},
		supportCapturing = {
			click: 1, dblclick: 1, keydown: 1, keypress: 1, keyup: 1, mousedown: 1,
			mousemove: 1, mouseup: 1, mouseover: 1, mouseout: 1
		},
		eventReplace = {
			"DOMContentLoaded": {
				name: "readystatechange",
				rule: function() {
					if ( document.readyState === "complete" ) {
						return true;
					}
					return false;
				}
			}
		}

	spike.Event = function( type ) {

		var self = this,
			body = document.body;

		if ( self.srcElement === undefined || self.button === undefined ) {
			return spike.Event.apply( document.createEventObject(), arguments );
		}

		if ( type !== undefined ) {
			self.type = type;
		}

		if ( self.pageX == null && self.clientX != null ) {
			self.pageX = self.clientX + ( html && html.scrollLeft || body && body.scrollLeft || 0 ) - ( html.clientLeft || 0 );
			self.pageY = self.clientY + ( html && html.scrollTop || body && body.scrollTop || 0 ) - ( html.clientTop || 0 );
		}

		self.target = self.target || self.srcElement;

		if ( self.target && (/3|4/).test( self.target.nodeType ) ) {
			self.target = self.target.parentNode;
		}

		self.currentTarget = self.currentTarget || null;

		self.eventPhase = self.eventPhase || self.target == self.currentTarget ? spike.Event.AT_TARGET : spike.Event.BUBBLING_PHASE;

		self.bubbles = self.bubbles || false;
		self.cancelable = self.cancelable || false;
		self.timeStamp = self.timeStamp || ( new Date() ).getTime();
		self.defaultPrevented = self.defaultPrevented || false;
		self.isTrusted = self.isTrusted || false;
		self.detail = self.detail || null;
		self.view = self.view || null;

		self.metaKey = self.metaKey || false;

		self.relatedTarget = self.relatedTarget ||
					self.type == 'mouseout' ? self.toElement :
					self.type == 'mouseover' ? self.fromElement : null;

		self.layerX = self.layerX || self.offsetX;
		self.layerY = self.layerY || self.offsetY;

		self.which = self.which && self.button & 1 ? 1 : ( self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0 ) );

		self.isDefaultPrevented = false;
		self.isPropagationStopped = false;
		self.isImmediatePropagationStopped = false;

		self.preventDefault = function() {
			self.isDefaultPrevented = true;
			self.returnValue = false;
		}
		self.stopPropagation = function() {
			self.isPropagationStopped = true;
			self.cancelBubble = true;
		}
		self.stopImmediatePropagation = function() {
			self.isImmediatePropagationStopped = true;
			self.stopPropagation();
		}

		return self;
	}

	spike.Event.CAPTURING_PHASE = 1;
	spike.Event.AT_TARGET = 2;
	spike.Event.BUBBLING_PHASE = 3;

	spike.createEvent = function( type ) {

		var o = new spike.Event();

		o[ "init" + type ] = function( eventType, canBubble, cancelable, view, detail, screenX, screenY,
										clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget ) {
			var self = this;

			self.type = eventType;
			self.canBubble = canBubble;
			self.cancelable = cancelable;

			if ( type !== "Event" ) {
				self.detail = type === "CustomEvent" ? view : detail;
			}

			if ( type === "UIEvent" ) {
				self.view = view;
			}

			if ( type === "MouseEvent" ) {
				self.view = view;
				self.screenX = screenX;
				self.screenY = screenY;
				self.clientX = clientX;
				self.clientY = clientY;
				self.ctrlKey = ctrlKey;
				self.altKey = altKey;
				self.shiftKey = shiftKey;
				self.metaKey = metaKey;
				self.button = button;
				self.relatedTarget = relatedTarget;
			}
		}

		return o;
	}

	var executeListener = function( e, listener ) {

		e.currentTarget = listener.elem;

		e.eventPhase = e.target == e.currentTarget ?
			spike.Event.AT_TARGET : listener.capture ?
				spike.Event.CAPTURING_PHASE : spike.Event.BUBBLING_PHASE;

		if ( e.isPropagationStopped === false ||
			( listener.elem === e._propagationStoppedElem &&
				e.eventPhase === e._propagationStoppedPhase ) ) {

			if ( listener.listener.call( listener.elem, e ) === false ) {
				e.preventDefault();
			}

			if ( e.isPropagationStopped === true && !e._propagationStoppedPhase ) {
				e._propagationStoppedPhase = e.eventPhase;
				e._propagationStoppedElem = listener.elem;
			}

			if ( e.isImmediatePropagationStopped === true ) {
				return false;
			}
		}
	}

	spike.addEventListener = function( event, listener, capture ) {

		var _event = eventReplace[ event ] ? eventReplace[ event ].name : event;

		if ( supportCapturing[ event ] === 1 ) {

			document.attachEvent( "on" + _event, ( supportCapturing[ event ] = function( e ) {

				var i = 0, listener,
					targets = supportCapturing[ event ].targets,
					l = targets.length;

				e = spike.Event.call( e || window.event );

				for( ; listener = targets[ i++ ]; ) {

					if ( executeListener( e, listener ) === false ) {
						break;
					}
				}

				e._propagationStoppedElem = null;

				targets.length = 0;

				if ( e.isDefaultPrevented ) {
					return false;
				}
			}));

			supportCapturing[ event ].targets = [];
		}

		listenersList[ event ] = listenersList[ event ] || [];

		var rule;

		listenersList[ event ].push( rule = {
			listener: listener,
			capture: capture,
			elem: this,
			index: ( listenersList[ event ].eventIndex = ++listenersList[ event ].eventIndex || 0 ),
			proxy: function( e ) {

				if ( supportCapturing[ event ] ) {

					var targets = supportCapturing[ event ].targets,
						prevRule, l = targets.length, i = 0;

					if ( capture ) {

						while( ( prevRule = targets[ i++ ] ) && prevRule.elem === rule.elem &&
								prevRule.capture && prevRule.index < rule.index ) {}

						targets.splice( --i, 0, rule );
					} else {

						while( ( prevRule = targets[ --l ] ) && prevRule.elem === rule.elem &&
								!prevRule.capture && prevRule.index > rule.index ) {}

						targets.splice( ++l, 0, rule );
					}
				} else {

					if ( _event === event || eventReplace[ event ].rule() ) {

						executeListener( spike.Event.call( e || window.event ), rule );

						if ( e.isDefaultPrevented ) {
							return false;
						}
					}
				}
			}
		});

		return this.attachEvent( "on" + _event, rule.proxy );
	}

	spike.removeEventListener = function( event, listener, capture ) {
		if ( listenersList[ event ] ) {
			for( var l, i = listenersList[ event ].length; l = listenersList[ event ][ --i ]; ) {
				if ( listener === l.listener && capture == l.capture && this === l.elem ) {
					this.detachEvent( "on" + ( eventReplace[ event ] ? eventReplace[ event ].name : event ), l.proxy );
					l.listener = l.proxy = l.elem = l = null;
					listenersList[ event ].splice( i, 1 );
					return true;
				}
			}
		}
		return false;
	}

	spike.dispatchEvent = function( o ) {

		try {
			return this.fireEvent( "on" + ( eventReplace[ o.type ] ? eventReplace[ o.type ].name : o.type ), o );
		} catch( _e_ ) {

			if ( listenersList[ o.type ] ) {

				var i, listener, list = listenersList[ o.type ];

				for( i = 0; listener = list[ i++ ]; ) {

					if ( listener.capture && listener.elem === this &&
							executeListener( o, listener ) === false ) {
						break;
					}
				}

				if ( !o.isImmediatePropagationStopped ) {

					for( i = 0; listener = list[ i++ ]; ) {

						if ( !listener.capture && listener.elem === this &&
								executeListener( o, listener ) === false ) {
							break;
						}
					}
				}

				if ( o.isDefaultPrevented ) {
					return false;
				}
			}

			return true;
		}
	}

	window.spike = spike;

	if ( !window.addEventListener && window.attachEvent && Element ) {
		window.Event = spike.Event;
		document.createEvent = spike.createEvent;
		Element.prototype.addEventListener = document.addEventListener = window.addEventListener = spike.addEventListener;
		Element.prototype.removeEventListener = document.removeEventListener = window.removeEventListener = spike.removeEventListener;
		Element.prototype.dispatchEvent = document.dispatchEvent = window.dispatchEvent = spike.dispatchEvent;
	}

})( window );

/*
 * selectors.js CSS3 Selectors API for Internet Explorer v1.0.2
 */
(function( window, undefined ) {

	var
		document = window.document,
		Element = window["Element"],
		ElementProto = Element && Element.prototype,
		mqsa = /\s*(?:(\*|(?:(?:\*|[\w\-]+)\|)?(?:[\w\-]+|\*)))?(?:\[\s*(?:((?:[\w\-]+\|)?[\w\-]+)\s*((?:~|\^|\$|\*|\||!)?=)\s*)?((?:".*?(?:(?:[\\]{2}(?="))|[^\\])"|'.*?(?:(?:[\\]{2}(?='))|[^\\])'|[^\s\]]*)?)\s*(?:(i)\s*)?\])?(?:(\.|#)([\w\-]+))?(?:(:(?::)?)([\w\-]+)(?:\(\s*([^)]+)\s*\))?)?(?:(?:\s*(?=\s))?(?:(?:\s(?=,|>|\+|~))?([\s,>+~](?!$))|(\s*$))?)?/g,
		nativeQsa = document.querySelectorAll ? [ ElementProto.querySelectorAll, document.querySelectorAll ] : 0,

	attrHandle = {
		"href": function( elem ) {
			return elem.getAttribute( "href", 2 );
		},
		"type": function( elem ) {
			return elem.getAttribute( "type" );
		},
		"style": function( elem ) {
			var style = elem.getAttribute( "style" );
			if ( typeof style === "object" ) {
				return elem.style.cssText || "";
			} else {
				return style;
			}
		}
	},

	// pseudo filters
	filters = (function(){
		// calculate for :nth pseudo-class
		function calc( elem, rule, i ) {
			var diff = i - rule[ 1 ];

			if ( rule[ 0 ] === 0 ) {
				return diff === 0;
			}
			return ( diff % rule[ 0 ] === 0 && diff / rule[ 0 ] >= 0 );
		}

		var filters = {
			// filters for pseudo-classes
			":": {
				// pseudo-class nth at start
				"nth-child": function( elem, rule ) {
					return calc( elem, rule, elem.nodeIndex || 1 );
				},
				// pseudo-class nth at end
				"nth-last-child": function( elem, rule ) {
					var p = elem.parentNode,
						i = p && ( ( p._qsaCE || p.children.length || 0 ) + 1 ) || 2;
					return calc( elem, rule, i - ( elem.nodeIndex || 1 ) );
				},
				// first on parent
				"first-child": function( elem ) {
					elem = elem.previousSibling;
					return !( elem && ( elem.nodeType === 3 ? elem.previousSibling : 1 ) );
				},
				// last on parent
				"last-child": function( elem ) {
					elem = elem.nextSibling;
					return !( elem && ( elem.nodeType === 3 ? elem.nextSibling : 1 ) );
				},
				// if element is empty
				"empty": function( elem ) {
					return !elem.firstChild;
				},
				// if element enabled
				"enabled": function( elem ) {
					return elem.disabled === false && elem.type !== "hidden";
				},
				// if element not enabled
				"disabled": function( elem ) {
					return elem.disabled === true;
				},
				// if element is checked
				"checked": function( elem ) {
					return elem.checked === true;
				},
				//
				"not": function( elem, selector ) {
					if ( qSelector( selector, 0, 0, elem ).length > 0 ) {
						return false;
					}
					return true;
				},
				// contains
				"contains": function( elem, content ) {
					return ( elem.textContent || elem.innerText || elem.nodeValue || elem.value || "" ).indexOf( content ) >= 0;
				}
			},
			// filters pseudo-elements
			"::": {
				
			}
		}

		// if element only child
		filters[":"]["only-child"] = function( elem ) {
			return filters[":"]["first-child"]( elem ) && filters[":"]["last-child"]( elem );
		}

		return filters;
	})();

	function checkRule( elem, $1, $2, $3, $5, $6, $7, $9, pseudo, preparePseudo ) {

		var value, attr, parent, node;

		if ( $1 ) {

			value = (
				attr = attrHandle[ $1 ] ?
					attrHandle[ $1 ]( elem ) :
					elem[ $1 ] != null ?
					elem[ $1 ] :
					elem.getAttribute( $1 )
			) + "";

			if ( !( attr == null ?
				$2 === "!=" :
				$2 === "=" ?
				value === $3 :
				$2 === "*=" ?
				value.indexOf( $3 ) >= 0 :
				$2 === "~=" ?
				(" " + value + " ").indexOf( " " + $3 + " " ) >= 0 :
				!$3 || !$2 ?
				value && attr !== false :
				$2 === "!=" ?
				value !== $3 :
				$2 === "^=" ?
				value.indexOf( $3 ) === 0 :
				$2 === "$=" ?
				value.substr( value.length - $3.length ) === $3 :
				$2 === "|=" ?
				value === $3 || value.substr( 0, $3.length + 1 ) === $3 + "-" :
				false )
			) {
				return 0;
			}
		}

		if ( $5 === "." ) {
			if ( (" " + elem.className + " ").indexOf( $6 ) === -1 ) {
				return 0;
			}
		} else if ( $5 === "#" && elem.id !== $6 ) {
			return 0;
		}

		if ( $7 && pseudo ) {

			// prepare elements for nth
			// if success pre-filter, and not indexes, or change DOM, to index all again
			if ( preparePseudo && ( parent = elem.parentNode ) && ( !elem.nodeIndex || parent._qsaCL !== parent.children.length ) ) {
				value = 0;
				// index all childs
				for ( node = parent.firstChild; node; node = node.nextSibling ) {
					if ( node.nodeType === 1 ) {
						node.nodeIndex = ++value;
					}
				}
				// store child nums
				parent._qsaCE = value;
				// store count num elems on parent
				parent._qsaCL = parent.children.length;
			}

			if ( !pseudo( elem, $9 ) ) {
				return 0;
			}
		}

		return 1;
	}

	function prepareChunks( $0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $A, $B ) {

		var pseudo, preparePseudo = 0;

		// normalize namespace
		$0 = $0 && ( $0 === "*" ? "" : $0.replace( "|", ':' ).toUpperCase() );

		// remove quotes and slashes
		$3 = $3 && $3.replace( /^(?:"(.*)"|'(.*)')$/, '$1$2' ).replace( /\\/g, "" );

		// attribute name
		$1 = !$1 && $3 || $1;

		// mapping attribute
		$1 = $1 && $1 === "class" ? "className" : $1 === "for" ? "htmlFor" : $1;

		$6 = $5 === "." && " " + $6 + " " || $6;

		$A = $A || $B !== undefined && ",";

		if ( !( pseudo = filters[ $7 ] && filters[ $7 ][ $8 ] ) && $8 ) {
			throw new Error( "Unknown pseudo selector: " + $8 );
		}

		if ( pseudo && $9 ) {

			switch( $8 ) {
				case "nth-child":
				case "nth-last-child":
					var rule = $9.replace( /^\+|\s*/g, '' ),
						test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec( rule === "even" && "2n" || rule === "odd" && "2n+1" || !/\D/.test( rule ) && "0n+" + rule || rule );
					$9 = [ ( test[ 1 ] + ( test[ 2 ] || 1 ) ) - 0, test[ 3 ] - 0 ];
					preparePseudo = !( $9[ 0 ] === 1 && $9[ 1 ] === 0 );
					break;
				default:
					// restore stuff in parentheses
					$9 = $9.indexOf( String.fromCharCode( 1 ) ) > 0 ? $9.replace( /\x01/g, "(" ).replace( /\x02/g, ")" ) : $9;
			}
		}

		return [ $0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $A, $B, pseudo, preparePseudo ];
	}

	function prepareParentheses( selector, next ) {
		// preparing special pseudo-selectors with exist in parentheses the sub-selectors
		return selector.indexOf( '(' ) === -1 ? selector : next || selector.indexOf( ":not" ) !== -1 ?
			selector.replace( /([\s\S]*\([^\(]*)\(([^\(\)]*)\)([^\)]*\)[\s\S]*)/g, function( _, a, b, c ) {
				return prepareParentheses( a + String.fromCharCode( 1 ) + b + String.fromCharCode( 2 ) + c, 1 );
		}) : selector;
	}

	function qSelector( selector, context, seed, candidates, combinator ) {

		var i, length, elem, result = [], _min = -1, _max = -2, sourceIndex;

		context = context && ( context.nodeType ? [ context ] : context ) || [ document ];

		candidates = candidates && ( candidates.nodeType ? [ candidates ] : candidates ) || context;

		prepareParentheses( selector ).replace( mqsa, function( m, $0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $A, $B, index ) {

			/*
			* $0 - tag name
			* $1 - attribute name if exists value
			* $2 - attribute comparison ("=", "~=", "!=", etc.)
			* $3 - attribute value or name if not exists $1
			* $4 - attribute identifier, maybe only "i" Case-sensitivity added on CSS4
			* $5 - beginning special characters (".", "#")
			* $6 - name (id, class)
			* $7 - beginning special characters for pseudo (":", "::")
			* $8 - name pseudo
			* $9 - stuff in parentheses
			* $A - combinators (" ", "+", "~", ">")
			*/

			var 
				chunks, node, elems, parent, candidate, attr, value, pseudo,
				scope = [], combinatorType = 0, preparePseudo = false;

			// if end selector or incorrect selector
			if ( !$0 && !$3 && !$5 && !$7 ) {
				if ( ( value = selector.charAt( index ) ) && value.replace( /\s+/g, "" ) ) {
					throw new Error( "Syntax error: " + selector.substring( index ) );
				}
				return;
			}

			chunks = prepareChunks( $0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $A, $B );

			$0 = chunks[ 0 ];
			$1 = chunks[ 1 ];
			$5 = chunks[ 5 ];
			$7 = chunks[ 7 ];
			$A = chunks[ 10 ]

			for( length = candidates.length; candidate = candidates[ --length ]; ) {

				if ( combinator === " " ) {
					elems = candidate.getElementsByTagName( $0 || "*" );
				} else if ( combinator === ">" ) {
					elems = candidate.children;
				} else if ( combinator === "~" || combinator === "+" ) {
					elems = [];
					elem = candidate;
					combinatorType = combinator === "+" ? 2 : 1;
				} else {
					length = 0;
					elems = candidates;
				}

				i = 0;

				while( ( elem = combinatorType ? elem.nextSibling : elems[ i++ ] ) ) {

					if ( ( ( !$0 || $0 === "*" ) && elem.nodeType === 1 ) || elem.nodeName === $0 ) {

						if ( ( $1 || $5 || $7 ) && !checkRule(
							elem, $1, chunks[ 2 ], chunks[ 3 ], $5, chunks[ 6 ], $7, chunks[ 9 ], chunks[ 12 ], chunks[ 13 ]
						) ) {
							if ( combinatorType === 2 ) {
								break;
							}
							continue;
						}

						if ( $A === "," ) {
							if ( !seed || seed === elem ) {

								sourceIndex = elem.sourceIndex;

								if ( _min === -1 || _min > sourceIndex ) {
									_min = sourceIndex;
								}
								if ( _max < sourceIndex ) {
									_max = sourceIndex;
								}
								result[ sourceIndex ] = elem;
							}
						} else {
							scope[ scope.length ] = elem;
						}

					}

					if ( combinatorType === 2 && elem.nodeType === 1 ) {
						break;
					}
				}
			}

			if ( ( combinator = $A ) === "," ) {
				candidates = context;
				combinator = " ";
			} else {
				candidates = scope;
			}
		});

		context = [];
		for( i = _min; i <= _max; ) {
			if ( elem = result[ i++ ] ) {
				context[ context.length ] = elem;
			}
		}
		result.length = 0;

		return context;
	}

	try {
		// test of IE CSS3 pseudo selector
		document.attachEvent && document.querySelector( "p:last-child" );

	} catch( _e_ ) {

		// if not exists native querySelector or not support CSS3 pseudo selectors
		var qSA, qS, gEBCN;

		document.querySelectorAll = qSA = function( selector, refNodes ) {

			var m, results = [], qsaStart = 1;

			mqsa.lastIndex = 0;

			if ( nativeQsa ) {

				var parent, oid, nid, firstCom = /^\s*[>+~]/.test( selector );

				if ( this.nodeType === 9 ) {
					try {
						results = nativeQsa[ 1 ].call( this, selector, refNodes );
						qsaStart = 0;
					} catch( _e_ ) {}

				} else if ( this.nodeType === 1 && this.nodeName !== "OBJECT" ) {

					if ( firstCom && ( parent = this.parentNode ) ) {

						oid = this.getAttribute( "id" );
						nid = oid && oid.replace( /'/g, "\\$&" ) || '__qsaEngine__';
						!oid && this.setAttribute( "id", nid );

						try {
							results = nativeQsa[ 0 ].call( parent, "[id='" + nid + "'] " + selector, refNodes );
							qsaStart = 0;
						} catch( _e_ ) {}

						!oid && this.removeAttribute( "id" );
					} else if ( !firstCom ) {
						try {
							results = nativeQsa[ 0 ].call( this, selector, refNodes );
							qsaStart = 0;
						} catch( _e_ ) {}
					}
				}
			}

			if ( qsaStart ) {

				if ( this.nodeType !== 9 ) {

					do {
						m = mqsa.exec( selector );
						m = prepareChunks( m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12] );
						if ( !m[ 10 ] || m[ 10 ] === " " ) {
							if ( ( !m[ 0 ] || m[ 0 ] && this.nodeName === m[ 0 ].toUpperCase() ) &&
								( checkRule( elem, m[1], m[2], m[3], m[5], m[6], m[7], m[9], m[12], m[13] ) ) ) {
								if ( m[ 10 ] === " " ) {
									selector = selector.substr( mqsa.lastIndex, selector.length - mqsa.lastIndex );
									break;
								}
							} else break;
						} else break;
					} while( mqsa.lastIndex < selector.length );

					mqsa.lastIndex = 0;
				}

				results = qSelector( selector, this, 0, refNodes, " " );
			}

			return results;
		}

		document.querySelector = qS = function( selector, refNodes ) {
			return document.querySelectorAll( selector, refNodes )[0] || null;
		}

		document.getElementsByClassName = gEBCN = function( classes ) {

			var result = [];

			if ( classes = classes.replace( /^[\s]+|[\s](?=\s)|[\s]+$/g, '' ) ) {

				if ( nativeQsa ) {
					return ( this.nodeType === 9 ? nativeQsa[ 1 ] : nativeQsa[ 0 ] ).call( this, classes.replace(/\s+(?=\S)|^/g, ".") );
				}
				
				var j, i = 0, cls, elem, elems = this.getElementsByTagName( '*' );

				classes = classes.split( " " );

				for( ; elem = elems[ i++ ]; ) {
					for( j = classes.length; cls = classes[ --j ]; ) {
						if ( !elem.className || (" " + elem.className + " ").indexOf( " " + cls + " " ) === -1 ) {
							elem = null;
							break;
						}
					}
					elem && ( result[ result.length ] = elem );
				}
			}

			return result;
		}

		try {
			ElementProto.querySelectorAll = qSA;
			ElementProto.querySelector = qS;
			ElementProto.getElementsByClassName = gEBCN;
			ElementProto.matchesSelector = function( selector, refNodes ) {
				return qSelector( selector, 0, this, refNodes, " " ).length > 0;
			}
		} catch ( _e_ ) {}
	}

})( window );
