import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/user_remote_data_source.dart';

class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final SharedPreferences sharedPreferences;

  static const String _currentUserIdKey = 'current_user_id';

  UserRepositoryImpl({
    required this.remoteDataSource,
    required this.sharedPreferences,
  });

  @override
  Future<User> login(String email, String password) async {
    final userModel = await remoteDataSource.login(email, password);
    await sharedPreferences.setString(_currentUserIdKey, userModel.id);
    return userModel;
  }

  @override
  Future<User> createAccount(String name, String email, String password, String country) async {
    final userModel = await remoteDataSource.createAccount(name, email, password, country);
    await sharedPreferences.setString(_currentUserIdKey, userModel.id);
    return userModel;
  }

  @override
  Future<User> socialSignIn(String provider, String token, {String? country}) async {
    final userModel = await remoteDataSource.socialSignIn(provider, token, country: country);
    await sharedPreferences.setString(_currentUserIdKey, userModel.id);
    return userModel;
  }

  @override
  Future<User?> getCurrentUser() async {
    final userId = sharedPreferences.getString(_currentUserIdKey);
    if (userId != null) {
      return await remoteDataSource.getCurrentUser(userId);
    }
    return null;
  }

  @override
  Future<void> updatePreferences(String userId, UserPreferences preferences) async {
    await remoteDataSource.updatePreferences(userId, preferences);
  }

  @override
  Future<void> addToFavorites(String userId, String productId) async {
    await remoteDataSource.addToFavorites(userId, productId);
  }

  @override
  Future<void> removeFromFavorites(String userId, String productId) async {
    await remoteDataSource.removeFromFavorites(userId, productId);
  }

  @override
  Future<void> recordScan(String userId, String productId, bool wasAlternativeChosen) async {
    await remoteDataSource.recordScan(userId, productId, wasAlternativeChosen);
  }

  @override
  Future<void> logout() async {
    await sharedPreferences.remove(_currentUserIdKey);
  }
}