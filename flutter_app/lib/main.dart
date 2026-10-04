import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/categories_screen.dart';
import 'screens/cantiques_screen.dart';
import 'screens/cantique_screen.dart';

void main() => runApp(const CantiquesApp());

final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (c, s) => const HomeScreen()),
    GoRoute(
      path: '/categories',
      builder: (c, s) => const CategoriesScreen(),
    ),
    GoRoute(
      path: '/cantiques/:categoryId',
      builder: (c, s) => CantiquesScreen(
      ),
    ),
    GoRoute(
      path: '/cantique/:categoryId/:number',
      builder: (c, s) => CantiqueScreen(
      ),
    ),
  ],
);

class CantiquesApp extends StatelessWidget {
  const CantiquesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Cantiques EUJC',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      routerConfig: _router,
    );
  }
}
