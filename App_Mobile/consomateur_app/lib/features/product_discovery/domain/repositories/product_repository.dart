import '../entities/product.dart';

abstract class ProductRepository {
  /// Returns a product matching the provided [id].
  Future<Product> getProductById(String id);

  /// Returns a list of more ethical alternatives within the same [category]
  /// that have a higher ethical score than [currentScore] and match [userPreferences].
  Future<List<Product>> getEthicalAlternatives(
    String category,
    int currentScore,
    Map<String, bool> userPreferences,
  );

  /// Returns all products from the database.
  Future<List<Product>> getAllProducts();

  /// Searches products first in MongoDB, then falls back to Open Food Facts.
  Future<List<Product>> searchProducts(String query);
}
