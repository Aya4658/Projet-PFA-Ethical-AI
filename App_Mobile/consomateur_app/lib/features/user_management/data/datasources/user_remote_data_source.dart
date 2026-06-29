import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../../core/config/environment.dart';
import '../../domain/entities/user.dart';
import '../models/user_model.dart';

abstract class UserRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> createAccount(String name, String email, String password, String country);
  Future<UserModel> socialSignIn(String provider, String token, {String? country});
  Future<UserModel?> getCurrentUser(String userId);
  Future<void> updatePreferences(String userId, UserPreferences preferences);
  Future<void> addToFavorites(String userId, String productId);
  Future<void> removeFromFavorites(String userId, String productId);
  Future<void> recordScan(String userId, String productId, bool wasAlternativeChosen);
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  Uri _uri(String path) => Uri.parse('${Environment.apiBaseUrl}$path');

  Exception _apiException(http.Response response, String fallbackMessage) {
    try {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return Exception(decoded['message']?.toString() ?? fallbackMessage);
    } catch (_) {
      return Exception(fallbackMessage);
    }
  }

  @override
  Future<UserModel> login(String email, String password) async {
    final response = await http.post(
      _uri('/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 200) {
      throw _apiException(response, 'Login failed');
    }

    return UserModel.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<UserModel> createAccount(String name, String email, String password, String country) async {
    final response = await http.post(
      _uri('/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'country': country,
      }),
    );

    if (response.statusCode != 201) {
      throw _apiException(response, 'Failed to create account');
    }

    return UserModel.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<UserModel> socialSignIn(String provider, String token, {String? country}) async {
    final response = await http.post(
      _uri('/auth/social'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'provider': provider,
        'token': token,
        if (country != null) 'country': country,
      }),
    );

    if (response.statusCode != 200) {
      throw _apiException(response, 'Social sign-in failed');
    }

    return UserModel.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<UserModel?> getCurrentUser(String userId) async {
    final response = await http.get(_uri('/users/$userId'));
    if (response.statusCode == 404) {
      return null;
    }
    if (response.statusCode != 200) {
      throw _apiException(response, 'Failed to load current user');
    }
    return UserModel.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<void> updatePreferences(String userId, UserPreferences preferences) async {
    final response = await http.patch(
      _uri('/users/$userId/preferences'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'is_vegan': preferences.isVegan,
        'is_organic_focused': preferences.isOrganicFocused,
        'is_fair_trade_focused': preferences.isFairTradeFocused,
        'is_local_focused': preferences.isLocalFocused,
        'max_carbon_footprint': preferences.maxCarbonFootprint,
      }),
    );
    if (response.statusCode != 204) {
      throw _apiException(response, 'Failed to update preferences');
    }
  }

  @override
  Future<void> addToFavorites(String userId, String productId) async {
    final parsed = _parseSourceTaggedProductId(productId);
    final response = await http.post(
      _uri('/users/$userId/favorites'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'productId': parsed['id'],
        if (parsed['sourceTag'] != null) 'sourceTag': parsed['sourceTag'],
      }),
    );
    if (response.statusCode != 204) {
      throw _apiException(response, 'Failed to add favorite');
    }
  }

  @override
  Future<void> removeFromFavorites(String userId, String productId) async {
    // Send the full source-tagged productId in the URL path
    final response = await http.delete(_uri('/users/$userId/favorites/$productId'));
    if (response.statusCode != 204) {
      throw _apiException(response, 'Failed to remove favorite');
    }
  }

  @override
  Future<void> recordScan(String userId, String productId, bool wasAlternativeChosen) async {
    final parsed = _parseSourceTaggedProductId(productId);
    final response = await http.post(
      _uri('/users/$userId/scans'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'productId': parsed['id'],
        if (parsed['sourceTag'] != null) 'sourceTag': parsed['sourceTag'],
        'wasAlternativeChosen': wasAlternativeChosen,
      }),
    );
    if (response.statusCode != 204) {
      throw _apiException(response, 'Failed to record scan');
    }
  }

  /// Parse source-tagged product ID (e.g., "openFoodFacts:12345" -> {id: "12345", sourceTag: "openFoodFacts"})
  static Map<String, String?> _parseSourceTaggedProductId(String raw) {
    final separatorIndex = raw.indexOf(':');
    if (separatorIndex <= 0) {
      return {'id': raw, 'sourceTag': null};
    }

    final prefix = raw.substring(0, separatorIndex).toLowerCase();
    final id = raw.substring(separatorIndex + 1);

    if (prefix == 'openfoodfacts' || prefix == 'openfoodfact' || prefix == 'mongodb' || prefix == 'ethico') {
      return {'id': id, 'sourceTag': prefix};
    }

    // Not a recognized source tag, treat entire string as ID
    return {'id': raw, 'sourceTag': null};
  }
}