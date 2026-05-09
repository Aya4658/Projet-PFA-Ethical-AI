import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/data/datasources/product_remote_data_source.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;

  ProductRepositoryImpl(this.remoteDataSource);

  @override
  Future<Product> getProductById(String id) async {
    final productModel = await remoteDataSource.getProductById(id);
    return productModel;
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
}