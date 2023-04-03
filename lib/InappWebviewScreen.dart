
import 'dart:collection';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:geolocator/geolocator.dart';
import 'package:overlay_progress_indicator/overlay_progress_indicator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import 'component/back_pressed.dart';
import 'error/page/error.dart';

class InappWebviewScreen extends StatefulWidget {
  late final String init_url;
  late final int a;

  InappWebviewScreen({required this.init_url, this.a = 1}) : super();

  @override
  State<InappWebviewScreen> createState() => _InappWebviewScreen(init_url : this.init_url);
}

class _InappWebviewScreen extends State<InappWebviewScreen> {

  final GlobalKey webViewKey = GlobalKey();
  late final String init_url;
  Uri? currentURL;
  double progress = 0;
  InAppWebViewController? webViewController;
  static const platform_for_kakao_channel = MethodChannel('pitch_peach.flutter.dev/kakao');
  static const platform_for_youtube_channel = MethodChannel('pitch_peach.flutter.dev/youtube');

  _InappWebviewScreen({this.init_url = "https://www.naver.com",});
  late PullToRefreshController pullToRefreshController;



  // internet connection

  int _errorCode = 0; // 0 - Everything is ok, 1 - http or other error fixed
  final BackPressed _backPressed = BackPressed();
  bool _isLoading = false, _isVisible = false, _isOffline = false;
  Future<void> checkError() async {
    //Hide CircularProgressIndicator
    _isLoading = false;

    //Check Network Status
    ConnectivityResult result = await Connectivity().checkConnectivity();

    //if Online: hide offline page and show web page
    if (result != ConnectivityResult.none) {
      if (_isOffline == true) {
        _isVisible = false; //Hide Offline Page
        _isOffline = false; //set Page type to error
      }
    }

    //If Offline: hide web page show offline page
    else {
      _errorCode = 0;
      _isOffline = true; //Set Page type to offline
      _isVisible = true; //Show offline page
    }

    // If error is fixed: hide error page and show web page
    if (_errorCode == 1) _isVisible = false;
    setState(() {});
  }

  // ******************************************** internet connection ********************************************




