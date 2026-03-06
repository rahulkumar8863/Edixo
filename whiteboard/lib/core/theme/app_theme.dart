import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryOrange = Color(0xFFF4511E);
  static const Color primaryDark = Color(0xFF1A1A2E);
  static const Color accentBlue = Color(0xFF4A90D9);
  static const Color successGreen = Color(0xFF4CAF50);
  static const Color errorRed = Color(0xFFE53935);
  static const Color canvasWhite = Color(0xFFFDFDFD);
  static const Color canvasBlue = Color(0xFFF0F4F8);
  static const Color canvasYellow = Color(0xFFFEF9E7);
  static const Color canvasDark = Color(0xFF2D2D3A);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryOrange,
      scaffoldBackgroundColor: canvasWhite,
      colorScheme: const ColorScheme.light(
        primary: primaryOrange,
        secondary: accentBlue,
        surface: Colors.white,
        error: errorRed,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32.sp,
          fontWeight: FontWeight.bold,
          color: primaryDark,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 24.sp,
          fontWeight: FontWeight.w600,
          color: primaryDark,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 18.sp,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16.sp,
          fontWeight: FontWeight.normal,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14.sp,
          fontWeight: FontWeight.normal,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          minimumSize: Size(200.w, 56.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade100,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: primaryOrange, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: errorRed, width: 2),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryOrange,
      scaffoldBackgroundColor: canvasDark,
      colorScheme: const ColorScheme.dark(
        primary: primaryOrange,
        secondary: accentBlue,
        surface: Color(0xFF3D3D4E),
        error: errorRed,
      ),
    );
  }
}
