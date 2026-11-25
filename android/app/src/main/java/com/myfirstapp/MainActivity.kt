package com.myfirstapp

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  var lastAlertAction: String? = null
  var lastDispatchId: String? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    handleAlertIntent(intent)
    setupScreenWakeOnAlert()
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleAlertIntent(intent)
    setupScreenWakeOnAlert()
  }

  override fun onResume() {
    super.onResume()
    setupScreenWakeOnAlert()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    setupScreenWakeOnAlert()
  }

  private fun handleAlertIntent(intent: Intent?) {
    if (intent == null) return
    val action = intent.getStringExtra("alertAction")
    if (action != null) {
      Log.d("MainActivity", "Received alertAction: $action, dispatchId: ${intent.getStringExtra("dispatchId")}")
      lastAlertAction = action
      lastDispatchId = intent.getStringExtra("dispatchId")
    }
  }

  private fun setupScreenWakeOnAlert() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
    @Suppress("DEPRECATION")
    window.addFlags(
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
      WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
    )
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MyFirstApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
