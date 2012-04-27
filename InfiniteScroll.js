define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dojo/_base/lang', // lang.mixin lang.hitch
        'dojo/on',
        'dojo/dom-geometry',
        'dojo/window',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/_base/fx'
        ], function(declare, widgetBase, lang, on, domGeom, win, domConstruct, domStyle, fx) {

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
        },

        prepend: function(content) {
          // Keep handles to the content node and wrapper node
          var contentNode = domConstruct.toDom(content);

          // wrap with bottom absolutely positioned element so the animation
          // shows the bottom of the inserted node first
          var topWrapperNode = domConstruct.create('div', {
            style: 'position: absolute; bottom: 0;'
          });
          domConstruct.place(contentNode, topWrapperNode);

          var wrapperNode = this._wrapContent(topWrapperNode);

          // Initial scroll offset
          var yOffset = window.pageYOffset;

          // Place the wrapper node on the page
          domConstruct.place(wrapperNode, this.domNode, 'first');

          // Get the height of the contentNode
          var height = domGeom.getMarginBox(contentNode).h;

          dojo.animateProperty({
            node: wrapperNode,
            properties: {
              height: height
            },
            onAnimate: lang.hitch(this, function(props) {
              // scroll the window along with the element height
              window.scroll(0, yOffset + parseFloat(props.height));
            }),
            onEnd: lang.hitch(this, function(node) {
              domStyle.set(topWrapperNode, {position: 'relative'});
              domStyle.set(node, {height: 'auto', overflow: 'auto'});
              this.refresh();
            })
          }).play();

        },

        append: function(content) {
          var contentNode = domConstruct.toDom(content);
          var wrapperNode = this._wrapContent(contentNode);
          domConstruct.place(wrapperNode, this.domNode, 'last');
          var height = domGeom.getMarginBox(contentNode).h;
          dojo.animateProperty({
            node: wrapperNode,
            properties: {
              height: height
            },
            onEnd: lang.hitch(this, function(node) {
              domStyle.set(node, {
                height: 'auto',
                overflow: 'auto'
              });
              this.refresh();
            })
          }).play();
        },

        _wrapContent: function(contentNode) {
          var wrapperNode = domConstruct.create('div', {
            'class': 'infinitescroll-heightwrap',
            style: 'position: relative; overflow: hidden; height: 0px'
          });
          domConstruct.place(contentNode, wrapperNode);
          return wrapperNode;
        }

    });

});
