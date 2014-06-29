define(function(require, exports, module) {
    var Surface             = require('famous/core/Surface');
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var View                = require('famous/core/View');
    var EventHandler        = require('famous/core/EventHandler');
    var StateModifier       = require('famous/modifiers/StateModifier');

    var isLens = false;
    var circleSurface;

    function MirrorLens(arguments) {
        
        View.apply(this, arguments);

        var offClasses = arguments.offClasses;
        var onClasses = arguments.onClasses;



        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        

        this.lens = new Surface({ classes: onClasses, size: [300, 300] }); 
        this.add(this.lens);
        this.lens.pipe(this._eventOutput);

        this.mirror = new Surface({ classes: offClasses, size: [300, 300] }); 
        this.add(this.mirror);
        this.mirror.pipe(this._eventOutput);

        this.iconSurface = new Surface({
            size: [80, 80],
            content: '',
            classes:['profile-icon','off'],
            properties: {
                zIndex: '100'
            }
        });


        this._eventInput.on('selectCircle', function() {
            this.selectCircle();
        }.bind(this));
        this._eventInput.on('deselectCircle', function() {
            this.deselectCircle();
        }.bind(this));

        MirrorLens.prototype.selectCircle = 
        function selectCircle() {
            
            this.mirror.addClass('hide');
            this.lens.removeClass('hide');
            isLens = true;
            this.iconSurface.setClasses(['profile-icon']);
            //this._eventOutput.emit('select');
           
        }
        MirrorLens.prototype.deselectCircle =
        function deselectCircle() {
        
            this.mirror.removeClass('hide');
            this.lens.addClass('hide');
            isLens = false;
            this.iconSurface.setClasses(['profile-icon', 'off']);
            //this._eventOutput.emit('deselect');
        }

        

        this.iconSurface.on('click', function() {
            this._eventOutput.emit('iconSelect');
        }.bind(this));
        this.iconSurface.pipe(this._eventOutput);

        var modifier = new StateModifier({
            align: [0.0, 0.5]
        });
        this.add(this.iconSurface);
    }
    

    MirrorLens.prototype = Object.create(View.prototype);
    MirrorLens.prototype.constructor = MirrorLens;

    MirrorLens.DEFAULT_OPTIONS = {};

    module.exports = MirrorLens;
});