1. implement all flavors (in Android flavors, in iOS schemes) (efficientio, bmsystems, peneder, tsg, be, dev, powerlink)
   and the build pipeline afterwards
2. adding a new flavor - provide a description how to do it and how to test it in development
3. mimic this command in Capacitor: flutter pub run flutter_flavorizr -p android:dummyAssets,ios:xcconfig,ios:
   buildTargets,ios:schema,ios:dummyAssets,ios:launchScreen,assets:clean
4. Check the Flavor class in Dart and implement missing functionality in the web project (flavor name, domain, title,
   light/dark theme, drawerImage, splashimage, splashimage dark, terms url, imprint url, support mail)
5. create Android and iOS launcher icons in Capacitor