define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dojo/_base/lang', // lang.mixin lang.hitch
        'dojo/on',
        'dojo/dom-geometry',
        'dojo/window',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/_base/fx',
        'dojo/query',
        'dojo/NodeList-manipulate'
        ], function(declare, widgetBase, lang, on, domGeom, win, domConstruct, domStyle, fx, query, NodeListManipulate) {

    return dojo.declare('InifinteScroll', widgetBase, {

        timeout: 1000,

        proximity: 100,

        heightNode: null,

        postCreate: function() {
            // Wrap the domNode contents in a wrapper so we can measure height
            query("> *", this.domNode).wrapAll('<div class="heightwrapper"></div>');
            this.heightNode = query('.heightwrapper', this.domNode)[0];
            this._connects = [];
            this.start();
            this.refresh();

            // Load initial backwards scroll
            this.pause();
            this.onReachStart();
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
            var reached_bottom,
                reached_top,
                scrollTop = this.domNode.scrollTop,
                scrollBottom = this.nodeHeight - (this.viewportHeight + scrollTop);


            reached_bottom = Boolean(scrollBottom <= this.proximity);
            if (reached_bottom) {
                this.pause();
                return this.onReachEnd();
            }

            reached_top = Boolean(scrollTop <= this.proximity);
            if (reached_top) {
                this.pause();
                return this.onReachStart();
            }
        },

        refresh: function() {
            this.nodeHeight = domGeom.position(this.heightNode, false).h;
            this.viewportHeight = domGeom.position(this.domNode, false).h;
        },

        pause: function() {
            var h;
            while(h = this._connects.pop()){
                h.remove();
            }
            setTimeout(lang.hitch(this, 'start'), this.timeout);
        },

        start: function() {
            this._connects.push(on(this.domNode, 'scroll', lang.hitch(this,
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
          var yOffset = this.domNode.scrollTop;

          // Place the wrapper node on the page
          domConstruct.place(wrapperNode, this.heightNode, 'first');

          // Get the height of the contentNode
          var height = domGeom.getMarginBox(contentNode).h;

          dojo.animateProperty({
            node: wrapperNode,
            properties: {
              height: height
            },
            onAnimate: lang.hitch(this, function(props) {
              // scroll the window along with the element height
              this.domNode.scrollTop = yOffset + parseFloat(props.height);
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
          domConstruct.place(wrapperNode, this.heightNode, 'last');
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
