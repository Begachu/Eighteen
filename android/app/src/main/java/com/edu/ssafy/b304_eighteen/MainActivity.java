package com.edu.ssafy.b304_eighteen;


import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugins.GeneratedPluginRegistrant;

import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends FlutterActivity {

    @Override
    public void configureFlutterEngine(FlutterEngine flutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);


        new MethodChannel(flutterEngine.getDartExecutor().getBinaryMessenger(), "pitch_peach.flutter.dev/kakao")
                .setMethodCallHandler(
                        (call, result) -> {
                            if (call.method.equals("loginWithApp")) {
                                try {

                                    String url = call.argument("url");
                                    android.content.Intent intent =  android.content.Intent.parseUri(url, android.content.Intent.URI_INTENT_SCHEME);
                                    // 실행 가능한 앱이 있으면 앱 실행
                                    if (intent.resolveActivity(getPackageManager()) != null) {
//                                        val existPackage = packageManager.getLaunchIntentForPackage("" + intent.getPackage());
                                        startActivity(intent);
                                        result.success(null);
                                    } else {
                                        // Fallback URL이 있으면 현재 웹뷰에 로딩
                                        String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                                        if (fallbackUrl != null) {
                                            result.success(fallbackUrl);
                                        }
                                    }
                                }
                                catch (Exception e) {
                                }
                            } else {
                                result.error("UNAVAILABLE", "Cannot Start Activity.", null);
                            }

                        }
                );




        new MethodChannel(flutterEngine.getDartExecutor().getBinaryMessenger(), "pitch_peach.flutter.dev/youtube")
                .setMethodCallHandler(
                        (call, result) -> {
                            if (call.method.equals("playOnYoutube")) {

                                String url = call.argument("uri");
                                System.out.println("url : " + url);

                                Intent view = new android.content.Intent();
                                view.setData(Uri.parse(url));
                                view.setPackage("com.google.android.youtube");
                                view.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(view);
                            } else {
                                result.error("UNAVAILABLE", "Cannot Start Activity.", null);
                            }

                        }
                );
    }
}

