package com.lesbaladesdedecouverto;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.guichaguri.trackplayer.TrackPlayer;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.dialogprogress.DialogProgressPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage; 
import com.oblador.vectoricons.VectorIconsPackage;

import java.util.Arrays;
import java.util.List;

import com.rnfs.RNFSPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new NetInfoPackage(),
          new AsyncStoragePackage(),
          new VectorIconsPackage(),
          new TrackPlayer(),
          new ReactNativePushNotificationPackage(),
          new LocationServicesDialogBoxPackage(),
          new KCKeepAwakePackage(),
          new SplashScreenReactPackage(),
          new RNZipArchivePackage(),
          new DialogProgressPackage(),
          new MapsPackage(),
          new RNFSPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
