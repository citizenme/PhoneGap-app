define(function(require, exports, module) {

    var FamousView          = require('famous/core/View'),
        Surface             = require('famous/core/Surface'),
        Container           = require('famous/surfaces/ContainerSurface'),
        Canvas              = require('famous/surfaces/CanvasSurface'),
        Modifier            = require('famous/core/Modifier'),
        PhysicsEngine       = require('famous/physics/PhysicsEngine'),
        Particle            = require('famous/physics/bodies/Particle'),
        Spring              = require("famous/physics/forces/Spring"),
        Transform           = require('famous/core/Transform'),
        Timer               = require('famous/utilities/Timer'),

        _                   = require('main/vendor/underscore/lodash'),
        Helpers             = require('main/helpers/helpers'),
        Region              = require('main/helpers/region');



    /*  -----------------------------------------------------------------------------------------

        View:

        This extends the famous view to add a bunch of convenience functions to keep our codebase
        cleaner. More importantly it keeps much of the famous 'way of doing things' contained
        in a one place since the famous code base is changing frequently prior to shipment.
        This makes responding to any core changes a bit nicer.

        Authors:    Larry Robinson

        Notes:      This expands on Dino's ideas and handles all the dirty work of creating and
                    organizing surfaces, modifiers, particles, etc...

                    Expect to do a major refactor of all this once famous settles into release
                    version and we better understand the famous framework!

        ---------------------------------------------------------------------------------------*/


    function View(options) {

        this.constructor.DEFAULT_OPTIONS = this.DEFAULT_OPTIONS;
        FamousView.prototype.constructor.apply(this, arguments);

        options                 = options || {};
        this.model              = options.model || null;
        this.surfaces           = this.surfaces || {};
        this.famous             = {region:{}, surface: {}, modifier:{}, physics:{}, container:{}};
        this.events             = this.events || {};
        this.surfaceEvents      = this.surfaceEvents || {};
        this.timers             = {};

        _.bindAll(this, 'insertImage', 'insertText','insertElement');

        // Automatically store these famous arguments on the instance.
        // !!! This code could be unreliable if famous changes how it instanitates core objects!
        _.each(arguments, function(option){
            if (typeof option != 'undefined' && option.constructor.name === 'PhysicsEngine'){
                this.physicsEngine = option;

            }
        }, this);


        //kick things off
        this.initialize.apply(this, arguments);
        this.buildSurfaces();
        this.bindSurfaceEvents();
        this.bindViewEvents();
        this.onReady();


    }

/*  -----------------------------------------------------------------------------------------

    This is straight from Backbone.js to correctly set up the prototype chain, for subclasses.
    Similar to `goog.inherits`, but uses a hash of prototype properties and class properties
    to be extended. All backbone and underscores user will feel comfortable with this!
    ---------------------------------------------------------------------------------------*/

    var extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };


/*  -----------------------------------------------------------------------------------------

    This is where all the conveience functions for the extended view live!
    ---------------------------------------------------------------------------------------*/


    View.extend =  extend;

    _.extend(View.prototype, FamousView.prototype, {
        DEFAULT_OPTIONS: {},

        initialize: function(){ },
        onReady: function(){},

        broadcast: function(type, event){
            this._eventOutput.emit(type, event);


        },

        clearTimers: function(key){
            if (this.timers[key]){
                Timer.clear(this.timers[key]);
                delete this.timers[key];
            }
        },



        createRegion: function( key, transform){


            //todo: create some cool stock transforms we can select from
            // for now the duration is set to 0 so there is no transition
            var regionTransition    = { duration: 0, curve: 'easeOut'};
            var inTransform         = Transform.translate(0,0,0);
            var outTransform        = Transform.translate(0,0,0);


            var region = new Region({
                inTransform:    inTransform,
                outTransform:   outTransform,
                inTransition:   regionTransition,
                outTransition:  regionTransition,
            });


            //add to list
            this.famous.region[key] = region;

            //return the region
            return region;

        },


        bindSurfaceEvents: function(){
            var events = this.surfaceEvents;
            this.bindEvents(this.surfaces, events);
        },

        bindViewEvents: function(){
            var events = this.events;
            this.bindEvents(this, events);
        },

        bindEvents: function(context, events){
            _.each(events, function(action, selector){
                this.bindEvent(context, selector, action);
            },this);
        },

        bindEvent: function(context, selector, action){
            var parts = selector.split(' ');
            var target = null;
            var event = parts[0];
            var renderable = parts[1] || null;

            target = renderable ? context[renderable] : context;

            var func = this[action];
            if(!func) return;
            try{
                target.on(event, _.bind(func, this));
            } catch(e) {
                throw new Error('Unable to bind event for \'' + selector + '\'');
            }
        },


        buildSurfaces: function(){

            _.each(this.surfaces, function(model, key){
                this.initializeSurface(key, model);
            }, this);
        },

        initializeSurface: function(key, model){
            var parts = this.buildSurface(key,model);
            var surface = parts[0];
            var modifier = parts[1];
            this.addSurface(model, key, surface, modifier);
        },

        buildSurface: function(key, model){
            var modifier    = null;
            var surface     = null;
            var properties  = model.properties || undefined;
            var classes     = model.classes || undefined;
            var opacity     = model.opacity || undefined;

            //should we resize per design specs?
            //DISCUSS: Need to fix to default to parent if not specified
            if (model.scaled){
                model.size = Helpers.designSize(model.size[0],model.size[1]);
                this.scaleProperties(model.properties);
            }

            var size = model.size || undefined;


            //add content
            var content = this.insertContent(key, model);

            //create surface object data
            var obj = {
                content: content,
                size: size,
                opacity: opacity,
                properties: properties,
                classes: classes
            };

            //surface or containerSurface?
            if (model.type === 'container'){
                surface = new Container(obj);
                //containers need to hold a list of keys they contain
                this.famous.container[key] = [];

            }else if (model.type === 'canvas'){
                surface = new Canvas(obj);

            }else{
                surface = new Surface(obj);
            }

            //create a modifier
            if(model.modifier){
                modifier = new Modifier(model.modifier);
            }

            if(model.pipe){
                surface.pipe(this._eventOutput);
            }

            return [surface, modifier];
        },

        addView: function(view){

            // really just a facade to hide the confusion with famous ._add and .add
            this._add(view);
        },

        addSurface: function(model, key, surface, modifier){

            //if the surface has physics then create particle and return it
            var particle = null;
            if (model.physics) particle = this.createParticle(model, key);


            // Add the key as a property of the surface
            // NOTE: This is an attributes like <div famousKey="larry"> Allows us to put a single click
            // handler on a parent but know the famous key value of the surface that was a clicked!
            this.setFamousKey(surface,key);

            //if this surface is going into a container then update the container with the key of the
            //surfaces it contains so it knows how to parent!
            if (model.putIn) this.famous.container[model.putIn].push(key);

             //save surface
            this.famous.surface[key] = surface;

            //save modifier
            if(modifier) this.famous.modifier[key] = modifier;


            return this.addChild(model, surface, modifier, particle);

        },

        addChild: function(model, renderable, modifier, particle){


            if(modifier){
                if (model.putIn) {
                    if (particle){
                        return this.famous.surface[model.putIn].add(particle).add(modifier).add(renderable);
                    }else{
                        return this.famous.surface[model.putIn].add(modifier).add(renderable);
                    }

                }else{
                    if (particle){
                        return this._add(particle).add(modifier).add(renderable);;
                    }else{
                        return this._add(modifier).add(renderable);
                    }
                }
            }

            if (model.putIn){
                if (particle){
                    return this.famous.surface[model.putIn].add(particle).add(renderable);
                }else{
                    return this.famous.surface[model.putIn].add(renderable);
                }
            }

            if (particle){
                return this._add(particle).add(renderable);
            }else{
                return this._add(renderable);
            }

        },

        setFamousKey:function(surface,key){
            var content = surface.getContent();
            if(!content) return

            //HTMLDivElements are easy!
            if (content instanceof Element){
                content.setAttribute('famousKey',key);

            }
            //strings need a little more work
            else{
                content=String(content);
                var parts = content.split('>');
                parts = [parts.shift(), parts.join('>')];
                parts[0] += ' famousKey="' + key + '">'
                content = parts.join('');
            }

            //update famous surface with new content
            surface.setContent(content);
        },

        getFamousKey: function(elem){
            if (elem) return elem.getAttribute('famousKey');
        },



        getElement: function(key){
            //DISCUSS: How to we assign an id to a famous view so I can make this
            //bulletproof for returning the proper DOM Element
            var element = document.querySelectorAll('[famousKey=' + key+']');
            return element[0];

        },

        setTextField:function(key, value){
            var el = this.famous.surface[key].getContent();
            if (el){
                var content=String(el);
                var parts = content.split('>');
                parts = [parts.shift(), parts.join('>')];
                parts[0] += '>'
                parts[1] = value + '</div>'
                content = parts.join('');
                this.famous.surface[key].setContent(content);
            }
        },


        insertContent: function(key,model){
            if(!model.content) return undefined;

            var map = {
                'image': this.insertImage,
                'text': this.insertText,
                'element': this.insertElement,
            };

            var action = map[model.type] || function(){};
            return action(key,model);
        },

        insertElement: function(key,model){
            var attrs = [];
            var size = model.size || undefined;
            var width = size[0] || undefined;
            var height = size[1] || undefined;
            var element = model.content.element || undefined;
            var id = model.content.id || undefined;
            var classname =  model.content.class || undefined;


            if (width) attrs.push('width="' + width + '"');
            if (height) attrs.push('height="' + height + '"');
            if (id) attrs.push('id="' + id + '"');
            if (classname) attrs.push('class="' + classname + '"');

            var template = '<' + element + ' '+ attrs.join(' ') + '>' + '</' + element + '>';
            return template;
        },

        insertImage: function(key,model){

            var attrs = [];
            var size = model.size || undefined;
            var width = size[0] || undefined;
            var height = size[1] || undefined;
            var id = model.content.id || undefined;
            var classname =  model.content.class || undefined;


            if (width) attrs.push('width="' + width + '"');
            if (height) attrs.push('height="' + height + '"');
            if (id) attrs.push('id="' + id + '"');
            if (classname) attrs.push('class="' + classname + '"');

            var template = '<img ' + attrs.join(' ') + ' src="' + model.content.src + '">';
            return template;
        },

        insertText: function(key, model){

            //wrap in div so it can hold our famouskey
            var template = '<div> ' + model.content.text + '</div>';

            return template;
        },
        scaleProperties: function(properties){
            if (!properties) return;

            //for now the only property we scale is font-size but more can be easily
            // here as needed
            if (properties.fontSize) properties.fontSize = Helpers.scaleFont(properties.fontSize);

        },


        createParticle: function(model, key){


            // NOTE: I'll refactor this once I master famous physics!!!!

            //if we don't have a physics engine then clear the physics parameters from the model
            // because they don't apply!!
            if (!this.physicsEngine) {
                model.physics = '';
                return null;
            }


            // get creation options from model
            var options = model.physics

            //defaults (still figuring some of these out from famous code!)
            var type            = options.type          || 'spring';
            var shape           = options.shape         || 'point';
            var duration        = options.duration      || 300;
            var resistance      = options.resistance    || .5;
            var travel          = options.travel        || [0,0,0]; //travel should default to [0,0,0] but user will think effect is broken when it does nothing!
            var mass            = 1;
            var restitution     = 1;
            var velocity        = [0,0,0];
            var length          = options.length        || 0;
            var anchor          = options.anchor        || [0,.5,0];
            var modifier        = null;


            if (model.scaled){
                length = Helpers.scaleX(length);
                var x  = Helpers.scaleX(travel[0]);
                var y  = Helpers.scaleY(travel[1]);
                var z  = travel[2];
                travel = [x,y,z];
            }


            //translate our shape definitions to famous shape definitions (this needs to change to accomodate new famous master on 3-30-14)
            /*
            var famousShape = { 'point':        this.physicsEngine.BODIES.POINT,
                                'body':         this.physicsEngine.BODIES.BODY,
                                'circle' :      this.physicsEngine.BODIES.CIRCLE,
                                'rectangle':    this.physicsEngine.BODIES.RECTANGLE,
                                }[shape];

            */


            //Create a famous physical particle
            var particle = new Particle({
                                m       : mass,
                                r       : restitution,
                                p       : travel,
                                v       : velocity
                            });


            //create a famous spring (only effect we understand right now)
            var spring = new Spring({
                                period          : duration,
                                dampingRatio    : resistance,
                                length          : length,
                                //bidirectional   : false,
                                anchor          : anchor
                            });


            //particle gets added to the physics engine
            this.physicsEngine.addBody(particle);


            //attach the spring and particle save the particle id (not sure why yet but famous returns it and we may need it for something later)
            var id = this.physicsEngine.attach(spring, particle);

            this.famous.physics[key]= {
                id          : id,
                spring      : spring,
                particle    : particle
            }

            return particle;

            /*  PHYSICS NOTES -------------------------------------------------------------------------------------------


                travel:         Starting distance from whatever origin was defined for the surface. It appears
                                to work with length to figure out how much we move. Seems easiest to set length
                                to 0 and focus on the travel for now.

                length:         Must be a value between 0 and infinity. Negative values cause jitter.

                anchor:         Probably has something to do with where the spring is anchored but leaving as
                                [0,0,0] for now, which, presumably, means spring is attached to the origin.
                                Wild ass guess!
            */

        }
    });

    module.exports = View;


});
