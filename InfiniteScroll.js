define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dojo/_base/lang', // lang.mixin lang.hitch
        'dojo/on',
        'dojo/dom-geometry',
        'dojo/window'
        ], function(declare, widgetBase, lang, on, domGeom, win) {

    return dojo.declare('InifinteScroll', widgetBase, {

        timeout: 1000,

        postCreate: function() {
            pos = domGeom.position;
            this._connects = [];
            this.start();
            this.refresh();
        },

        /**
         * Callback fired when scroll reaches the start of the stack
         */
        onReachStart: function() {
            console.log('Reached top!');
        },

        /**
         * Callback fired when scroll reaches the end of the stack
         */
        onReachEnd: function() {
            console.log('Reached bottom!');
        },

        /**
         * Handles the keyboard events for accessibility reasons
         */
        _onScroll: function(/*Event*/ evt) {
            if(window.pageYOffset < 0) return;
            var reached_bottom, reached_top;
            reached_bottom = Boolean(window.pageYOffset + this.viewport_height -
                    this.nodeHeight > 0);
            if (reached_bottom) {
                this.pause();
                return this.onReachEnd();
            }

            reached_top = Boolean(window.pageYOffset == 0);
            if (reached_top) {
                this.pause();
                return this.onReachStart();
            }
        },

        refresh: function() {
            this.nodeHeight = domGeom.position(this.domNode, false).h;
            this.viewport_height = win.getBox().h;
        },

        pause: function() {
            var h;
            while(h = this._connects.pop()){
                h.remove();
            }
            setTimeout(lang.hitch(this, 'start'), this.timeout);
        },

        start: function() {
            this._connects.push(on(window, 'scroll', lang.hitch(this,
                        '_onScroll')));
        }

    });

});
