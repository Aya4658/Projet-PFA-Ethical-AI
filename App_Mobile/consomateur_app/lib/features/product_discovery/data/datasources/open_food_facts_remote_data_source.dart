import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/open_food_facts_product_model.dart';

abstract class OpenFoodFactsRemoteDataSource {
  Future<OpenFoodFactsProductModel> getProductByBarcode(String barcode);
  Future<List<OpenFoodFactsProductModel>> searchProducts(String query);
}

class OpenFoodFactsRemoteDataSourceImpl implements OpenFoodFactsRemoteDataSource {
  static const _baseUrl = 'https://world.openfoodfacts.org';

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
    final response = await http.get(_uri('/api/v0/product/$barcode.json'));
    if (response.statusCode != 200) {
      throw _apiException(response, 'Open Food Facts request failed');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    if (decoded['status'] != 1) {
      throw Exception('Product not found on Open Food Facts');
    }

    return OpenFoodFactsProductModel.fromJson(decoded['product'] as Map<String, dynamic>);
  }

  @override
  Future<List<OpenFoodFactsProductModel>> searchProducts(String query) async {
    final response = await http.get(_uri('/cgi/search.pl', {
      'search_terms': query,
      'search_simple': '1',
      'action': 'process',
      'json': '1',
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