  @override
  void initState() {
    super.initState();

    pullToRefreshController = PullToRefreshController(
      options: PullToRefreshOptions(color: Colors.blue),
      onRefresh: () async {
        if (defaultTargetPlatform == TargetPlatform.android) {
          webViewController?.reload();
        }
        else if (defaultTargetPlatform == TargetPlatform.iOS) {
          webViewController?.loadUrl(urlRequest: URLRequest(url: await webViewController?.getUrl()));
        }
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(child: Scaffold(
      body: SafeArea(
        child: Stack(
          alignment: Alignment.center,
          children: [
            InAppWebView(
              key: webViewKey,
              initialUrlRequest: URLRequest(url: Uri.parse(init_url)),
              initialOptions: InAppWebViewGroupOptions(
                crossPlatform: InAppWebViewOptions(
                    javaScriptCanOpenWindowsAutomatically: true,
                    javaScriptEnabled: true,
                    useOnDownloadStart: true,
                    useOnLoadResource: true,
                    useShouldOverrideUrlLoading: true,
                    // mediaPlaybackRequiresUserGesture: true,
                    mediaPlaybackRequiresUserGesture: false,
                    allowFileAccessFromFileURLs: true,
                    allowUniversalAccessFromFileURLs: true,
                    verticalScrollBarEnabled: true,
                ),
                android: AndroidInAppWebViewOptions(
                    useShouldInterceptRequest: true,
                    useHybridComposition: true,
                    allowContentAccess: true,
                    builtInZoomControls: true,
                    thirdPartyCookiesEnabled: true,
                    allowFileAccess: true,
                    supportMultipleWindows: true
                ),
                ios: IOSInAppWebViewOptions(
                  allowsInlineMediaPlayback: true,
                  allowsBackForwardNavigationGestures: true,
                ),
              ),
              pullToRefreshController: pullToRefreshController,
              onWebViewCreated: (controller) {
                this.webViewController = controller;
                // controller.clearCache();
              },
              androidShouldInterceptRequest: (controller, request) async {
              },
              shouldOverrideUrlLoading: (controller, navigationAction) async {

                var uri = navigationAction.request.url!;


                if (![ "http", "https", "file", "chrome",
                  "data", "javascript", "about"].contains(uri.scheme)) {
                  if ("intent" == uri.scheme && defaultTargetPlatform == TargetPlatform.android) {

                    OverlayProgressIndicator.show(
                      context: context,
                      backgroundColor: Colors.black45,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20.0),
                        ),
                        padding: const EdgeInsets.all(30.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            CircularProgressIndicator(),
                            SizedBox(
                              height: 10,
                            ),
                            Text(
                              'Loading',
                            ),
                          ],
                        ),
                      ),
                    );

                    await Future.delayed(const Duration(seconds: 2), () {
                      OverlayProgressIndicator.hide();
                    });

                    bool isKakaoAppLogin = uri.toString().startsWith("intent:#Intent;action=com.kakao.talk.intent");

                    if (uri.toString().startsWith("intent:#Intent;action=com.kakao.talk.intent")) {
                      var result = await platform_for_kakao_channel.invokeMethod('loginWithApp', { 'url' : uri.toString()});
                      if (result != null) {
                        await controller?.loadUrl(
                            urlRequest: URLRequest(url: Uri.parse(result)));
                      }
                    }


                    await Future.delayed(const Duration(seconds: 2), () {
                      OverlayProgressIndicator.hide();
                    });
                    return NavigationActionPolicy.CANCEL;
                  }
                  else if (await canLaunchUrl(uri)) {
                    // Launch the App
                    await launchUrl(uri);
                    // and cancel the request
                    return NavigationActionPolicy.CANCEL;
                  }
                }

                // return NavigationActionPolicy.CANCEL;
                return NavigationActionPolicy.ALLOW;
              },
            initialUserScripts: UnmodifiableListView<UserScript>([
              UserScript(
                  source: """
                                window.isFluttApp = true
                                window.setAccess_tokenOnFlutterApp = (...args) => window.flutter_inappwebview.callHandler('setAccess_token', ...args);
                                """, injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START),
              UserScript(
                  source: """
                          window.isFluttApp = true
                          """,
                  injectionTime: UserScriptInjectionTime.AT_DOCUMENT_END),
            ]),
              onLoadStart: (controller, url) async {
                setState(() { currentURL = url; });
              },
              onLoadStop: (controller, url) async {
                setState(() { currentURL = url; });
                checkError(); //Check Error type: offline or other error
              },
              onProgressChanged: (controller, progress) async {




                if (progress == 100) {pullToRefreshController.endRefreshing();}
                setState(() {this.progress = progress / 100;});
              },
              onUpdateVisitedHistory: (controller, uri, androidIsReload) async { // 뒤로가기 활성화.
                if ((uri.toString().startsWith("https://m.youtube.com/watch")
                    || uri.toString().startsWith("https://www.youtube.com/watch"))
                    && defaultTargetPlatform == TargetPlatform.android)
                {


                  OverlayProgressIndicator.show(
                    context: context,
                    backgroundColor: Colors.black45,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20.0),
                      ),
                      padding: const EdgeInsets.all(30.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          CircularProgressIndicator(),
                          SizedBox(
                            height: 10,
                          ),
                          Text(
                            'Loading',
                          ),
                        ],
                      ),
                    ),
                  );

                  await Future.delayed(const Duration(seconds: 2), () {
                    OverlayProgressIndicator.hide();
                  });


                  await platform_for_youtube_channel.invokeMethod('playOnYoutube', { 'uri' : uri.toString()}).then((value) => {
                    print('parsing url : $value')
                  });
                }



                setState(() { this.currentURL = uri; });
              },

              onConsoleMessage: (controller, consoleMessage) {
                // print("onConsoleMessage : ${consoleMessage}");
              },


              onCreateWindow: (controller, createWindowRequest) async{

              //   showDialog(
              //     context: context, builder: (context) {
              //     return AlertDialog(
              //       content: SizedBox(
              //         width: MediaQuery.of(context).size.width,
              //         height: 400,
              //         child: InAppWebView(
              //           // Setting the windowId property is important here!
              //           windowId: createWindowRequest.windowId,
              //           initialOptions: InAppWebViewGroupOptions(
              //             android: AndroidInAppWebViewOptions(
              //               builtInZoomControls: true,
              //               thirdPartyCookiesEnabled: true,
              //             ),
              //             crossPlatform: InAppWebViewOptions(
              //                 cacheEnabled: true,
              //                 javaScriptEnabled: true,
              //             ),
              //             ios: IOSInAppWebViewOptions(
              //               allowsInlineMediaPlayback: true,
              //               allowsBackForwardNavigationGestures: true,
              //             ),
              //           ),
              //           onCloseWindow: (controller) async{
              //             if (Navigator.canPop(context)) {
              //               Navigator.pop(context);
              //             }
              //           },
              //         ),
              //       ),);
              //   },
              //   );
              //   return true;
              },

              onLoadError: (controller, url, code, message) {
                print("onLoadError url : ${url}");
                _errorCode = code;
                _isVisible = true;
              },
              onLoadHttpError: (controller, url, statusCode, description) {
                print("onLoadHttpError url : ${url}");
                _errorCode = statusCode;
                _isVisible = true;
              },

            androidOnGeolocationPermissionsShowPrompt: (InAppWebViewController controller, String origin) async {

              bool serviceEnabled;
              LocationPermission permission;


              // Test if location services are enabled.
              serviceEnabled = await Geolocator.isLocationServiceEnabled();
              if (!serviceEnabled) {
                // Location services are not enabled don't continue
                // accessing the position and request users of the
                // App to enable the location services.
                // return Future.error('Location services are disabled.');

                // showAlertDialog_for_geoPermission(context);

                return Future.value(GeolocationPermissionShowPromptResponse(
                    origin: origin, allow : false, retain : false));
              }

              permission = await Geolocator.checkPermission();
              if (permission == LocationPermission.denied) {
                permission = await Geolocator.requestPermission();
                if (permission == LocationPermission.denied) {
                  // Permissions are denied, next time you could try
                  // requesting permissions again (this is also where
                  // Android's shouldShowRequestPermissionRationale
                  // returned true. According to Android guidelines
                  // your App should show an explanatory UI now.
                  // return Future.error('Location permissions are denied');


                  // showAlertDialog_for_geoPermission(context);

                  // set up the AlertDialog
                  AlertDialog alert = AlertDialog(
                    title: Text("경고"),
                    content: const Text("GPS 권한을 허용하지 않으면, 지도 기능을 제대로 볼 수 없습니다.\n\n권한을 허용해주세요."),
                    actions: [
                      // continueButton,
                    ],
                  );

                  // show the dialog
                  await showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return alert;
                    },
                  );


                  return Future.value(GeolocationPermissionShowPromptResponse(
                      origin: origin, allow : false, retain : false));
                }
              }

