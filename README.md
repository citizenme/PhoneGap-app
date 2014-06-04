Setup Cordova / PhoneGap:
--------------------------

This configuration is done on a Mac OS device.

- Install Cordova / PhoneGap as explained on http://cordova.apache.org/docs/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface
- Install ios-sim so that you can run the iOS application from Command line without XCode: https://github.com/phonegap/ios-sim
- Install and configure Android SDK
- Add iOS and Android as a platform 

Tech - cordova:
---------------

Test app to make sure that Cordova has been setup properly and that it works with iOS and Android.

Tech - cordova_typescript:
--------------------------

Proof of concept (POC) investigation, proof testing etc using TypeScript with PhoneGap.
The TypedPhoneGap API doesn't work with the latest version of Cordova 3.5.0-0.2.4 so i got it right to use TypeScript with Cordova without any additional libraries.

Tech - typescript_webstorm:
----------------------------

Check how TypeScript code generation works in the WebStorm IDE and how TypeScript can call external JavaScript functions, libraries etc.

Tech - facebookjs:
------------------

Proof of concept (POC) investigation using Facebook's JavaScript API with
Cordova without using any native plugins on the desire platform. Work successfully on iOS, Android and FireFox OS.

References:
------------
   http://typescriptlang.org
   https://github.com/intellifactory/TypedPhoneGap

