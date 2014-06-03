define(function(require, exports, module) {
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var View = require("famous/core/View");
    var GridLayout = require("famous/views/GridLayout");
    var PinchSync = require("famous/inputs/PinchSync");
    var ScaleSync = require("famous/inputs/ScaleSync");
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Easing = require('famous/transitions/Easing');
    var Transitionable = require("famous/transitions/Transitionable");
    var Draggable = require("famous/modifiers/Draggable");
    var SnapTransition = require("famous/transitions/SnapTransition");
    
    Transitionable.registerMethod('snap', SnapTransition);
 
    var mainContext = Engine.createContext();
    
    // Draggable Object Parameters
    var draggable = new Draggable({
        xRange: [-100, 300],
        yRange: [-100, 350]
    });
    
    // Variable for draggable
    var trans = {
        method: 'snap',
        period: 300,
        dampingRatio: 0.3,
        velocity: 0
    };

    // Variables for the ScaleSync
    var start = 0;
    var update = 0;
    var end = 0;
    var growShrink = "";
    var scale = 1;
    var newScale = 1;
    var scaleSync = new ScaleSync();
    
    // Modifiers
    // Placement modifier
    var modifier = new StateModifier({
        align: [0.5, 0.5],
        origin: [0.5, 0.5]
    });
    // origin center modifier
    var originCenterMod = new StateModifier({
        origin: [0.5, 0.5]
    });
    // Modifier to position ScaleSync Update Output
    var updateModifier = new StateModifier({
        align: [0,0]
    });
    // Modifier to size the balls
    var scaleMod = new StateModifier({
        size: [100, 100]
    });
    // Modifier to position second ball
    var secCirclePosMod = new StateModifier({
        origin: [0.3, 0.3]
    });
    
    // HTML to show ScaleSync variable
    var contentTemplate = function() {
        return "<div>Start Count: " + start + "</div>" +
        "<div>End Count: " + end + "</div>" +
        "<div>Update Count: " + update + "</div>" +
        "<div>Scale factor: " + scale.toFixed(3) + "</div>" +
        "<div>New Scale factor: " + newScale.toFixed(3) + "</div>" +
        "<div>Scale Direction: " + growShrink + "</div>";
    };
    
    // Surface for ScaleSync Output
    var updateSurface = new Surface({
        size: [200, 200],
        content: contentTemplate(),
        properties: {
            color: '#FFFFFF',
            zIndex: '100'
        }
    });
    
    // Background Surface
    var backgroundSurface = new Surface({
        size: [undefined, undefined],
        properties: {
            backgroundColor: '#212121'
        }  
    });
    
    var container = new ContainerSurface({
        size: [undefined, undefined],
        properties: {
            overflow: 'hidden',
            backgroundColor: 'yellow'
        }
    });
    
    var view = new View();
    
    // Circle Surface
    var circle = new Surface({
        size: [100, 100],
        content: "Hello World",
        properties: {
            lineHeight: "100px",
            textAlign: "center",
            borderRadius: '150px',
            background: 'red'
        }
    });
    circle.pipe(view);

    view.add(originCenterMod).add(circle);
    container.add(view);
    
    
    
     // Events
    // ScaleSync Pipe Event
    Engine.pipe(scaleSync);
    // ScaleSync Pipe Event
    Engine.pipe(draggable);
    
    // Scale Sync event functions
    scaleSync.on("start", function() {
        start++;
        updateSurface.setContent(contentTemplate());
    });

    scaleSync.on("update", function(data) {
        update++;
        growShrink = data.velocity > 0 ? "Growing" : "Shrinking";
        scale = data.scale;
        updateSurface.setContent(contentTemplate());
        
    });

    scaleSync.on("end", function() {
        end++;
        
        if (update > 0) {
            if (scale < 1){
                newScale = newScale - (1 + scale);
                if(newScale < 1){
                    newScale = 1;
                }
            }else if (scale > 1) {
                newScale = newScale + (scale - 1);
                if (newScale >= 3)
                {
                    newScale = 3;
                }
            }
        }else {
            newScale = scale;
        }
         modifier.setTransform(
            Transform.scale(newScale, newScale, 0),
            {curve: Easing.inQuad, duration : 800 }
        );
         
        updateSurface.setContent(contentTemplate());
         
    });
    
    var layout = new HeaderFooterLayout({
      headerSize: 44,
      footerSize: 50
    });
    
    layout.header.add(new Surface({
      content: "Header",
      properties: {
        lineHeight: "44px",
        textAlign: "center",
        backgroundColor: "#030303"
      }
    }));
    
    layout.content.add(backgroundSurface);

    layout.content.add(updateModifier).add(updateSurface);

    layout.content.add(modifier).add(draggable).add(container);
    
    
    function createGrid( section, dimensions ) {
            var grid = new GridLayout({
            dimensions: dimensions
            });
        
            var surfaces = [];
            grid.sequenceFrom(surfaces);
            
            for(var i = 0; i < dimensions[0]; i++) {
                surfaces.push(new Surface({
                content: section + ' ' + (i + 1),
                size: [undefined, undefined],
                properties: {
                color: '#d4d4d4',
                textAlign: 'center',
                backgroundColor: '#212121',
                lineHeight: '50px'
                }
            }));
        }
      
      return grid;
    }

    layout.footer.add(createGrid( 'footer', [4, 1] ));
    
    mainContext.add(layout);
});
