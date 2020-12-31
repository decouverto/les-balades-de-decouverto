# les-balades-de-decouverto

The application to discover history through rides from Découverto.

![Logo](icon.jpg)

This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).


```bash
cd ${ANDROID_HOME}/emulator && emulator -avd nexus
```

## Table of Contents

* [Google Maps API key](#google-maps)
* [Test Deep Links](#test-deep-links)
* [Available Scripts](#available-scripts)
  * [npm start](#npm-start)
  * [npm test](#npm-test)
  * [npm run ios](#npm-run-ios)
  * [npm run android](#npm-run-android)
* [Writing and Running Tests](#writing-and-running-tests)
* [Troubleshooting](#troubleshooting)
  * [iOS Simulator won't open](#ios-simulator-wont-open)

## AndroidX

Add thoses lines to **gradle.properties**:
```properties
android.useAndroidX=true
android.enableJetifier=true
```

Execute `./androidx.sh` to convert all components

## Google Maps

Before compaling you will have to get a [Google Maps API key](https://developers.google.com/maps/android/), and write it in the `android/app/src/main/res/values/string.xml` file like this:
```
<resources>
    ...
    <string name="google_maps">BkP0rUVlhNDeszphpRwqysxwaa7IdntWB0nbJRK1</string>
</resources>
```

To make sure that you don't commit the key please execute: `git update-index --assume-unchanged android/app/src/main/res/values/string.xml`

## Test Deep Links

```
adb shell am start -W -a android.intent.action.VIEW -d "https://decouverto.fr/preview/jYW1cN8" com.lesbaladesdedecouverto
```
or
```
adb shell am start -W -a android.intent.action.VIEW -d "decouverto://decouverto/preview/jYW1cN8" com.lesbaladesdedecouverto
```

## Mac bug

Create `android/local.properties` file with 
```
sdk.dir = /Users/cedricjung/Library/Android/sdk
```

[Could not find tools.jar](https://stackoverflow.com/questions/64968851/could-not-find-tools-jar-please-check-that-library-internet-plug-ins-javaapple)

Copy the following path
```
/usr/libexec/java_home -V | grep jdk
```

```
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_271.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

```
export ANDROID_HOME=/Users/cedricjung/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
```


DNS:
```
cd ~/Library/Android/sdk/emulator
./emulator -list-avds
./emulator @Pixel_3a_API_30_x86 -dns-server 8.8.8.8
```
## Accept licenses

See [https://stackoverflow.com/questions/39760172/you-have-not-accepted-the-license-agreements-of-the-following-sdk-components](https://stackoverflow.com/questions/39760172/you-have-not-accepted-the-license-agreements-of-the-following-sdk-components)


## Signing strategy

In `android/gradle.properties` file  
```
android.useAndroidX=true
android.enableJetifier=true
MYAPP_RELEASE_STORE_FILE=les-balades-de-decouverto.keystore
MYAPP_RELEASE_STORE_PASSWORD=******************************
MYAPP_RELEASE_KEY_ALIAS=les-balades-de-decouverto
MYAPP_RELEASE_KEY_PASSWORD=******************************
```

## Available Scripts

If Yarn was installed when the project was initialized, then dependencies will have been installed via Yarn, and you should probably use it to run these commands as well. Unlike dependency installation, command running syntax is identical for Yarn and NPM at the time of this writing.

### `npm start`

Runs your app in development mode.

Open it in the [Expo app](https://expo.io) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

Sometimes you may need to reset or clear the React Native packager's cache. To do so, you can pass the `--reset-cache` flag to the start script:

```
npm start -- --reset-cache
# or
yarn start -- --reset-cache
```

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup). We also recommend installing Genymotion as your Android emulator. Once you've finished setting up the native build environment, there are two options for making the right copy of `adb` available to Create React Native App:

##### Using Android Studio's `adb`

1. Make sure that you can run adb from your terminal.
2. Open Genymotion and navigate to `Settings -> ADB`. Select “Use custom Android SDK tools” and update with your [Android SDK directory](https://stackoverflow.com/questions/25176594/android-sdk-location).

##### Using Genymotion's `adb`

1. Find Genymotion’s copy of adb. On macOS for example, this is normally `/Applications/Genymotion.app/Contents/MacOS/tools/`.
2. Add the Genymotion tools directory to your path (instructions for [Mac](http://osxdaily.com/2014/08/14/add-new-path-to-path-command-line/), [Linux](http://www.computerhope.com/issues/ch001647.htm), and [Windows](https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/)).
3. Make sure that you can run adb from your terminal.

## Writing and Running Tests

This project is set up to use [jest](https://facebook.github.io/jest/) for tests. You can configure whatever testing strategy you like, but jest works out of the box. Create test files in directories called `__tests__` or with the `.test` extension to have the files loaded by jest. See the [the template project](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/App.test.js) for an example test. The [jest documentation](https://facebook.github.io/jest/docs/en/getting-started.html) is also a wonderful resource, as is the [React Native testing tutorial](https://facebook.github.io/jest/docs/en/tutorial-react-native.html).

## Troubleshooting

### iOS Simulator won't open

If you're on a Mac, there are a few errors that users sometimes see when attempting to `npm run ios`:

* "non-zero exit code: 107"
* "You may need to install Xcode" but it is already installed
* and others

There are a few steps you may want to take to troubleshoot these kinds of errors:

1. Make sure Xcode is installed and open it to accept the license agreement if it prompts you. You can install it from the Mac App Store.
2. Open Xcode's Preferences, the Locations tab, and make sure that the `Command Line Tools` menu option is set to something. Sometimes when the CLI tools are first installed by Homebrew this option is left blank, which can prevent Apple utilities from finding the simulator. Make sure to re-run `npm/yarn run ios` after doing so.
3. If that doesn't work, open the Simulator, and under the app menu select `Reset Contents and Settings...`. After that has finished, quit the Simulator, and re-run `npm/yarn run ios`.

### JAVA_HOME is set to an invalid directory

[Issue](https://stackoverflow.com/questions/45182717/java-home-is-set-to-an-invalid-directory/49592887)

Don't write `/bin`
```
export JAVA_HOME="/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.212.b04-0.fc29.x86_64/jre"
```