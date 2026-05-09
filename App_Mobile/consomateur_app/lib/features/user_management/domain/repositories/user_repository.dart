import '../entities/user.dart';

abstract class UserRepository {
  /// Authenticates a user with email and password
  Future<User> login(String email, String password);

  /// Creates a new user account
  Future<User> createAccount(String name, String email, String password, String country);

  /// Gets the current logged in user
  Future<User?> getCurrentUser();

  /// Updates user preferences
  Future<void> updatePreferences(String userId, UserPreferences preferences);

  /// Adds a product to user's favorites
  Future<void> addToFavorites(String userId, String productId);

  /// Removes a product from user's favorites
  Future<void> removeFromFavorites(String userId, String productId);

  /// Records a scan in user's history
  Future<void> recordScan(String userId, String productId, bool wasAlternativeChosen);

  /// Logs out the current user
  Future<void> logout();
}