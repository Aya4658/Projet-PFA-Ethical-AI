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
      return await remoteDataSource.getProductById(id);
    } catch (_) {
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
}