import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/categories_screen.dart';
import 'screens/cantiques_screen.dart';
import 'screens/cantique_screen.dart';
import 'screens/favorites_screen.dart';

void main() => runApp(const CantiquesApp());

final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/', 
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/categories',
      builder: (context, state) => const CategoriesScreen(),
    ),
    GoRoute(
      path: '/favorites',
      builder: (context, state) => const FavoritesScreen(),
    ),
    GoRoute(
      path: '/cantiques/:categoryId',
      builder: (context, state) {
        final categoryId = state.pathParameters['categoryId']!;
        return CantiquesScreen(categoryId: categoryId);
      },
    ),
    GoRoute(
      path: '/cantique/:categoryId/:number',
      builder: (context, state) {
        final categoryId = state.pathParameters['categoryId']!;
        final number = state.pathParameters['number']!;
        return CantiqueScreen(categoryId: categoryId, number: number);
      },
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
