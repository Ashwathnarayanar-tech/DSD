!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self)["browser-detection"]=t()}(this,function(){"use strict";var s={getFeature:function(e){return s.getProperty(s.windowObject,e)},hasFeature:function(e){return void 0!==s.getFeature(e)},hasStyle:function(e){return void 0!==s.windowObject.document.documentElement.style[e]},getProperty:function(t,e){var r;for(e=e.split(".");r=e.shift();){if(!(r in t))return;try{t=t[r]}catch(e){t=null}}return t},isMobile:function(){return s.hasFeature("orientation")},hasPlugin:function(e){var t=s.getFeature("navigator.plugins");if(void 0!==t[e])return!0;for(var r in t)if(t[r].name===e)return!0;return!1},windowObject:"undefined"!=typeof window?window:null},o="Mac OS",n="iOS",i="Windows",u="Android",l="Linux",p="OpenBSD",h="Unix",c="Solaris",f={5.1:"XP",5.2:"Server 2003","6.0":"Vista",6.1:7,6.2:8,"10.0":10};function F(){return function(){var e,t,r,a=s.getFeature("navigator.appVersion");if(r=a.match(/Windows NT (\d+)\.(\d+)/))e=i,t=f[r[1]+"."+r[2]];else if(r=a.match(/Mac OS X ((\d+)(_(\d+))?)/))e=o,t=parseFloat(r[1].replace(/_/g,"."));else if(r=a.match(/Android ((\d+)(\.(\d+))?)/))e=u,t=parseFloat(r[1]);else if(r=a.match(/Linux (i686|x86_64)/))e=l,t=r[1];else if(/OpenBSD/.test(a))e=p;else if(/HP-UX/.test(a))e=h;else if(/SunOS/.test(a))e=c;else if(r=a.match(/OS ((\d+)(_(\d+))?)/))e=n,t=parseFloat(r[1].replace(/_/g,"."));else{if(!(r=a.match(/iPhone OS ((\d+)(_(\d+))?)/)))return;e=n,t=parseFloat(r[1].replace(/_/g,"."))}return{os:e,osVersion:t}}()||function(){var e=s.getFeature("navigator.oscpu");if(e){var t,r,a;if(a=e.match(/Windows NT (\d+)\.(\d+)/))t=i,r=f[a[1]+"."+a[2]];else if(a=e.match(/Mac OS X ((\d+)(\.(\d+))?)/))t=o,r=parseFloat(a[1].replace(/_/g,"."));else if(a=e.match(/Linux (i686|x86_64)/))t=l,r=a[1];else if(/OpenBSD/.test(e))t=p;else if(/HP-UX/.test(e))t=h;else{if(!/SunOS/.test(e))return;t=c}return{os:t,osVersion:r}}}()||(t=s.getFeature("navigator.platform"),/Macintosh|MacIntel|MacPPC|Mac68K/.test(t)?e=o:/iPhone|iPad|iPod/.test(t)?e=n:/Win32|Win64|Windows|WinCE/.test(t)?e=i:/Linux/.test(t)?e=l:/OpenBSD/.test(t)?e=p:/HP-UX/.test(t)?e=h:/SunOS/.test(t)&&(e=c),{os:e,osVersion:void 0});var e,t}var a="Trident",d="EdgeHTML",y="Gecko",m="WebKit",g="Blink",e="KHTML",t="Presto";function v(){return s.hasStyle("msScrollLimit")||s.hasStyle("behavior")?s.hasFeature("CSS")?d:a:s.hasStyle("MozAppearance")?y:s.hasStyle("OLink")?t:s.hasStyle("KhtmlUserInput")?e:s.hasStyle("webkitAppearance")?s.hasFeature("Intl.v8BreakIterator")&&s.hasFeature("CSS.supports")?g:m:void 0}function b(){return s.hasFeature("CompressionStream")?80:s.hasFeature("GeolocationCoordinates")?79:s.hasFeature("RTCDataChannel.prototype.maxPacketLifeTime")?78:s.hasFeature("FormDataEvent")?77:s.hasFeature("HTMLDocument.prototype.onsecuritypolicyviolation")?76:s.hasFeature("HTMLVideoElement.prototype.playsInline")?75:s.hasFeature("TextEncoder.prototype.encodeInto")?74:s.hasFeature("RTCRtpReceiver.prototype.getParameters")?73:s.hasFeature("Intl.ListFormat")?72:s.hasFeature("ShadowRoot.prototype.fullscreenElement")?71:s.hasFeature("MediaStreamTrack.prototype.contentHint")?70:s.hasFeature("webkitRTCPeerConnection.prototype.getTransceivers")?69:s.hasFeature("CustomElementRegistry.prototype.upgrade")?68:s.hasFeature("DataView.prototype.setBigUint64")?67:s.hasFeature("AbortController")?66:s.hasFeature("PerformanceObserver.prototype.takeRecords")?65:s.hasFeature("Document.prototype.alinkColor")?64:s.hasFeature("HTMLFrameSetElement.prototype.onbeforeprint")?63:s.hasFeature("HTMLDataElement")?62:s.hasFeature("SVGAnimationElement.prototype.getAttributeNames")?61:s.hasFeature("BroadcastChannel.prototype.onmessageerror")?60:s.hasFeature("ImageCapture.prototype.getPhotoCapabilities")?59:s.hasFeature("AudioContext.prototype.baseLatency")?58:s.hasFeature("AudioContext.prototype.getOutputTimestamp")?57:s.hasFeature("BaseAudioContext.prototype.createConstantSource")?56:s.hasFeature("document.body.onauxclick")?55:s.hasFeature("Attr.prototype.getRootNode")?54:s.hasFeature("Element.prototype.attachShadow")?53:s.hasFeature("AudioListener.prototype.forwardX")?52:s.hasFeature("CanvasCaptureMediaStreamTrack")?51:s.hasFeature("DOMTokenList.prototype.value")?50:s.hasFeature("URLSearchParams.prototype.toString")?49:s.hasFeature("webkitIDBIndex.prototype.getAll")?48:s.hasFeature("CSSNamespaceRule")?47:s.hasFeature("Performance.prototype.onresourcetimingbufferfull")?46:s.hasFeature("ServiceWorkerContainer.prototype.getRegistrations")?45:s.hasFeature("URIError.stackTraceLimit")?44:s.hasFeature("AnimationEvent")?43:s.hasFeature("AudioContext.prototype.close")?42:s.hasFeature("AudioContext.prototype.resume")?41:s.hasFeature("HTMLButtonElement.prototype.reportValidity")?40:void 0}function S(){var e,t=v(),r=F();if(-1!==[g].indexOf(t)&&s.hasFeature("chrome")&&(e=b()))return Object.assign(r,{browser:"Chromium",browserVersion:e,layout:t,layoutVersion:void 0})}var C={72:.6,73:.61,74:.63,75:.65,76:.67,77:.69,78:1,79:1.1,80:1.3};function r(){return s.isMobile()&&function(){var e=v(),t=F();if(-1!==[m,g].indexOf(e)){var r=s.hasFeature("$jscomp")||s.hasFeature("__gCrWeb")||s.hasFeature("webkit");if(e!==m||r){var a=s.hasFeature("chrome");if(e!==g||a){var o=b();if(o)return Object.assign(t,{browser:"Chrome Mobile",browserVersion:o,layout:e,layoutVersion:void 0})}}}}()||function(){if(s.getFeature("navigator.appVersion").match(/Opera|OPR\//)){var e=S();if(e){var t=e.browserVersion;return Object.assign(e,{browser:"Opera",browserVersion:t-13})}}}()||function(){var e,t=s.getFeature("navigator.plugins"),r=S();if(r){var a=s.hasPlugin("Chrome PDF Plugin")&&s.hasPlugin("Chrome PDF Viewer");if(0===t.length||2===t.length&&a)return.67===(e=C[r.browserVersion])&&2===t.length&&(e=.68),Object.assign(r,{browser:"Brave",browserVersion:e})}}()||function(){s.getFeature("navigator.plugins");var e,t=v(),r=F(),a=S();return a&&s.hasPlugin("Microsoft Edge PDF Plugin")?Object.assign(a,{browser:"Edge"}):(t===d&&(s.hasFeature("AuthenticatorAssertionResponse")?e=44:s.hasFeature("PaymentRequestUpdateEvent.prototype.bubbles")?e=42:s.hasFeature("AbortController")?e=41:s.hasFeature("CanvasRenderingContext2D.prototype.imageSmoothingEnabled")?e=40:s.hasFeature("AudioContext.prototype.close")?e=38:s.hasFeature("AudioBuffer.prototype.copyFromChannel")?e=25:s.hasFeature("ANGLE_instanced_arrays.drawArraysInstancedANGLE")&&(e=20)),e?Object.assign(r,{browser:"Edge",browserVersion:e,layout:t,layoutVersion:void 0}):void 0)}()||function(){var e,t=v(),r=F();if(-1!==[a].indexOf(t)){if(s.hasFeature("ANGLE_instanced_arrays"))e=11;else if(s.hasFeature("AnimationEvent"))e=10;else if(s.hasFeature("CSSRule"))e=9;else if(s.hasFeature("console"))e=8;else if(s.hasFeature("HTMLElement.prototype.tabIndex"))e=7;else if(s.hasFeature("CharacterData"))e=6;else if(s.hasFeature("document.getElementById"))e=5.5;else if(s.hasFeature("document.documentElement"))e=5;else if(s.hasFeature("document.queryCommandEnabled"))e=4;else if(s.hasFeature("HTMLMarqueeElement"))e=2;else{if(!s.hasFeature("HTMLSelectElement"))return;e=1}return Object.assign(r,{browser:"IE",browserVersion:e,layout:t,layoutVersion:void 0})}}()||function(){var e,t=v(),r=F();if(-1!==[y].indexOf(t)&&(s.hasFeature("InstallTrigger")||s.hasFeature("Error.prototype.toSource"))){if(s.hasFeature("ServiceWorkerRegistration.prototype.active"))e=74;else if(s.hasStyle("overscroll-behavior-block"))e=73;else if(s.hasFeature("FormDataEvent"))e=72;else if(s.hasFeature("MathMLElement"))e=71;else if(s.hasFeature("AudioContext.prototype.baseLatency"))e=70;else if(s.hasFeature("Blob.prototype.arrayBuffer"))e=69;else if(s.hasFeature("AudioContext.prototype.createMediaStreamTrackSource"))e=68;else if(s.hasFeature("InputEvent.prototype.data"))e=67;else if(s.hasFeature("HTMLSlotElement.prototype.assignedElements"))e=66;else if(s.hasFeature("HTMLMarqueeElement"))e=65;else if(s.hasFeature("Document.prototype.exitFullscreen"))e=64;else if(s.hasFeature("Animation.prototype.effect"))e=63;else if(s.hasFeature("DOMPointReadOnly.prototype.toJSON"))e=62;else if(s.hasFeature("String.prototype.trimStart"))e=61;else if(s.hasFeature("Animation.prototype.updatePlaybackRate"))e=60;else if(s.hasFeature("Animation.prototype.pending"))e=59;else if(s.hasFeature("FontFace.prototype.display"))e=58;else if(s.hasFeature("AbortController"))e=57;else if(s.hasFeature("Document.prototype.onvisibilitychange"))e=56;else if(s.hasFeature("RTCRtpSender.prototype.getStats"))e=55;else if(s.hasFeature("URL.prototype.toJSON"))e=54;else if(s.hasFeature("BaseAudioContext.prototype.state"))e=53;else if(s.hasFeature("ConstantSourceNode"))e=52;else if(s.hasFeature("CanvasRenderingContext2D.prototype.imageSmoothingEnabled"))e=51;else if(s.hasFeature("Object.getOwnPropertyDescriptors"))e=50;else if(s.hasFeature("CanvasRenderingContext2D.prototype.filter"))e=49;else if(s.hasFeature("Animation"))e=48;else if(s.hasFeature("IDBKeyRange.prototype.includes"))e=47;else if(s.hasFeature("History.prototype.scrollRestoration"))e=46;else if(s.hasFeature("Element.prototype.getAttributeNames"))e=45;else if(s.hasFeature("URLSearchParams.prototype.entries"))e=44;else if(s.hasFeature("HTMLCanvasElement.prototype.captureStream"))e=43;else{if(!s.hasFeature("Reflect"))return;e=42}return Object.assign(r,{browser:"Firefox",browserVersion:e,layout:t,layoutVersion:void 0})}}()||function(){var e,t=v(),r=F();if(-1!==[m].indexOf(t)){if(s.hasFeature("Document.prototype.onpointerenter"))e=13;else if(s.hasFeature("DOMRectList"))e=12;else if(s.hasFeature("HTMLSlotElement.prototype.onrejectionhandled"))e=11;else if(s.hasFeature("XMLHttpRequest.prototype.onreadystatechange"))e=10;else if(s.hasFeature("AnimationEvent"))e=9;else{if(!s.hasFeature("Blob"))return;e=8}return Object.assign(r,{browser:"Safari",browserVersion:e,layout:t,layoutVersion:void 0})}}()||function(){var e=S();if(e)return s.hasPlugin("Chrome PDF Viewer")&&!s.hasPlugin("Chromoting Viewer")?Object.assign(e,{browser:"Chrome"}):void 0}()||S()}return r.helpers=s,r});