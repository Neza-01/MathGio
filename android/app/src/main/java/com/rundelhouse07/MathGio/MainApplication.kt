package com.rundelhouse07.MathGio

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.PackageList
import com.facebook.soloader.SoLoader

// RN 0.79.x: Default host + soporte New Architecture
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

// Expo: wrapper para autolink de módulos
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
    ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

      // En RN 0.79.x son PROPIEDADES, no funciones:
      override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

      override fun getPackages(): List<ReactPackage> {
        return PackageList(this).packages
      }

      // Entrada de Metro usada por Expo
      override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"
    })

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, /* native exopackage */ false)

    // Cargar New Architecture si está habilitada
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      DefaultNewArchitectureEntryPoint.load()
    }
  }
}
