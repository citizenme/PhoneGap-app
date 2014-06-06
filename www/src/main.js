define(function(require, exports, module) {
    var Engine              = require("famous/core/Engine");
    var RenderNode          = require('famous/core/RenderNode');
    var View                = require("famous/core/View");
    var Surface             = require("famous/core/Surface");
    var ViewSequence        = require("famous/core/ViewSequence");
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Utility             = require("famous/utilities/Utility");
    var EdgeSwapper         = require("famous/views/EdgeSwapper");
    var RenderController    = require("famous/views/RenderController");
    var GridLayout          = require("famous/views/GridLayout");
    var HeaderFooterLayout  = require("famous/views/HeaderFooterLayout");
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var Scrollview          = require("famous/views/Scrollview");
    var ImageSurface        = require("famous/surfaces/ImageSurface");
    var TabBar              = require("famous/widgets/TabBar");
    var ToggleButton        = require("famous/widgets/ToggleButton");
    var Transform           = require('famous/core/Transform');
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Matrix              = require('famous/math/Matrix');
    var PinchSync           = require("famous/inputs/PinchSync");
    var ScaleSync           = require("famous/inputs/ScaleSync");
    var Easing              = require('famous/transitions/Easing');
    var Transitionable      = require("famous/transitions/Transitionable");
    var Draggable           = require("famous/modifiers/Draggable");
    var SnapTransition      = require("famous/transitions/SnapTransition");
    

    
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
    
    var layout = new HeaderFooterLayout({ headerSize: 44, footerSize: 50 });
    
 
    var headerContainer = new ContainerSurface({
        size: [undefined, undefined],
        properties: {
            overflow: 'hidden',
            backgroundColor: '#212121'
        }
    });
    
    var headerContainerModifier = new StateModifier({
        align: [0, 0]
    });
    
    var headerDividerStateModifier = new StateModifier({
        transform: Transform.translate(0, 43, 100)
    });
    
    var headerView = new View();
    
    var headerSurface = new Surface({
        content: "Header",
        classes: ['headerBar'],
        properties: {
            lineHeight: "44px",
            textAlign: "center",
            backgroundColor: "#030303"
        }
    });
    
    headerContainer.add(headerContainerModifier).add(headerSurface);
    
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
            backgroundColor: '#212121'
        }
    });
    
    var view = new View();
    
    // Circle Surface
    var circle = new Surface({
        size: [100, 100],
        content: "",
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
            {curve: Easing.inQuad, duration : 500 }
        );
         
        updateSurface.setContent(contentTemplate());  
    });
    
    
    var renderController = new RenderController({
        options: {
            size: [undefined, window.innerHeight - 94]
        }
    });
    
    var contentContainer = new ContainerSurface({
        size: [undefined, window.innerHeight - 94],
        properties: {
            overflow: 'hidden',
            backgroundColor: '#212121'
        }
    });
    
    layout.content.add(renderController);
    
    layout.content.add(backgroundSurface);

    layout.content.add(modifier).add(draggable).add(container);

    var servicesGrid = new GridLayout({
        dimensions: [3, 2],
        cellSize: [77, 117],
        transition: false,
        classes: ['services-grid']
    });

    var googleButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button google-button">Google</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off'],
    });
    var linkedInButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button linkedIn-button">LinkedIn</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off']
    });
    var twitterButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button twitter-button">twitter</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off']
    });
    var citizenMeButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button citizenme-button">citizenme</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off']
    });
    var instagramButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button instagram-button">Instagram</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off']
    });
    var facebookButton = new ToggleButton({
        size: [77, 117],
        content: '<span class="service-button facebook-button">Facebook</span>',
        onClasses: ['services', 'on'],
        offClasses: ['services', 'off']
    });
    
    servicesGrid.sequenceFrom([
        googleButton,
        linkedInButton,
        twitterButton,
        citizenMeButton,
        instagramButton,
        facebookButton
    ]);
    
    
    var servicesOriginCenterMod = new StateModifier({
        origin: [0.5, 0.5]
    });
    
    var servicesContainer = new ContainerSurface({
        size: [undefined, undefined],
        classes: ['gridContainer'],
        properties: {
            overflow: 'hidden',
            backgroundColor: '#212121'
        }
    });
    
    var gridContainer = new ContainerSurface({
        size: [window.innerWidth - 50, undefined],
        classes: ['gridBackground']

    });
    
    var gridView = new View();
    //servicesOriginCenterMod.add(serviceBackgroundSurface);
    
    servicesContainer.add(servicesGrid);
    
    gridView.add(servicesOriginCenterMod).add(servicesContainer);
    //servicesGrid.add(serviceBackgroundSurface);

    var tabBar = new GridLayout({
        dimensions: [4, 1],
        cellSize: [undefined, 50],
        transition: false,
        classes: ['tabbar'],
        properties: {
            backgroundColor: '#222'
        }
    });

    var feedbackButton = new ToggleButton({
        size: [undefined, 50],
        content: '<span class="tab-icon feedback-icon"></span>',
        onClasses: ['navigation', 'feedback-toggle-button', 'on'],
        offClasses: ['navigation', 'feedback-toggle-button', 'off'],
    });
    var mirrorButton = new ToggleButton({
        size: [undefined, 50],
        content: '<span class="tab-icon mirror-icon"></span>',
        onClasses: ['navigation', 'mirror-toggle-button', 'on'],
        offClasses: ['navigation', 'mirror-toggle-button', 'off']
    });
    var servicesButton = new ToggleButton({
        size: [undefined, 50],
        content: '<span class="tab-icon services-icon"></span>',
        onClasses: ['navigation', 'services-toggle-button', 'on'],
        offClasses: ['navigation', 'services-toggle-button', 'off']
    });
    var menuButton = new ToggleButton({
        size: [undefined, 50],
        content: '<span class="tab-icon menu-icon"></span>',
        onClasses: ['navigation', 'menu-toggle-button', 'on'],
        offClasses: ['navigation', 'menu-toggle-button', 'off']
    });

    tabBar.sequenceFrom([
        feedbackButton,
        mirrorButton,
        servicesButton,
        menuButton
    ]);


    layout.footer.add(tabBar);
    layout.footer.add(new StateModifier({
        transform: Transform.translate(0, 0, 1)
    })).add(tabBar);

    renderController.show(container);
    
    layout.header.add(new Surface({
      content: "Mirror",
      properties: {
        lineHeight: "44px",
        textAlign: "center",
        backgroundColor: "#030303",
        color: '#FFFFFF',
        fontWeight: 'bold'
      }
    }));

    feedbackButton.on("click", function() {  headerSurface.setContent('FeedBack'); mirrorButton.deselect(); servicesButton.deselect(); menuButton.deselect(); });
    mirrorButton.on("click", function() { renderController.show(container); headerSurface.setContent('Mirror');  feedbackButton.deselect(); servicesButton.deselect(); menuButton.deselect(); });
    servicesButton.on("click", function() { renderController.show(servicesContainer); headerSurface.setContent('Services'); mirrorButton.deselect(); feedbackButton.deselect(); menuButton.deselect(); });
    menuButton.on("click", function() {  headerSurface.setContent('Menu'); mirrorButton.deselect(); servicesButton.deselect(); feedbackButton.deselect(); });
    
    mirrorButton.select();

    mainContext.add(layout);
});