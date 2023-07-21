#!/usr/bin/env bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_271.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/Users/cedricjung/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
export AVD=$(~/Library/Android/sdk/emulator/emulator -list-avds | head -n 1)
adb reverse tcp:8081 tcp:8081
~/Library/Android/sdk/emulator/emulator -avd $AVD -dns-server 8.8.8.8