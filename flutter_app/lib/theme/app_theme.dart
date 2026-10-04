import 'package:flutter/material.dart';

class AppColors {
  static const forest900 = Color(0xFF0B2B24);
  static const forest800 = Color(0xFF0F3A31);
  static const forest700 = Color(0xFF001A17);
  static const gold = Color(0xFFC9A961);
  static const goldLight = Color(0xFFE5D4A0);
  static const cream = Color(0xFFFAF6EC);
  static const textPrimary = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF5C5C5C);
  static const textInverse = Color(0xFFF5F0E6);
}

class AppTheme {
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.forest700,
        primary: AppColors.forest700,
        secondary: AppColors.gold,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: AppColors.cream,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.forest700,
        foregroundColor: AppColors.textInverse,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    );
  }

  static ThemeData dark() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.gold,
        primary: AppColors.gold,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: AppColors.forest900,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.forest900,
        foregroundColor: AppColors.textInverse,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.forest800,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    );
  }
}
