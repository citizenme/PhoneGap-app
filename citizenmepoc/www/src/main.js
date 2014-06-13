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
    var EventHandler        = require('famous/core/EventHandler');
    var ToggleCircle        = require('./ToggleCircle');
    var ToggleButton        = require('./ToggleButton');
    
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

    var containerScaleModifier = new StateModifier( {
         transform: Transform.scale(0.25, 0.25, 1)
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
        size: [2000, 2000],
        properties: {
            overflow: 'hidden',
            backgroundColor: '#212121'
        }
    });
    
    var view = new View();
    
    //--------------------------------------------------------//
    //---- Circle Surfaces -----------------------------------//
    //--------------------------------------------------------//
    var profile_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','profile'],
        offClasses: ['mirror', 'profile']
    });
    var youtube_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','youtube'],
        offClasses: ['mirror', 'youtube', 'red']
    });
    var youtubePosMod = new StateModifier({
        origin: [0.545, 0.331]
    });
    var facebook_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','facebook'],
        offClasses: ['mirror', 'facebook', 'red']
    });
    var facebookPosMod = new StateModifier({
        origin: [0.375, 0.375]
    });
    var instagram_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','instagram'],
        offClasses: ['mirror', 'instagram', 'red']
    });

    var instagramPosMod = new StateModifier({
        origin: [0.625, 0.625]
    });
    var tumblr_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','tumblr'],
        offClasses: ['mirror', 'tumblr', 'green']
    });
    var tumblrPosMod = new StateModifier({
        origin: [0.454, 0.671]
    });
    var twitter_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','twitter'],
        offClasses: ['mirror', 'twitter', 'green']
    });
    var twitterPosMod = new StateModifier({
        origin: [0.670, 0.454]
    });
    var linkedin_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','linkedin'],
        offClasses: ['mirror', 'linkedin', 'red']
    });
    var linkedinPosMod = new StateModifier({
        origin: [0.33, 0.545]
    });
    var gplus_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','gplus'],
        offClasses: ['mirror', 'gplus', 'green']
    });
    var gplusPosMod = new StateModifier({
        origin: [0.795, 0.575]
    });
    var citizenme_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','citizenme'],
        offClasses: ['mirror', 'citizenme']
    });
    var citizenmePosMod = new StateModifier({
        origin: [0.205, 0.42]
    });
    var dropbox_circle = new ToggleCircle({
        size: [300, 300],
        content: '',
        onClasses: ['lens','dropbox'],
        offClasses: ['mirror', 'dropbox', 'red']
    });
    var dropboxPosMod = new StateModifier({
        origin: [0.715, 0.285]
    });

    view.add(originCenterMod).add(profile_circle);
    view.add(youtubePosMod).add(youtube_circle);
    view.add(facebookPosMod).add(facebook_circle);
    view.add(instagramPosMod).add(instagram_circle)
    view.add(tumblrPosMod).add(tumblr_circle);
    view.add(twitterPosMod).add(twitter_circle);
    view.add(linkedinPosMod).add(linkedin_circle);
    view.add(gplusPosMod).add(gplus_circle);
    view.add(citizenmePosMod).add(citizenme_circle);
    view.add(dropboxPosMod).add(dropbox_circle);
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
                newScale = newScale - (2 + scale);
                if(newScale < 1){
                    newScale = 1;
                }
            }else if (scale > 1) {
                newScale = newScale + (scale);
                if (newScale >= 3.5)
                {
                    newScale = 3.5;
                }
            }
        }else {
            newScale = scale;
        }
         modifier.setTransform(
            Transform.scale(newScale, newScale, 1),
            {curve: Easing.inCirc, duration : 500 }
        );
         if (newScale == 1) {
            profile_circle.deselect();
            youtube_circle.deselect();
            facebook_circle.deselect();
            instagram_circle.deselect();
            tumblr_circle.deselect();
            twitter_circle.deselect();
            linkedin_circle.deselect();
            gplus_circle.deselect();
            citizenme_circle.deselect();
            dropbox_circle.deselect();
         }else if (newScale > 2) {
            profile_circle.select();
            youtube_circle.select();
            facebook_circle.select();
            instagram_circle.select();
            tumblr_circle.select();
            twitter_circle.select();
            linkedin_circle.select();
            gplus_circle.select();
            citizenme_circle.select();
            dropbox_circle.select();
         }
         
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

    // Side Menu
    var coverState = true; 
    var coverPos = 0;

    var coverDrag = new Draggable({
        projection: 'x'
    });

    // HTML to show ScaleSync variable
    var sideMenuTemplate = function() {
        return "<table cellpadding='0' cellspacing='0'><tr><td>Facebook</td></tr><tr><td class='black-td'>Settings</td></tr><tr><td>Settings Page</td></tr><tr><td>Change Password</td></tr><tr><td>Change Email Settings</td></tr><tr><td>Delete Account</td></tr><tr><td>Recover Password</td></tr><tr><td>Change Connected Accounts</td></tr></table>";
    };

    var coverSurface = new Surface({
        size:[undefined,undefined],
        content:sideMenuTemplate(),
        properties:{
            color:'white',
            backgroundColor:'#212121',
            zIndex:'3',
            borderLeft: '2px solid black',
            boxShadow:  '3px 3px 5px 6px #000'
        }
    });
    coverSurface.pipe(coverDrag);

    function coverReset() {
        coverDrag.setPosition([window.innerWidth,0],    
            { duration : 100, curve: 'easeInOut' },
            function() { 
                coverPos = 0;
            }
        );
        coverState = true;
    }
    function coverDrawOut() {
        coverDrag.setPosition([25,0],
            { duration : 600, curve: 'easeInOut' },
            function() { 
                coverPos = 200;
            }
        );
        coverState=false;
    }
    coverDrag.on('end',function(data) {
        if(data.position[0]>(window.innerWidth / 2)) {
            coverReset();
            //menuFadeOut();
        }else  {
            coverDrawOut();
            //menuFadeIn();
        }
    });
    
    layout.content.add(renderController);
    
    layout.content.add(backgroundSurface);

    layout.content.add(modifier).add(draggable).add(containerScaleModifier).add(container);

    layout.content.add(coverDrag).add(coverSurface);

    profile_circle.on("click", function() {
        facebook_circle.select();
        youtube_circle.select(); 
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    youtube_circle.on("click", function() {
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    facebook_circle.on("click", function() {
        profile_circle.select();
        youtube_circle.select(); 
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    instagram_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    tumblr_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    twitter_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    linkedin_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    gplus_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        citizenme_circle.select();
        dropbox_circle.select();
    });
    citizenme_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        dropbox_circle.select();
    });
    dropbox_circle.on("click", function() {
        youtube_circle.select();
        profile_circle.select();
        facebook_circle.select();
        instagram_circle.select();
        tumblr_circle.select();
        twitter_circle.select();
        linkedin_circle.select();
        gplus_circle.select();
        citizenme_circle.select();
    });

    //Engine.pipe(youtube_circle);

    // youtube_circle.on("iconSelect", function() {
    //     alert('Hello');
    // });

    var eventHandlerMirrorSelect = new EventHandler();
    var iconSelectHandler = new EventHandler();

    profile_circle.pipe(eventHandlerMirrorSelect);
    profile_circle.pipe(iconSelectHandler);
    youtube_circle.pipe(eventHandlerMirrorSelect);
    youtube_circle.pipe(iconSelectHandler);
    facebook_circle.pipe(eventHandlerMirrorSelect);
    facebook_circle.pipe(iconSelectHandler);
    instagram_circle.pipe(eventHandlerMirrorSelect);
    instagram_circle.pipe(iconSelectHandler);
    tumblr_circle.pipe(eventHandlerMirrorSelect);
    tumblr_circle.pipe(iconSelectHandler);
    twitter_circle.pipe(eventHandlerMirrorSelect);
    twitter_circle.pipe(iconSelectHandler);
    linkedin_circle.pipe(eventHandlerMirrorSelect);
    linkedin_circle.pipe(iconSelectHandler);
    gplus_circle.pipe(eventHandlerMirrorSelect);
    gplus_circle.pipe(iconSelectHandler);
    citizenme_circle.pipe(eventHandlerMirrorSelect);
    citizenme_circle.pipe(iconSelectHandler);
    dropbox_circle.pipe(eventHandlerMirrorSelect);
    dropbox_circle.pipe(iconSelectHandler);
   
    eventHandlerMirrorSelect.on('select', function() {
         modifier.setTransform(
            Transform.scale(3.0, 3.0, 1),
            {curve: Easing.inCirc, duration : 500 }
        );
    });

    iconSelectHandler.on('iconSelect', function() {
         coverDrawOut();
    });

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


    // layout.footer.add(tabBar);
    layout.footer.add(new StateModifier({
        transform: Transform.translate(0, 0, 100)
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

    coverReset();

    mainContext.add(layout);
});