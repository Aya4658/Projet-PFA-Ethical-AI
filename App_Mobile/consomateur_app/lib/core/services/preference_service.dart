import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PreferenceService {
  static const String _preferencesKey = 'user_ethical_preferences';
  static const Map<String, bool> _defaultPreferences = {
    'Bio': true,
    'Vegan': false,
    'Local': true,
    'Equitable': true,
  };

  static Future<void> savePreferences(Map<String, bool> preferences) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(preferences);
    await prefs.setString(_preferencesKey, jsonString);
  }

  static Future<Map<String, bool>> getPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_preferencesKey);
    if (jsonString != null) {
      try {
        final Map<String, dynamic> decoded = jsonDecode(jsonString);
        return decoded.map((key, value) => MapEntry(key, value as bool));
      } catch (e) {
        // If parsing fails, return defaults
        return _defaultPreferences;
      }
    }
    return _defaultPreferences;
  }
}