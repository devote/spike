/*
 * spike for IE JavaScript Library v0.0.2
 *
 * Copyright 2012, Dmitriy Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 24-04-2012
 *
 * element.js DOM Element Model v0.0.3 for Internet Explorer < 8
 */

(function( window, undefined ) {

	"use strict";

	var document = window.document;

	if ( !window.Element && document.attachEvent ) {

		var ready = false,
			__getElementById = document.getElementById,
			__createElement = document.createElement,
			__createDocumentFragment = document.createDocumentFragment,
			fragment = __createDocumentFragment(),
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

			elems = fragment.getElementsByTagName( '*' );
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
						if ( elem[ key ] !== Element.prototype[ key ] ) {
							elem[ key ] = Element.prototype[ key ];
						}
					}
				}
				if ( !elem.__propChangeAttached ) {
					elem.__propChangeAttached = 1;
					elem.attachEvent( "onpropertychange", propChange );
				}
			}
			return elem;
		}

		var propChange = function() {
			if ( window.event.propertyName === "innerHTML" ) {
				var elems = copyMethod( window.event.srcElement ).getElementsByTagName( '*' );
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
			return fragment.appendChild( copyMethod( __createElement( tagName ) ) );
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
 * selectors.js CSS3 Selectors Model v1.2.2
 */
(function( window, undefined ) {

	"use strict";

	var _,

		mqsa = /\s*(?:(\*|(?:(?:\*|[\w\-]+)\|)?(?:[\w\-]+|\*)))?(?:\[\s*(?:((?:[\w\-]+\|)?[\w\-]+)\s*((?:~|\^|\$|\*|\||!)?=)\s*)?((?:".*?(?:(?:[\\]{2}(?="))|[^\\])"|'.*?(?:(?:[\\]{2}(?='))|[^\\])'|[^\]].*?)?)\s*\])?(?:(\.|#)([\w\-]+))?(?:(:(?::)?)([\w\-]+)(?:\(\s*([^)]+)\s*\))?)?(?:(?:\s*(?=\s))?(?:(?:\s(?=,|>|\+|~))?([\s,>+~](?!$)))?)?/g,

		baseHasDuplicate = true,
		hasDuplicate = false,

		Element = window.Element,
		document = window.document,
		documentElement = document.documentElement,

		byClass = Element && Element.prototype.getElementsByClassName,
		pSlice = Array.prototype.slice,
		pSplice = Array.prototype.splice,
		pPush = Array.prototype.push,
		spike = window.spike || {},
		hasQSA = document.querySelectorAll ? [Element.prototype.querySelectorAll, document.querySelectorAll] : 0;

	var moveElems = (function() {

		var i, hasSlice = true,
			div = document.createElement("div");

		div.appendChild( document.createComment("") );
		i = div.getElementsByTagName("*").length;
		div.parentNode && div.parentNode.removeChild( div );

		try {
			pSlice.call( documentElement.childNodes, 0 );
		} catch ( _ ) { hasSlice = false }

		if ( i > 0 || !hasSlice ) {
			return function( elems, ret, rmComment, isArray ) {
				if ( !rmComment && hasSlice ) {
					pPush.apply( ret, pSlice.call( elems, 0 ) );
				} else if ( !rmComment && isArray ) {
					pPush.apply( ret, elems );
				} else {
					var i = 0, l = ret.length;
					for( ; elems[ i ]; i++ ) {
						if ( elems[ i ].nodeType === 1 ) {
							ret[ l++ ] = elems[ i ];
						}
					}
					l === ret.length || ( ret.length = l );
				}
				return ret;
			}
		} else {
			return function( elems, ret ) {
				pPush.apply( ret, pSlice.call( elems, 0 ) );
				return ret;
			}
		}
	})();

	var sortElems = (function() {
		[0, 0].sort(function() {
			baseHasDuplicate = false;
			return 0;
		});

		if ( documentElement.compareDocumentPosition ) {
			return function( a, b ) {
				if ( a == b ) {
					hasDuplicate = true;
					return 0;
				}
				if ( documentElement.compareDocumentPosition ) {
					if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
						return a.compareDocumentPosition ? -1 : 1;
					}
					return a.compareDocumentPosition( b ) & 4 ? -1 : a === b ? 0 : 1;
				}
			}
		} else if ( "sourceIndex" in documentElement ) {
			return function( a, b ) {
				if ( a == b ) {
					hasDuplicate = true;
					return 0;
				}
				if ( !a.sourceIndex || !b.sourceIndex ) {
					return a.sourceIndex ? -1 : 1;
				}
				return a.sourceIndex - b.sourceIndex;
			}
		} else if ( document.createRange ) {
			return function( a, b ) {
				if ( a == b ) {
					hasDuplicate = true;
					return 0;
				}
				if ( !a.ownerDocument || !b.ownerDocument ) {
					return a.ownerDocument ? -1 : 1;
				}

				var aRange = a.ownerDocument.createRange(),
					bRange = b.ownerDocument.createRange();
				aRange.setStart( a, 0 );
				aRange.setEnd( a, 0 );
				bRange.setStart( b, 0 );
				bRange.setEnd( b, 0 );
				return aRange.compareBoundaryPoints( Range.START_TO_END, bRange );
			}
		} else {
			return function( a, b ) {
				if ( a == b ) {
					hasDuplicate = true;
				}
				return 0;
			}
		}
	})();

	var attrMap = {
		"class": "className",
		"for": "htmlFor"
	}

	var attrHandle = {
		href: function( elem ) {
			return elem.getAttribute( "href", 2 );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		},
		style: function( elem ) {
			var style = elem.getAttribute( "style" );
			if ( typeof style === "object" ) {
				return elem.style.cssText || "";
			} else {
				return style;
			}
		}
	}

	var checkAttr = function( chunks, elem, attr ) {

		var attr = attrHandle[ attr ] ? attrHandle[ attr ]( elem ) :
			elem[ attr ] != null ? elem[ attr ] : elem.getAttribute( attr ),
			type = chunks[ 3 ],
			check = chunks[ 4 ],
			value = attr + "";

		return attr == null ?
			type === "!=" :
			type === "=" ?
			value === check :
			type === "*=" ?
			value.indexOf( check ) >= 0 :
			type === "~=" ?
			(" " + value + " ").indexOf( " " + check + " " ) >= 0 :
			!check ?
			value && attr !== false :
			type === "!=" ?
			value !== check :
			type === "^=" ?
			value.indexOf( check ) === 0 :
			type === "$=" ?
			value.substr( value.length - check.length ) === check :
			type === "|=" ?
			value === check || value.substr( 0, check.length + 1 ) === check + "-" :
			false;
	}


	spike.filters = (function(){

		function calc( elem, rule, i ) {
			var diff = i - rule[ 1 ];

			if ( rule[ 0 ] === 0 ) {
				return diff === 0;
			}
			return ( diff % rule[ 0 ] === 0 && diff / rule[ 0 ] >= 0 );
		}

		var filters = {

			":": {
				"nth-child": function( elem, rule ) {
					return calc( elem, rule, elem.nodeIndex || 1 );
				},
				"nth-last-child": function( elem, rule ) {
					var p = elem.parentNode,
						i = p && ( ( p._qsaCE || p.children.length || 0 ) + 1 ) || 2;
					return calc( elem, rule, i - ( elem.nodeIndex || 1 ) );
				},
				"first-child": function( elem ) {
					elem = elem.previousSibling;
					return !( elem && ( elem.nodeType === 3 ? elem.previousSibling : 1 ) );
				},
				"last-child": function( elem ) {
					elem = elem.nextSibling;
					return !( elem && ( elem.nodeType === 3 ? elem.nextSibling : 1 ) );
				},
				empty: function( elem ) {
					return !elem.firstChild;
				},
				enabled: function( elem ) {
					return elem.disabled === false && elem.type !== "hidden";
				},
				disabled: function( elem ) {
					return elem.disabled === true;
				},
				checked: function( elem ) {
					return elem.checked === true;
				},
				not: function( elem, content, _, chunks ) {
					if ( ( !chunks[ 1 ] || chunks[ 1 ] && elem.nodeName === chunks[ 1 ] ) &&
						checkRule( chunks, [ elem ], [] ).length > 0 ) {
						return false;
					}
					return true;
				},
				contains: function( elem, content ) {
					return ( elem.textContent || elem.innerText || elem.nodeValue || elem.value || "" ).indexOf( content ) >= 0;
				}
			},
			"::": {}
		}

		filters[":"]["only-child"] = function( elem ) {
			return filters[":"]["first-child"]( elem ) && filters[":"]["last-child"]( elem );
		}

		return filters;
	})();

	spike.preFilters = (function(){
		var pre = {
			"nth-child": function( chunks ) {
				var rule = chunks[ 9 ].replace( /^\+|\s*/g, '' ),
					test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec( rule === "even" && "2n" || rule === "odd" && "2n+1" || !/\D/.test( rule ) && "0n+" + rule || rule );

				chunks[ 9 ] = [ ( test[ 1 ] + ( test[ 2 ] || 1 ) ) - 0, test[ 3 ] - 0 ];
				return !( chunks[ 9 ][ 0 ] === 1 && chunks[ 9 ][ 1 ] === 0 );
			}
		}
		pre["nth-last-child"] = pre["nth-child"];
		return pre;
	})();

	var checkRule = function( chunks, elems, extra, tag ) {

		var i, l, elem, j = elems.length,
			attr, value, pre = false, type, pseudo, m,
			index = 0, parent, node;

		if ( !chunks[ 2 ] && chunks[ 4 ] ) {
			chunks[ 2 ] = chunks[ 4 ];
			chunks[ 4 ] = undefined;
		} else if ( chunks[ 4 ] ) {
			chunks[ 4 ] = chunks[ 4 ].replace( /^(?:"(.*)"|'(.*)')$/, '$1$2' ).replace( /\\/g, "" );
		}

		attr = attrMap[ chunks[ 2 ] ] || chunks[ 2 ];

		type = chunks[ 5 ] === "." ? 1 : chunks[ 5 ] === "#" ? 2 : false;
		value = chunks[ 6 ];
		pseudo = spike.filters[ chunks[ 7 ] ] && spike.filters[ chunks[ 7 ] ][ chunks[ 8 ] ] || chunks[ 8 ] && spike.error( chunks[ 8 ] ) || false;

		if ( !attr && !type && !pseudo && j ) {
			moveElems( elems, extra, !tag, elems instanceof Array );

		} else {

			if ( pseudo && chunks[ 9 ] ) {
				mqsa.lastIndex = 0;
				m = mqsa.exec( chunks[ 9 ] );
				m[ 1 ] = ( m[ 1 ] && m[ 1 ] !== "*" ) ? m[ 1 ].replace( "|", ':' ).toUpperCase() : undefined;
				spike.preFilters[ chunks[ 8 ] ] && ( pre = spike.preFilters[ chunks[ 8 ] ]( chunks ) );
			}

			l = extra.length;

			for( i = 0; i < j; i++ ) {

				elem = elems[ i ];

				if ( elem.nodeType === 1 ) {
					if ( attr && !checkAttr( chunks, elem, attr ) ) {
						elem = null;
					}

					if ( elem && type ) {

						if ( type === 1 ) {
							if ( !elem.className || !( (" " + elem.className + " ").indexOf( " " + value + " " ) >= 0 ) ) {
								elem = null;
							}
						} else if ( type === 2 ) {
							if ( elem.id !== value ) {
								elem = null;
							}
						}
					}

					if ( elem && pseudo ) {

						if ( pre && ( parent = elem.parentNode ) && ( !elem.nodeIndex || parent._qsaCL !== parent.children.length ) ) {
							index = 0;
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									node.nodeIndex = ++index;
								}
							}
							parent._qsaCE = index;
							parent._qsaCL = parent.children.length;
						}

						if ( !pseudo( elem, chunks[ 9 ], chunks, m ) ) {
							elem = null;
						}
					}

					elem && ( extra[ l++ ] = elem );
				}
			}

			l === extra.length || ( extra.length = l );
		}

		return extra;
	}

	var parser = function( selector, context, extra, sub ) {

		var m, i, j, k, l, n, o, len = selector.length, elems,
			elem, child, prevRule = true, nextRule, cache = [],
			parts = [], part, tagOnly, from, out = extra[ 0 ],
			lastIndex = mqsa.lastIndex, tag, uTag, index;

		for( i = 0, j = context.length; i < j; i++ ) {

			from = context[ i ];

			index = lastIndex;

			do {
				mqsa.lastIndex = index;
				m = mqsa.exec( selector );

				if ( ( tagOnly = !m[ 4 ] && !m[ 5 ] && !m[ 7 ] ) && !m[ 1 ] ) spike.error( selector.substring( index ) );

				index = mqsa.lastIndex;

				tag = ( m[ 1 ] && m[ 1 ] !== "*" ) ? m[ 1 ].replace( "|", ':' ) : undefined;

				nextRule = m[ 10 ];

				if ( tagOnly && prevRule === true && ( nextRule === "~" || nextRule === ">" ) ) {

					parts.push({ tag: tag ? tag.toUpperCase() : tag, rule: nextRule });
					nextRule = true;
					elems = [];

				} else if ( prevRule === ">" ) {
					elems = [];

					uTag = tag ? tag.toUpperCase() : tag;

					for( k = 0; elem = cache[ k ]; k++ ) {

						elem = elem.children;

						for( n = 0; child = elem[ n ]; n++ ) {
							if ( child.nodeType === 1 ) {
								if ( uTag ) {
									if ( uTag === child.nodeName ) {
										elems[ elems.length ] = child;
									}
								} else {
									elems[ elems.length ] = child;
								}
							}
						}
					}

					extra[ 1 ] = true;

				} else if ( prevRule === "+" || prevRule === "~" ) {
					elems = [];

					for( k = 0, l = cache.length; k < l; k++ ) {

						uTag = tag ? tag.toUpperCase() : tag;

						elem = cache[ k ];

						while ( elem = elem.nextSibling ) {
							if ( elem.nodeType === 1 ) {

								if ( uTag ) {
									if ( uTag === elem.nodeName ) {
										elems[ elems.length ] = elem;
									}
								} else {
									elems[ elems.length ] = elem;
								}

								if ( prevRule === "+" ) break;
							}
						}
					}

					extra[ 1 ] = true;

				} else if ( ( m[ 5 ] === "#" && !( o = false ) ) || ( m[ 2 ] === "id" && m[ 3 ] === "=" && ( o = true ) ) ) {

					if ( o ) {
						m[ 6 ] = m[ 4 ].replace( /^(?:"(.*)"|'(.*)')$/, '$1$2' ).replace( /\\/g, "" );
						m[ 2 ] = m[ 3 ] = m[ 4 ] = undefined;
					}

					elems = [];
					n = m[ 6 ];

					if ( from === document ) {
						cache = [];
						uTag = tag ? tag.toUpperCase() : tag;
						do {
							child = document.getElementById( n );
							if ( child ) {
								cache[ cache.length ] = child;
								child.setAttribute( "id", n + " _" );
							}
						} while( child );

						for( o = 0; elem = cache[ o ]; o++ ) {
							elem.setAttribute( "id", n );
							if ( !uTag || elem.nodeName === uTag ) {
								elems[ elems.length ] = elem;
							}
						}
					} else {
						cache = from.getElementsByTagName( tag || '*' );

						for( o = 0; elem = cache[ o ]; o++ ) {
							if ( elem.id && elem.id === n ) {
								elems[ elems.length ] = elem;
							}
						}
					}

					m[ 5 ] = undefined;

				} else if ( m[ 5 ] === "." && !tag && byClass ) {

					elems = byClass.call( from, m[ 6 ] );

					tagOnly = !m[ 4 ] && !m[ 7 ] && ( ( nextRule === "," ) || ( index === len ) );

					m[ 5 ] = undefined;

				} else {
					elems = from.getElementsByTagName( tag || '*' );
				}

				if ( tagOnly ) {
					cache = elems;
					if ( parts.length == 0 && elems.length && ( ( nextRule === "," ) || ( index === len ) ) ) {
						moveElems( elems, out, !tag, elems instanceof Array );
					}

				} else {

					if ( elems.length > 0 ) {
						if ( ( parts.length == 0 ) && ( ( nextRule === "," ) || ( index === len ) ) ) {
							cache = checkRule( m, elems, out, tag );
						} else {
							cache = checkRule( m, elems, [], tag );
						}
					} else {
						cache = [];
					}

					if ( !nextRule && index < len ) {

						l = cache.length;

						do {

							mqsa.lastIndex = index;
							m = mqsa.exec( selector );

							index = mqsa.lastIndex;

							nextRule = m[ 10 ];

							if ( l ) {
								if ( ( parts.length == 0 ) && ( ( nextRule === "," ) || ( index === len ) ) ) {
									cache = checkRule( m, cache, out, tag );
								} else {
									cache = checkRule( m, cache, [], tag );
								}
								l = cache.length;
							}

							if ( nextRule ) break;

						} while( index < len );
					}
				}

				if ( nextRule !== true && parts.length > 0 ) {

					if ( cache.length === 0 ) {
						parts.length = 0;
					} else {
						elems = [];
						for( n = 0; elem = cache[ n ]; ) {
							elems[ n++ ] = elem;
						}

						k = out.length;

						while( part = parts.pop() ) {

							l = parts.length;

							if ( part.rule === ">" ) {
								for( n = 0; elem = elems[ n ]; n++ ) {
									if ( elem.parentNode && ( !part.tag || elem.parentNode.nodeName === part.tag ) ) {
										if ( l === 0 ) {
											if ( ( nextRule === "," ) || ( index === len ) ) {
												out[ k++ ] = cache[ n ];
											} else {
												elems[ n ] = cache[ n ];
											}
										} else {
											elems[ n ] = elem.parentNode;
										}
									} else {
										elems[ n ] = true;
									}
								}
							} else {
								for( n = 0; elem = elems[ n ]; n++ ) {

									elem = elem.previousSibling;

									o = false;
									while( elem ) {
										if ( elem.nodeType === 1 ) {
											if ( !part.tag || elem.nodeName === part.tag ) {
												if ( l === 0 ) {
													if ( ( nextRule === "," ) || ( index === len ) ) {
														out[ k++ ] = cache[ n ];
													} else {
														elems[ n ] = cache[ n ];
													}
												} else {
													elems[ n ] = elem;
												}

												o = true;
												break;
											}
										}
										elem = elem.previousSibling;
									}
									if ( !o ) {
										elems[ n ] = true;
									}
								}
							}
						}
						k === out.length || ( out.length = k );

						if ( !( ( nextRule === "," ) || ( index === len ) ) ) {
							cache = [];
							for( n = 0; elem = elems[ n ]; n++ ) {
								elem !== true && ( cache.push( elem ) );
							}
						}
					}
				}

				if ( nextRule === " " ) {
					if ( cache.length > 0 ) {
						mqsa.lastIndex = index;

						extra = parser( selector, cache, extra, true );

						index = mqsa.lastIndex;

						extra[ 1 ] = true;

					} else {
						mqsa.lastIndex = index;

						do {
							m = mqsa.exec( selector );
							if ( !m[ 4 ] && !m[ 5 ] && !m[ 7 ] && !m[ 1 ] ) spike.error( selector.substring( index ) );

							if ( m[ 10 ] === "," ) break;
						} while( mqsa.lastIndex < len );

						index = mqsa.lastIndex;

						nextRule = m[ 10 ];
					}
				}

				if ( nextRule === "," ) {

					extra[ 1 ] = true;

					if ( sub ) break;
				}

				prevRule = nextRule;

			} while( index < len );

		}

		return extra;
	}

	spike.querySelectorAll = function( selector, context ) {

		context = context && context.nodeType ? context : document;

		mqsa.lastIndex = 0;

		var i, results, qsaStart = true, extra;

		if ( hasQSA ) {

			var parent, oid, nid, firstCom = /^\s*[>+~]/.test( selector );

			results = [ extra, 0 ]

			if ( context.nodeType === 9 ) {
				try {
					extra = hasQSA[1].call( context, selector );
					qsaStart = false;
				} catch( _ ) {}

			} else if ( context.nodeType === 1 && context.nodeName !== "OBJECT" ) {

				if ( firstCom && ( parent = context.parentNode ) ) {

					oid = context.getAttribute( "id" );
					nid = oid && oid.replace( /'/g, "\\$&" ) || '__qsaEngine__';
					!oid && context.setAttribute( "id", nid );

					try {
						extra = hasQSA[0].call( parent, "[id='" + nid + "'] " + selector );
						qsaStart = false;
					} catch( _ ) {}

					!oid && context.removeAttribute( "id" );
				} else if ( !firstCom ) {
					try {
						extra = hasQSA[0].call( context, selector );
						qsaStart = false;
					} catch( _ ) {}
				}
			}
		}

		if ( qsaStart ) {

			results = parser( selector, [ context ], [ [], 0 ] );

			extra = results[ 0 ];

			if ( results[ 1 ] && extra.length > 1 ) {

				hasDuplicate = baseHasDuplicate;
				Array.prototype.sort.call( extra, sortElems );

				if ( hasDuplicate ) {
					for( i = 1; i < extra.length; i++ ) {
						if ( extra[ i ] === extra[ i - 1 ] ) {
							pSplice.call( extra, i--, 1 );
							delete extra[ extra.length ];
						}
					}
				}
			}
		}

		return extra;
	}

	spike.error = function( msg ) {
		throw new Error( "Syntax error: " + msg );
	}

	window.spike = spike;

	var ie = eval( "/*@cc_on @_jscript_version;@*/" );

	if ( ie && ie <= 5.8 && Element ) {

		document.querySelectorAll = Element.prototype.querySelectorAll = function( selector ) {

			if ( this === document ) {
				return spike.querySelectorAll( selector, this );
			}

			var m;

			mqsa.lastIndex = 0;
			do {
				m = mqsa.exec( selector );
				if ( !m[ 10 ] || m[ 10 ] === " " ) {
					if ( ( !m[ 1 ] || m[ 1 ] && this.nodeName === m[ 1 ].toUpperCase() ) && ( checkRule( m, [ this ], [] ).length > 0 ) ) {
						if ( m[ 10 ] === " " ) {
							selector = selector.substr( mqsa.lastIndex, selector.length - mqsa.lastIndex );
							break;
						}
					} else break;
				} else break;
			} while( mqsa.lastIndex < selector.length );

			return spike.querySelectorAll( selector, this );
		}

		document.querySelector = Element.prototype.querySelector = function( selector ) {
			return document.querySelectorAll.call( this, selector )[0] || null;
		}

		document.getElementsByClassName = Element.prototype.getElementsByClassName = function( classes ) {

			var result = [], j, i = 0, cls, elem,
				elems = this.getElementsByTagName( '*' );

			classes = classes.replace( /^[\s]+|[\s](?=\s)|[\s]+$/g, '' ).split( " " );

			for( ; elem = elems[ i++ ]; ) {
				for( j = classes.length; cls = classes[ --j ]; ) {
					if ( !elem.className || (" " + elem.className + " ").indexOf( " " + cls + " " ) === -1 ) {
						elem = null;
						break;
					}
				}
				elem && ( result[ result.length ] = elem );
			}

			return result;
		}
	}

})( window );
