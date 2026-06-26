import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../../core/config/environment.dart';
import '../models/product_model.dart';

abstract class ProductRemoteDataSource {
  Future<ProductModel> getProductById(String id);
  Future<List<ProductModel>> getEthicalAlternatives(
    String category,
    int currentScore,
    Map<String, bool> userPreferences,
  );
  Future<List<ProductModel>> getAllProducts();
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${Environment.apiBaseUrl}$path').replace(queryParameters: query);

  Exception _apiException(http.Response response, String fallbackMessage) {
    try {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return Exception(decoded['message']?.toString() ?? fallbackMessage);
    } catch (_) {
      return Exception(fallbackMessage);
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    final response = await http.get(_uri('/products/$id'));
    if (response.statusCode != 200) {
      throw _apiException(response, 'Error fetching product');
    }
    return ProductModel.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<List<ProductModel>> getEthicalAlternatives(
    String category,
    int currentScore,
    Map<String, bool> userPreferences,
  ) async {
    final response = await http.get(_uri('/products', {
      'category': category,
      'minEthicalScore': currentScore.toString(),
      'bio': (userPreferences['Bio'] == true).toString(),
      'local': (userPreferences['Local'] == true).toString(),
      'vegan': (userPreferences['Vegan'] == true).toString(),
      'equitable': (userPreferences['Equitable'] == true).toString(),
    }));
    if (response.statusCode != 200) {
      throw _apiException(response, 'Error fetching alternatives');
    }
    final docs = jsonDecode(response.body) as List<dynamic>;
    final alternatives = docs
        .map((doc) => ProductModel.fromJson(doc as Map<String, dynamic>))
        .toList();
    alternatives.sort((a, b) => b.ethicalScore.compareTo(a.ethicalScore));
    return alternatives;
  }

  @override
  Future<List<ProductModel>> getAllProducts() async {
    final response = await http.get(_uri('/products'));
    if (response.statusCode != 200) {
      throw _apiException(response, 'Error fetching all products');
    }
    final docs = jsonDecode(response.body) as List<dynamic>;
    return docs.map((doc) => ProductModel.fromJson(doc as Map<String, dynamic>)).toList();
  }
}
