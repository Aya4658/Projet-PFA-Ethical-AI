import 'dart:convert';
import 'package:consomateur_app/core/config/environment.dart';
import 'package:http/http.dart' as http;

import '../models/open_food_facts_product_model.dart';

abstract class OpenFoodFactsRemoteDataSource {
  Future<OpenFoodFactsProductModel> getProductByBarcode(String barcode);
  Future<List<OpenFoodFactsProductModel>> searchProducts(String query);
}

class OpenFoodFactsRemoteDataSourceImpl implements OpenFoodFactsRemoteDataSource {
  static String get _baseUrl => '${Environment.apiBaseUrl}/open-food-facts';

  Uri _uri(String path, [Map<String, String>? query]) {
    return Uri.parse('$_baseUrl$path').replace(queryParameters: query);
  }

  Exception _apiException(http.Response response, String fallbackMessage) {
    try {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      return Exception(decoded['message']?.toString() ?? fallbackMessage);
    } catch (_) {
      return Exception(fallbackMessage);
    }
  }

  @override
  Future<OpenFoodFactsProductModel> getProductByBarcode(String barcode) async {
    final response = await http.get(_uri('/products/$barcode'));
    if (response.statusCode != 200) {
      throw _apiException(response, 'Open Food Facts request failed');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    return OpenFoodFactsProductModel.fromJson(decoded);
  }

  @override
  Future<List<OpenFoodFactsProductModel>> searchProducts(String query) async {
    final response = await http.get(_uri('/search', {
      'q': query,
      'page_size': '20',
    }));

    if (response.statusCode != 200) {
      throw _apiException(response, 'Open Food Facts search failed');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final products = (decoded['products'] as List<dynamic>?) ?? [];
    return products
        .map((product) => OpenFoodFactsProductModel.fromJson(product as Map<String, dynamic>))
        .toList();
  }
}
