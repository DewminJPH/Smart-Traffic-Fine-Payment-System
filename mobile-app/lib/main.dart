import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const TrafficFineApp());
}

class TrafficFineApp extends StatelessWidget {
  const TrafficFineApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SL Police e-Fine',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF1C2541),
        scaffoldBackgroundColor: const Color(0xFF060A13),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF5BC0BE),
          secondary: Color(0xFFFFD700),
          surface: Color(0xFF0F172A),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
