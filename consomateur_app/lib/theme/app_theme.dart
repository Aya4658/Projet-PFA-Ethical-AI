import 'package:flutter/material.dart';

class AppColor {
  // Primary colors from EthicCommerce branding
  static const Color primaryGreen = Color(0xFF1B8B6C);
  static const Color primaryOrange = Color(0xFFFFA500);
  static const Color darkGreen = Color(0xFF0F5A47);
  
  // Neutrals
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color mediumGray = Color(0xFFE0E0E0);
  static const Color darkGray = Color(0xFF666666);
  static const Color textDark = Color(0xFF1A1A1A);
  
  // Semantic
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFFA500);
}

class AppTheme {
  static ThemeData lightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: AppColor.primaryGreen,
        secondary: AppColor.primaryOrange,
        surface: AppColor.white,
        background: AppColor.lightGray,
        error: AppColor.error,
        onPrimary: AppColor.white,
        onSecondary: AppColor.white,
        onSurface: AppColor.textDark,
      ),
      scaffoldBackgroundColor: AppColor.lightGray,
      
      // AppBar theme
      appBarTheme: AppBarTheme(
        backgroundColor: AppColor.primaryGreen,
        foregroundColor: AppColor.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: AppColor.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      
      // Text themes
      textTheme: TextTheme(
        displayLarge: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColor.textDark,
        ),
        displayMedium: const TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColor.textDark,
        ),
        headlineSmall: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColor.textDark,
        ),
        titleLarge: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColor.textDark,
        ),
        titleMedium: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: AppColor.textDark,
        ),
        bodyLarge: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColor.textDark,
        ),
        bodyMedium: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColor.darkGray,
        ),
        bodySmall: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColor.darkGray,
        ),
      ),
      
      // Button themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColor.primaryGreen,
          foregroundColor: AppColor.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColor.primaryGreen,
          side: const BorderSide(color: AppColor.primaryGreen),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      
      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColor.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColor.mediumGray),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColor.mediumGray),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColor.primaryGreen, width: 2),
        ),
        hintStyle: const TextStyle(color: AppColor.darkGray),
        prefixIconColor: AppColor.darkGray,
        suffixIconColor: AppColor.darkGray,
      ),
      
      // Bottom navigation theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColor.white,
        selectedItemColor: AppColor.primaryGreen,
        unselectedItemColor: AppColor.darkGray,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
