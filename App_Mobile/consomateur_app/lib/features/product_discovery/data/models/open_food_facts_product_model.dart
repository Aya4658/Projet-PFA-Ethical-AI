import '../../domain/entities/product.dart';

// Helper class to store Open Food Facts specific nutrition data
class OpenFoodFactsNutritionData {
  final Map<String, dynamic>? nutriments;
  final Map<String, dynamic>? nutrientLevels;
  final String? nutritionGrade;
  final int? nutriscoreScore;
  final String? ecoscore;
  final int? novaGroup;
  final String? allergens;
  final Map<String, dynamic>? rawJson;

  const OpenFoodFactsNutritionData({
    this.nutriments,
    this.nutrientLevels,
    this.nutritionGrade,
    this.nutriscoreScore,
    this.ecoscore,
    this.novaGroup,
    this.allergens,
    this.rawJson,
  });

  factory OpenFoodFactsNutritionData.fromJson(Map<String, dynamic> json) {
    return OpenFoodFactsNutritionData(
      nutriments: json['nutriments'] as Map<String, dynamic>?,
      nutrientLevels: json['nutrient_levels'] as Map<String, dynamic>?,
      nutritionGrade: json['nutrition_grades'] as String?,
      nutriscoreScore: json['nutriscore_score'] as int?,
      ecoscore: json['ecoscore_grade'] as String?,
      novaGroup: json['nova_group'] as int?,
      allergens: json['allergens'] as String?,
      rawJson: json,
    );
  }
}

class OpenFoodFactsProductModel extends Product {
  final OpenFoodFactsNutritionData? nutritionData;

  const OpenFoodFactsProductModel({
    required super.id,
    required super.name,
    required super.category,
    required super.price,
    required super.currency,
    required super.originCountry,
    required super.fairTradeCertified,
    required super.ethicalScore,
    required super.carbonFootprintKg,
    required super.composition,
    required super.producer,
    required super.labels,
    required super.stock,
    required super.rating,
    super.blockchainRootHash,
    super.processes,
    super.source = ProductSource.openFoodFacts,
    this.nutritionData,
  });

  factory OpenFoodFactsProductModel.fromJson(Map<String, dynamic> json) {
    final productJson = json;
    final ingredientList = _parseIngredients(productJson['ingredients'] as List<dynamic>?);
    final labels = _parseLabels(productJson);
    final name = productJson['product_name'] as String? ??
        productJson['generic_name'] as String? ??
        productJson['product_name_fr'] as String? ??
        'Unknown product';

    final ethicalScore = _calculateEthicalScore(productJson);

    return OpenFoodFactsProductModel(
      id: productJson['code']?.toString() ?? 'unknown',
      name: name,
      category: _parseCategory(productJson),
      price: 0.0,
      currency: 'EUR',
      originCountry: productJson['countries'] as String? ?? '',
      fairTradeCertified: false,
      ethicalScore: ethicalScore,
      carbonFootprintKg: 0.0,
      composition: ingredientList,
      producer: ProducerInfo(
        name: productJson['brands'] as String? ?? 'Open Food Facts',
        type: 'OpenFoodFacts',
        workersCount: 0,
        averageSalaryUsd: 0,
      ),
      labels: labels,
      stock: 0,
      rating: 0.0,
      nutritionData: OpenFoodFactsNutritionData.fromJson(productJson),
    );
  }

  /// Calculates ethical score (0-100) based on Open Food Facts data:
  /// - Nutrition Grade (A=100, B=75, C=50, D=25, E=0)
  /// - EcoScore (A=100, B=80, C=60, D=40, E=20, F=0)
  /// - NOVA Group penalty (ultra-processed = -20)
  static int _calculateEthicalScore(Map<String, dynamic> json) {
    int score = 50;

    // Nutrition Grade weight: 50%
    final nutritionGrade = json['nutrition_grades']?.toString().toUpperCase() ?? 'C';
    final nutritionScore = {
          'A': 100,
          'B': 75,
          'C': 50,
          'D': 25,
          'E': 0,
        }[nutritionGrade] ??
        50;
    score = (score * 0.5 + nutritionScore * 0.5).toInt();

    // EcoScore weight: 30%
    final ecoscore = json['ecoscore_grade']?.toString().toUpperCase() ?? 'C';
    final ecoscoreValue = {
          'A': 100,
          'B': 80,
          'C': 60,
          'D': 40,
          'E': 20,
          'F': 0,
        }[ecoscore] ??
        60;
    score = (score * 0.7 + ecoscoreValue * 0.3).toInt();

    // NOVA Group penalty: 20% (ultra-processed)
    final novaGroup = json['nova_group'] as int? ?? 2;
    final novaPenalty = (novaGroup - 1) * 5;
    score = (score - novaPenalty).clamp(0, 100);

    return score;
  }