              if (permission == LocationPermission.deniedForever) {
                permission = await Geolocator.requestPermission();
                if (permission == LocationPermission.deniedForever) {
                  // Permissions are denied forever, handle appropriately.
                  // return Future.error(
                  //     'Location permissions are permanently denied, we cannot request permissions.');

                  // showAlertDialog_for_geoPermission(context);

                  return Future.value(GeolocationPermissionShowPromptResponse(
                      origin: origin, allow : false, retain : false));
                }
              }

              return Future.value(GeolocationPermissionShowPromptResponse(
                  origin: origin, allow : true, retain : true));

            },

            androidOnPermissionRequest: (controller, origin, resources) async {

                return PermissionRequestResponse(
                    resources: resources,
                    action: PermissionRequestResponseAction.GRANT);
              },
            ),


            //Error Page
            Visibility(
              visible: _isVisible,
              child: ErrorScreen(
                  isOffline: _isOffline,
                  onPressed: () {
                    webViewController!.reload();
                    if (_errorCode != 0) {
                      _errorCode = 1;
                    }
                  }),
            ),
          ],
        ),
      ),
    ), onWillPop: () async {
      //If website can go back page
      var uri = await webViewController?.getUrl();
      bool isYoutubeUrl = uri.toString().startsWith("https://m.youtube.com/") || uri.toString().startsWith("https://www.youtube.com/");

      print("${await webViewController!.canGoBack()} && $isYoutubeUrl $uri $currentURL");

      if ((await webViewController!.canGoBack()) && isYoutubeUrl) {
        await webViewController!.goBack();
        return false;
      } else {
        //Double pressed to exit app
        return _backPressed.exit(context);
      }



      //Double pressed to exit app
      return _backPressed.exit(context);
    });
  }

}