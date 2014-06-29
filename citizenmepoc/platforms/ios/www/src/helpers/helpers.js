define(function(require, exports, module) {


    var FamousEngine    = require('famous/core/Engine'),
        Design          = require('main/helpers/designed');





    /*  -----------------------------------------------------------------------------------------

        helpers:

        A bunch of utility functions that make living famously a little less edgy.

        Authors:    Larry Robinson

        Notes:      This expands on the earlier work of Reza and Tim at Famous when they were
                    building the famous zen garden (yahoo weather) app. Nice work guys!

        ---------------------------------------------------------------------------------------*/


    //  Largest size any view window can be (no max!)
    var MAX_WIDTH   = window.innerWidth,
        MAX_HEIGHT  = window.innerHeight;



    var helpers = {
        //set window size properties
        winWidth: Math.min(window.innerWidth,MAX_WIDTH),
        winHeight: Math.min(window.innerHeight,MAX_HEIGHT),

        //amount of rotation in one degree based on a 360 degree circle!
        degree: (Math.PI * 2)/360,

        //scales a width and height to the width (not the height)
        designSize:function (width,height){
            var dw  = (typeof Design != 'undefined') ? Design.width  : this.winWidth,
                dh  = (typeof Design != 'undefined') ? Design.height : this.winHeight,
                w   = Math.floor(width * this.winWidth/dw + 0.5),
                h   = Math.floor(height *  this.winHeight/dh + 0.5);

            return [w,h];
        },

        scaleIt:function (number){
            var dw  = (typeof Design != 'undefined') ? Design.width  : this.winWidth,
                w   = number * this.winWidth/dw;
            return w;
        },

        scaleX:function (number){
            var dw  = (typeof Design != 'undefined') ? Design.width  : this.winWidth,
                w   = number * this.winWidth/dw;
            return w;
        },

        scaleY:function (number){
            var dh  = (typeof Design != 'undefined') ? Design.height  : this.winHeight,
                 h   = number * this.winHeight/dh;
            return h;
        },

        scaleFont: function(font){
            if (!font) return undefined;
            //replace any alphacharacter to get the numeric portion
            var fontSize = font.replace(/[^.0-9]/gi,''); //regex to filter for 09 and decimal
            if (!fontSize) return undefined;

            var dw  = (typeof Design != 'undefined') ? Design.width  : this.winWidth;
            var newSize   = fontSize * this.winWidth/dw;

            //return back in whatever format we were passed
            if (font.indexOf("px") !== -1) return String(newSize)+'px';
            if (font.indexOf("em") !== -1) return String(newSize)+'em';
            return newSize;
        },


    };

    module.exports = helpers;


});


