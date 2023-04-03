import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

import 'InappWebviewScreen.dart';

// InappWebviewScreen webviewScreen = InappWebviewScreen(init_url: "https://www.naver.com");
// InappWebviewScreen webviewScreen = InappWebviewScreen(init_url: "https://it-magician.github.io/test/eee");
// InappWebviewScreen webviewScreen = InappWebviewScreen(init_url: "http://j8b304.p.ssafy.io/");


final InAppLocalhostServer localhostServer = new InAppLocalhostServer(documentRoot: "assets/react-project/build/");
late InappWebviewScreen webviewScreen;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();


  // start the localhost server
  await localhostServer.start();
  webviewScreen = InappWebviewScreen(init_url: "http://localhost:8080");

  // await Permission.storage.request();
  // PermissionStatus status = await Permission.microphone.request();
  // await Permission.camera.request();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});


  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Pitch, Peach',
        home: SafeArea(
          child: webviewScreen,
        )
    );
  }
}