  static String _parseCategory(Map<String, dynamic> json) {
    if (json['categories'] is String && (json['categories'] as String).isNotEmpty) {
      return (json['categories'] as String).split(',').first.trim();
    }
    if (json['categories_tags'] is List<dynamic> && (json['categories_tags'] as List).isNotEmpty) {
      return (json['categories_tags'] as List<dynamic>).first.toString();
    }
    return 'Alimentation';
  }

  static List<ProductComposition> _parseIngredients(List<dynamic>? ingredientsJson) {
    if (ingredientsJson == null) return [];
    return ingredientsJson.map((rawIngredient) {
      if (rawIngredient is Map<String, dynamic>) {
        final text = rawIngredient['text']?.toString() ?? rawIngredient['ingredient']?.toString() ?? 'Ingrédient inconnu';
        final percent = _parsePercentage(rawIngredient['percent']);
        return ProductComposition(
          ingredient: text,
          percentage: percent,
          origin: rawIngredient['origin'] as String? ?? '',
          isRecycled: false,
          isOrganic: _inferOrganic(rawIngredient, rawIngredient['text']?.toString() ?? ''),
        );
      }
      return ProductComposition(
        ingredient: rawIngredient.toString(),
        percentage: 0,
        origin: '',
        isRecycled: false,
        isOrganic: false,
      );
    }).toList();
  }

  static int _parsePercentage(dynamic rawValue) {
    if (rawValue == null) return 0;
    final stringValue = rawValue.toString();
    final match = RegExp(r'(\d+)').firstMatch(stringValue);
    if (match != null) {
      return int.tryParse(match.group(1) ?? '') ?? 0;
    }
    return 0;
  }

  static bool _inferOrganic(Map<String, dynamic> rawIngredient, String text) {
    final labels = (rawIngredient['labels_tags'] as List<dynamic>?)?.map((e) => e.toString().toLowerCase()).toList() ?? [];
    final combined = '${text.toLowerCase()} ${labels.join(' ')}';
    return combined.contains('organic') || combined.contains('bio');
  }

  static List<String> _parseLabels(Map<String, dynamic> productJson) {
    final labels = <String>[];

    if (productJson['labels_tags'] is List<dynamic>) {
      labels.addAll((productJson['labels_tags'] as List<dynamic>)
          .map((label) => label.toString().replaceFirst('en:', '').replaceFirst('fr:', '')));
    }

    if (labels.isEmpty && productJson['labels'] is String) {
      labels.addAll((productJson['labels'] as String)
          .split(',')
          .map((label) => label.trim())
          .where((label) => label.isNotEmpty));
    }

    return labels;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'currency': currency,
      'origin_country': originCountry,
      'fair_trade_certified': fairTradeCertified,
      'ethical_score': ethicalScore,
      'carbon_footprint_kg': carbonFootprintKg,
      'composition': composition
          .map((item) => {
                'ingredient': item.ingredient,
                'percentage': item.percentage,
                'origin': item.origin,
                'is_recycled': item.isRecycled,
                'is_organic': item.isOrganic,
              })
          .toList(),
      'producer': {
        'name': producer.name,
        'type': producer.type,
        'workers_count': producer.workersCount,
        'average_salary_usd': producer.averageSalaryUsd,
      },
      'labels': labels,
      'stock': stock,
      'rating': rating,
      'source': source.label,
    };
  }
}
