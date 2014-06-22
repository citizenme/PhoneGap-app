/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var View                = require('famous/core/View');
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Surface             = require('famous/core/Surface');
    var EventHandler        = require('famous/core/EventHandler');
    var RenderController    = require('famous/views/RenderController');
    var Transform           = require('famous/core/Transform');

    /**
     * A view for transitioning between two surfaces based
     *  on a 'on' and 'off' state
     *
     * @class TabBar
     * @extends View
     * @constructor
     *
     * @param {object} options overrides of default options
     */
    function ToggleButton(options) {

        this.options = {
            content: '',
            offClasses: ['off'],
            onClasses: ['on'],
            size: undefined,
            // outTransition: {curve: 'easeInOut', duration: 300},
            // inTransition: {curve: 'easeInOut', duration: 300},
            toggleMode: ToggleButton.TOGGLE,
            //crossfade: true
        };

        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        this._eventInput.on('selectCircle', function() {
            this.select();
        }.bind(this));
        this._eventInput.on('deselectCircle', function() {
            this.deselect();
        }.bind(this));

        // this.eventInput.on('hires tutor', function(){
        //     alert('Accepted to Harvard');
        // }.bind(this));

        this.offSurface = new Surface();
        this.offSurface.on('click', function() {
            if (this.options.toggleMode !== ToggleButton.OFF) this.select();
        }.bind(this));
        this.offSurface.pipe(this._eventOutput);

        this.onSurface = new ContainerSurface();
        // this.onSurface.on('click', function() {
        //     if (this.options.toggleMode !== ToggleButton.ON) this.deselect();
        // }.bind(this));
        this.onSurface.pipe(this._eventOutput);

        this.view = new View()

        this.iconSurface = new Surface({
            size: [80, 80],
            content: '',
            classes:['profile-icon'],
            properties: {
                zIndex: '100'
            }
        });
        this.iconSurface.on('click', function() {
            this.iconSelect();
        }.bind(this));
        this.iconSurface.pipe(this._eventOutput);

        var modifier = new StateModifier({
            //align: [0.5, 0.0],
            //origin: [0.5, 0.5]
           // transform: Transform.translate(-20, -20, 1)
        });

        
        this.view.add(this.onSurface);
        this.view.add(this.iconSurface);
        this.view.pipe(this.iconSurface);


        this.arbiter = new RenderController({
            //overlap : this.options.crossfade
        });

        this.deselect();

        if (options) this.setOptions(options);
    }

    ToggleButton.OFF = 0;
    ToggleButton.ON = 1;
    ToggleButton.TOGGLE = 2;

    /**
     * Transition towards the 'on' state and dispatch an event to
     *  listeners to announce it was selected
     *
     * @method select
     */
    ToggleButton.prototype.select = function select() {
        this.selected = true;
        this.arbiter.show(this.view, this.options.inTransition);
//        this.arbiter.setMode(ToggleButton.ON, this.options.inTransition);
        this._eventOutput.emit('select');
    };

    /**
     * Transition towards the 'off' state and dispatch an event to
     *  listeners to announce it was deselected
     *
     * @method deselect
     */
    ToggleButton.prototype.deselect = function deselect() {
        this.selected = false;
        this.arbiter.show(this.offSurface, this.options.outTransition);
        this._eventOutput.emit('deselect');
    };

    /**
     * 
     *  listeners to announce the icon was selected
     *
     * @method select
     */
    ToggleButton.prototype.iconSelect = function iconSelect() {
//        this.arbiter.setMode(ToggleButton.ON, this.options.inTransition);
        this._eventOutput.emit('iconSelect');
    };

    /**
     * Return the state of the button
     *
     * @method isSelected
     *
     * @return {boolean} selected state
     */
    ToggleButton.prototype.isSelected = function isSelected() {
        return this.selected;
    };

    ToggleButton.prototype.toggle = function toggle() {
        if (this.selected === true) {
            this.selected = false;
            this._eventOutput.emit('deselect');
            return this.selected;
        }else {
            this.selected = true;
            this.arbiter.show(this.view, this.options.inTransition);
    //      this.arbiter.setMode(ToggleButton.ON, this.options.inTransition);
            this._eventOutput.emit('select');
        } 
    };

    /**
     * Override the current options
     *
     * @method setOptions
     *
     * @param {object} options JSON
     */
    ToggleButton.prototype.setOptions = function setOptions(options) {
        if (options.content !== undefined) {
            this.options.content = options.content;
            this.offSurface.setContent(this.options.content);
            this.onSurface.setContent(this.options.content);
        }
        if (options.offClasses) {
            this.options.offClasses = options.offClasses;
            this.offSurface.setClasses(this.options.offClasses);
        }
        if (options.onClasses) {
            this.options.onClasses = options.onClasses;
            this.onSurface.setClasses(this.options.onClasses);
        }
        if (options.size !== undefined) {
            this.options.size = options.size;
            this.onSurface.setSize(this.options.size);
            this.offSurface.setSize(this.options.size);
        }
        if (options.toggleMode !== undefined) this.options.toggleMode = options.toggleMode;
        if (options.outTransition !== undefined) this.options.outTransition = options.outTransition;
        if (options.inTransition !== undefined) this.options.inTransition = options.inTransition;
        if (options.crossfade !== undefined) {
            this.options.crossfade = options.crossfade;
            this.arbiter.setOptions({overlap: this.options.crossfade});
        }
    };

    /**
     * Return the size defined in the options object
     *
     * @method getSize
     *
     * @return {array} two element array [height, width]
     */
    ToggleButton.prototype.getSize = function getSize() {
        return this.options.size;
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    ToggleButton.prototype.render = function render() {
        return this.arbiter.render();
    };

    module.exports = ToggleButton;
});