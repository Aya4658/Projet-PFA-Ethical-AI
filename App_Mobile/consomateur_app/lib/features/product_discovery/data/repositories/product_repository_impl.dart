import 'package:consomateur_app/features/product_discovery/data/datasources/open_food_facts_remote_data_source.dart';
import 'package:consomateur_app/features/product_discovery/data/datasources/product_remote_data_source.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  final OpenFoodFactsRemoteDataSource openFoodFactsRemoteDataSource;

  ProductRepositoryImpl(
    this.remoteDataSource,
    this.openFoodFactsRemoteDataSource,
  );

  @override
  Future<Product> getProductById(String id) async {
    try {
      // Try backend first with the full (potentially source-tagged) ID
      return await remoteDataSource.getProductById(id);
    } catch (_) {
      // Fallback: if it's a source-tagged ID for openFoodFacts, extract barcode
      final parsedId = _parseSourceTaggedId(id);
      if (parsedId['source'] == 'openFoodFacts') {
        return await openFoodFactsRemoteDataSource.getProductByBarcode(parsedId['id']!);
      }
      // Otherwise try as barcode
      return await openFoodFactsRemoteDataSource.getProductByBarcode(id);
    }
  }

  @override
  Future<List<Product>> getEthicalAlternatives(String category, int currentScore, Map<String, bool> userPreferences) async {
    final productModels = await remoteDataSource.getEthicalAlternatives(category, currentScore, userPreferences);
    return productModels;
  }

  @override
  Future<List<Product>> getAllProducts() async {
    final productModels = await remoteDataSource.getAllProducts();
    return productModels;
  }

  @override
  Future<List<Product>> searchProducts(String query) async {
    final allProducts = await remoteDataSource.getAllProducts();
    final filteredProducts = allProducts.where((product) {
      final normalizedQuery = query.toLowerCase();
      return product.name.toLowerCase().contains(normalizedQuery) ||
          product.producer.name.toLowerCase().contains(normalizedQuery) ||
          product.category.toLowerCase().contains(normalizedQuery);
    }).toList();

    if (filteredProducts.isNotEmpty) {
      return filteredProducts;
    }

    try {
      return await openFoodFactsRemoteDataSource.searchProducts(query);
    } catch (_) {
      return [];
    }
  }

  /// Parse source-tagged product ID (e.g., "openFoodFacts:12345" -> {source: "openFoodFacts", id: "12345"})
  static Map<String, String?> _parseSourceTaggedId(String raw) {
    final separatorIndex = raw.indexOf(':');
    if (separatorIndex <= 0) {
      return {'source': null, 'id': raw};
    }

    final prefix = raw.substring(0, separatorIndex).toLowerCase();
    final id = raw.substring(separatorIndex + 1);

    if (prefix == 'openfoodfacts' || prefix == 'openfoodfact') {
      return {'source': 'openFoodFacts', 'id': id};
    }
    if (prefix == 'mongodb' || prefix == 'ethico') {
      return {'source': 'mongodb', 'id': id};
    }

    // Not a recognized source tag, treat entire string as ID
    return {'source': null, 'id': raw};
  }
}