/*
 * events.js DOM Event Model v0.0.2 for Internet Explorer
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
