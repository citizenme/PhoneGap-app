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
    var MyDraggable         = require("./MyDraggable");
    var SnapTransition      = require("famous/transitions/SnapTransition");
    var SpringTransition    = require("famous/transitions/SpringTransition");
    var EventHandler        = require('famous/core/EventHandler');
    var ToggleCircle        = require('./ToggleCircle');
    var MirrorLens          = require('./MirrorLens');
    //var ToggleButton        = require('./ToggleButton');
    
    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('snap', SnapTransition);
 
    var mainContext = Engine.createContext();

    var trans = {
      method: 'spring',
      period: 1000,
      dampingRatio: 30000,
      velocity: 100000
    };
    
    // Draggable Object Parameters
    var draggable = new MyDraggable({
        snapX: 0, 
        snapY: 0, 
        xRange: [-2000, 2000],
        yRange: [-2000, 2000],
        scale: 0.15
    });
    
    var windowWidth = window.innerWidth;
    var isWideScreen;
    if (windowWidth > 400) {
        isWideScreen = true;
    }else {
        isWideScreen = false;
    }

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
         
         transform: Transform.scale(1, 1, 1)
    });

    var footerTranslateModifier = new StateModifier({
         align: [0,1],
         transform: Transform.scale(1, 1, 1)
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
            //backgroundColor: '#FFFFFF'
        }
    });
    
    var view = new View();
    
    //--------------------------------------------------------//
    //---- Circle Surfaces -----------------------------------//
    //--------------------------------------------------------//
    var profile_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','profile'],
        offClasses: ['mirror', 'profile']
    });
    var youtube_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','youtube'],
        offClasses: ['mirror', 'youtube', 'red']
    });
    var youtubePosMod = new StateModifier({
        origin: [0.545, 0.331]
    });
    var facebook_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','facebook'],
        offClasses: ['mirror', 'facebook', 'red']
    });
    var facebookPosMod = new StateModifier({
        origin: [0.375, 0.375]
    });
    var instagram_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','instagram'],
        offClasses: ['mirror', 'instagram', 'red']
    });

    var instagramPosMod = new StateModifier({
        origin: [0.625, 0.625]
    });
    var tumblr_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','tumblr'],
        offClasses: ['mirror', 'tumblr', 'green']
    });
    var tumblrPosMod = new StateModifier({
        origin: [0.454, 0.671]
    });
    var twitter_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','twitter'],
        offClasses: ['mirror', 'twitter', 'green']
    });
    var twitterPosMod = new StateModifier({
        origin: [0.670, 0.454]
    });
    var linkedin_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','linkedin'],
        offClasses: ['mirror', 'linkedin', 'red']
    });
    var linkedinPosMod = new StateModifier({
        origin: [0.33, 0.545]
    });
    var gplus_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','gplus'],
        offClasses: ['mirror', 'gplus', 'green']
    });
    var gplusPosMod = new StateModifier({
        origin: [0.792, 0.58]
    });
    var citizenme_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','citizenme'],
        offClasses: ['mirror', 'citizenme']
    });
    var citizenmePosMod = new StateModifier({
        origin: [0.205, 0.42]
    });
    var dropbox_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','dropbox'],
        offClasses: ['mirror', 'dropbox', 'red']
    });
    var dropboxPosMod = new StateModifier({
        origin: [0.715, 0.285]
    });
    var amazon_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','amazon'],
        offClasses: ['mirror', 'amazon', 'red']
    });
    var amazonPosMod = new StateModifier({
        origin: [0.252, 0.249]
    });
    var apple_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','apple'],
        offClasses: ['mirror', 'apple', 'green']
    });
    var applePosMod = new StateModifier({
        origin: [0.423, 0.205]
    });
    var delicious_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','delicious'],
        offClasses: ['mirror', 'delicious', 'red']
    });
    var deliciousPosMod = new StateModifier({
        origin: [0.592, 0.160]
    });
    var duck_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','duck'],
        offClasses: ['mirror', 'duck', 'red']
    });
    var duckPosMod = new StateModifier({
        origin: [0.761, 0.115]
    });
    var evernote_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','evernote'],
        offClasses: ['mirror', 'evernote', 'green']
    });
    var evernotePosMod = new StateModifier({
        origin: [0.885, 0.240]
    });
    var flickr_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','flickr'],
        offClasses: ['mirror', 'flickr', 'red']
    });
    var flickrPosMod = new StateModifier({
        origin: [0.840, 0.410]
    });
    var foursquare_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','foursquare'],
        offClasses: ['mirror', 'foursquare', 'red']
    });
    var foursquarePosMod = new StateModifier({
        origin: [0.962, 0.535]
    });
    var github_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','github'],
        offClasses: ['mirror', 'github', 'green']
    });
    var githubPosMod = new StateModifier({
        origin: [0.082, 0.295]
    });
    var microsoft_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','microsoft'],
        offClasses: ['mirror', 'microsoft', 'red']
    });
    var microsoftPosMod = new StateModifier({
        origin: [0.126, 0.125]
    });
    var myspace_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','myspace'],
        offClasses: ['mirror', 'myspace', 'red']
    });
    var myspacePosMod = new StateModifier({
        origin: [0.296, 0.080]
    });
    var path_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','path'],
        offClasses: ['mirror', 'path', 'red']
    });
    var pathPosMod = new StateModifier({
        origin: [0.465, 0.040]
    });
    var pinterest_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','pinterest'],
        offClasses: ['mirror', 'pinterest', 'green']
    });
    var pinterestPosMod = new StateModifier({
        origin: [0.035, 0.465]
    });
    var skype_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','skype'],
        offClasses: ['mirror', 'skype', 'green']
    });
    var skypePosMod = new StateModifier({
        origin: [0.160, 0.590]
    });
    var soundcloud_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','soundcloud'],
        offClasses: ['mirror', 'soundcloud', 'green']
    });
    var soundcloudPosMod = new StateModifier({
        origin: [0.284, 0.715]
    });
    var spotify_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','spotify'],
        offClasses: ['mirror', 'spotify', 'red']
    });
    var spotifyPosMod = new StateModifier({
        origin: [0.580, 0.795]
    });
    var wordpress_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','wordpress'],
        offClasses: ['mirror', 'wordpress', 'red']
    });
    var wordpressPosMod = new StateModifier({
        origin: [0.750, 0.75]
    });
    var yahoo_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','yahoo'],
        offClasses: ['mirror', 'yahoo', 'red']
    });
    var yahooPosMod = new StateModifier({
        origin: [0.41, 0.84]
    });
    var yelp_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','yelp'],
        offClasses: ['mirror', 'yelp', 'red']
    });
    var yelpPosMod = new StateModifier({
        origin: [0.115, 0.755]
    });
    var stumbledupon_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','stumbledupon'],
        offClasses: ['mirror', 'stumbledupon', 'red']
    });
    var stumbleduponPosMod = new StateModifier({
        origin: [0.915, 0.705]
    });
    var twitpic_circle = new MirrorLens({
        size: [300, 300],
        content: '',
        onClasses: ['lens','twitpic'],
        offClasses: ['mirror', 'twitpic', 'green']
    });
    var twitpicPosMod = new StateModifier({
        origin: [0.238, 0.882]
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
    view.add(amazonPosMod).add(amazon_circle);
    view.add(applePosMod).add(apple_circle);
    view.add(deliciousPosMod).add(delicious_circle);
    view.add(duckPosMod).add(duck_circle);
    view.add(evernotePosMod).add(evernote_circle);
    view.add(flickrPosMod).add(flickr_circle);
    view.add(foursquarePosMod).add(foursquare_circle);
    view.add(githubPosMod).add(github_circle);
    view.add(microsoftPosMod).add(microsoft_circle);
    view.add(myspacePosMod).add(myspace_circle);
    view.add(pathPosMod).add(path_circle);
    view.add(pinterestPosMod).add(pinterest_circle);
    view.add(skypePosMod).add(skype_circle);
    view.add(soundcloudPosMod).add(soundcloud_circle);
    view.add(spotifyPosMod).add(spotify_circle);
    view.add(wordpressPosMod).add(wordpress_circle);
    view.add(yahooPosMod).add(yahoo_circle);
    view.add(yelpPosMod).add(yelp_circle);
    view.add(stumbleduponPosMod).add(stumbledupon_circle);
    view.add(twitpicPosMod).add(twitpic_circle);
    container.add(view);
    
     // Events
    // ScaleSync Pipe Event
    Engine.pipe(scaleSync);
    // ScaleSync Pipe Event
    Engine.pipe(draggable);

    var eventHandlerCircle = new EventHandler();
    var eventHandlerSelectCircle = new EventHandler();

    eventHandlerCircle.pipe(eventHandlerSelectCircle);
    
   
    function initialScale() {
        
         containerScaleModifier.setTransform(
            Transform.scale(isWideScreen ? 0.4 : 0.15, isWideScreen ? 0.4 : 0.15, 1),
            {curve: Easing.inCirc, duration : 500 }
        );
        
    };
    function scaleUp() {
        if(isWideScreen) {
             modifier.setTransform(
                Transform.scale(4.0, 4.0, 1),
                {curve: Easing.inCirc, duration : 500 }
            );
        }else {
            modifier.setTransform(
                Transform.scale(6.0, 6.0, 1),
                {curve: Easing.inCirc, duration : 500 }
            );
        }
        footerMod.setTransform({
            transform: Transform.translate(0, 0, 1000000000000)
        });
    };
    function scaleDown() {

            modifier.setTransform(
            Transform.scale(1.0, 1.0, 1),
            {curve: Easing.inCirc, duration : 500 }
        );
        footerMod.setTransform({
            transform: Transform.translate(0, 0, 1000000000000)
        });
    };

     // Scale Sync event functions
    scaleSync.on("start", function() {
        start++;
    });

    scaleSync.on("update", function(data) {
        update++;
        growShrink = data.velocity > 0 ? "Growing" : "Shrinking";
        scale = data.scale;
        
    });

    scaleSync.on("end", function() {
        end++;
        
        if (update > 0) {
            if (scale < 1){
                newScale = 1;
                //eventHandlerSelectCircle.emit('deselectCircle');
                // newScale = newScale - (2 + scale);
                // if(newScale < 1){
                //     newScale = 1;
                // }
            }else if (scale > 1) {
                newScale = isWideScreen ? 4.0 : 6.5;
                //eventHandlerSelectCircle.emit('selectCircle');
                //newScale = newScale + (scale);
                // if (newScale >= 2.5)
                // {
                //     newScale = 9.5;
                // }
            }
        }
        modifier.setTransform(
            Transform.scale(newScale, newScale, 1),
            {curve: Easing.inCirc, duration : 200 },
            function() { 
                if (newScale < 4) {
                    eventHandlerSelectCircle.emit('deselectCircle');
                }else if (newScale >= 4) {
                    eventHandlerSelectCircle.emit('selectCircle');
                }
            }
        );
        // footerMod.setTransform({
        //     transform: Transform.translate(0, 0, 1000000000000)
        // });
        
          
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
        classes: ['noBorderRadius'],
        properties:{
            color:'white',
            backgroundColor:'#212121',
            zIndex:'3',
            borderLeft: 'none',
            boxShadow:  'none'
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
        coverSurface.setProperties({boxShadow:'none', borderLeft: 'none'});
    }
    function coverDrawOut() {
        coverDrag.setPosition([25,0],
            { duration : 600, curve: 'easeInOut' },
            function() { 
                coverPos = 200;
            }
        );
        coverState=false;
        coverSurface.setProperties({boxShadow:'3px 3px 5px 6px #000', borderLeft: '2px solid black'});
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
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    youtube_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    facebook_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    instagram_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    tumblr_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    twitter_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    linkedin_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    gplus_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    citizenme_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    dropbox_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    amazon_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    apple_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    delicious_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    duck_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    evernote_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    flickr_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    foursquare_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    github_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    microsoft_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    myspace_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    path_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    pinterest_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();

    });
    skype_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    soundcloud_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    spotify_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    wordpress_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    yahoo_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    yelp_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    stumbledupon_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });
    twitpic_circle.on("click", function() {
        eventHandlerSelectCircle.emit('selectCircle');
        scaleUp();
    });

    var eventHandlerMirrorSelect = new EventHandler();
    var iconSelectHandler = new EventHandler();

    profile_circle.pipe(eventHandlerMirrorSelect);
    profile_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(profile_circle);
    youtube_circle.pipe(eventHandlerMirrorSelect);
    youtube_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(youtube_circle);
    facebook_circle.pipe(eventHandlerMirrorSelect);
    facebook_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(facebook_circle);
    instagram_circle.pipe(eventHandlerMirrorSelect);
    instagram_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(instagram_circle);
    tumblr_circle.pipe(eventHandlerMirrorSelect);
    tumblr_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(tumblr_circle);
    twitter_circle.pipe(eventHandlerMirrorSelect);
    twitter_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(twitter_circle);
    linkedin_circle.pipe(eventHandlerMirrorSelect);
    linkedin_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(linkedin_circle);
    gplus_circle.pipe(eventHandlerMirrorSelect);
    gplus_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(gplus_circle);
    citizenme_circle.pipe(eventHandlerMirrorSelect);
    citizenme_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(citizenme_circle);
    dropbox_circle.pipe(eventHandlerMirrorSelect);
    dropbox_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(dropbox_circle);
    amazon_circle.pipe(eventHandlerMirrorSelect);
    amazon_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(amazon_circle);
    apple_circle.pipe(eventHandlerMirrorSelect);
    apple_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(apple_circle);
    delicious_circle.pipe(eventHandlerMirrorSelect);
    delicious_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(delicious_circle);
    duck_circle.pipe(eventHandlerMirrorSelect);
    duck_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(duck_circle);
    evernote_circle.pipe(eventHandlerMirrorSelect);
    evernote_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(evernote_circle);
    flickr_circle.pipe(eventHandlerMirrorSelect);
    flickr_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(flickr_circle);
    foursquare_circle.pipe(eventHandlerMirrorSelect);
    foursquare_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(foursquare_circle);
    github_circle.pipe(eventHandlerMirrorSelect);
    github_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(github_circle);
    microsoft_circle.pipe(eventHandlerMirrorSelect);
    microsoft_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(microsoft_circle);
    myspace_circle.pipe(eventHandlerMirrorSelect);
    myspace_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(myspace_circle);
    path_circle.pipe(eventHandlerMirrorSelect);
    path_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(path_circle);
    pinterest_circle.pipe(eventHandlerMirrorSelect);
    pinterest_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(pinterest_circle);
    skype_circle.pipe(eventHandlerMirrorSelect);
    skype_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(skype_circle);
    soundcloud_circle.pipe(eventHandlerMirrorSelect);
    soundcloud_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(soundcloud_circle);
    spotify_circle.pipe(eventHandlerMirrorSelect);
    spotify_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(spotify_circle);
    wordpress_circle.pipe(eventHandlerMirrorSelect);
    wordpress_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(wordpress_circle);
    yahoo_circle.pipe(eventHandlerMirrorSelect);
    yahoo_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(yahoo_circle);
    yelp_circle.pipe(eventHandlerMirrorSelect);
    yelp_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(yelp_circle);
    stumbledupon_circle.pipe(eventHandlerMirrorSelect);
    stumbledupon_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(stumbledupon_circle);
    twitpic_circle.pipe(eventHandlerMirrorSelect);
    twitpic_circle.pipe(iconSelectHandler);
    eventHandlerSelectCircle.pipe(twitpic_circle);
   
    // eventHandlerMirrorSelect.on('select', function() {
    //      modifier.setTransform(
    //         Transform.scale(8.0, 8.0, 1),
    //         {curve: Easing.inCirc, duration : 500 }
    //     );

    // });
    eventHandlerMirrorSelect.on('deselect', function() {
         scaleDown();
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

    var footerMod = new StateModifier({
        transform: Transform.translate(0, 0, 1000000000000)
    });
    // layout.footer.add(tabBar);
    layout.footer.add(tabBar);

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

    feedbackButton.on("click", function() {  

        headerSurface.setContent('FeedBack'); 
        mirrorButton.deselect(); 
        servicesButton.deselect(); 
        menuButton.deselect();
         ;
    });
    mirrorButton.on("click", function() { 

        renderController.show(container); 
        headerSurface.setContent('Mirror');  
        feedbackButton.deselect(); 
        servicesButton.deselect(); 
        menuButton.deselect();

    });
    servicesButton.on("click", function() { 

        renderController.show(servicesContainer); 
        headerSurface.setContent('Services'); 
        mirrorButton.deselect(); 
        feedbackButton.deselect(); 
        menuButton.deselect();
        
    });
    menuButton.on("click", function() {  

        headerSurface.setContent('Menu'); 
        mirrorButton.deselect(); 
        servicesButton.deselect(); 
        feedbackButton.deselect();

    });

    Engine.on('resize', function() {
        coverReset();
    });
    
    mirrorButton.select();

    coverReset();

    mainContext.add(layout);

    initialScale();
});