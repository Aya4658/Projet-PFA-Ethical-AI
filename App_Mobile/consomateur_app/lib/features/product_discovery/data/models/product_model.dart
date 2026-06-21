import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
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
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final labels = (json['labels'] as List<dynamic>?)
            ?.map((label) => label.toString())
            .toList() ??
        [];

    return ProductModel(
      id: _parseId(json),
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency']?.toString() ?? 'EUR',
      originCountry: json['origin_country']?.toString() ?? '',
      fairTradeCertified: json['fair_trade_certified'] as bool? ?? false,
      ethicalScore: (json['ethical_score'] as num?)?.toInt() ?? 0,
      carbonFootprintKg: (json['carbon_footprint_kg'] as num?)?.toDouble() ?? 0.0,
      composition: (json['composition'] as List<dynamic>?)
              ?.map((item) => ProductCompositionModel.fromJson(
                    item as Map<String, dynamic>))
              .toList() ??
          [],
      blockchainRootHash: json['blockchain_root_hash']?.toString(),
      processes: (json['processes'] as List<dynamic>?)
              ?.map((p) => ProductProcessModel.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      producer: ProducerInfoModel.fromJson(
          json['producer'] as Map<String, dynamic>? ?? <String, dynamic>{}),
      labels: labels,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
    );
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
          .map((item) => (item as ProductCompositionModel).toJson())
          .toList(),
      'blockchain_root_hash': blockchainRootHash,
      'processes': processes.map((p) => (p as ProductProcessModel).toJson()).toList(),
      'producer': (producer as ProducerInfoModel).toJson(),
      'labels': labels,
      'stock': stock,
      'rating': rating,
    };
  }

  static String _parseId(Map<String, dynamic> json) {
    final rawId = json['_id'] ?? json['id'];
    if (rawId is Map<String, dynamic>) {
      if (rawId.containsKey(r'$oid')) {
        return rawId[r'$oid'].toString();
      }
      return rawId.toString();
    }
    return rawId.toString();
  }
}

class ProductCompositionModel extends ProductComposition {
  const ProductCompositionModel({
    required super.ingredient,
    required super.percentage,
    required super.origin,
    required super.isRecycled,
    required super.isOrganic,
  });

  factory ProductCompositionModel.fromJson(Map<String, dynamic> json) {
    final ingredientVal = (json['ingredient'] ?? json['material'])?.toString() ?? '';
    return ProductCompositionModel(
      ingredient: ingredientVal,
      percentage: (json['percentage'] as num?)?.toInt() ?? 0,
      origin: json['origin']?.toString() ?? '',
      isRecycled: json['is_recycled'] as bool? ?? false,
      isOrganic: json['is_organic'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ingredient': ingredient,
      'percentage': percentage,
      'origin': origin,
      'is_recycled': isRecycled,
      'is_organic': isOrganic,
    };
  }
}

class ProductProcessModel extends ProductProcess {
  const ProductProcessModel({
    required super.stepNumber,
    required super.process,
    required super.previousHash,
  });

  factory ProductProcessModel.fromJson(Map<String, dynamic> json) {
    return ProductProcessModel(
      stepNumber: (json['step_number'] as num?)?.toInt() ?? 0,
      process: json['process']?.toString() ?? '',
      previousHash: json['previous_hash']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'step_number': stepNumber,
      'process': process,
      'previous_hash': previousHash,
    };
  }
}

class ProducerInfoModel extends ProducerInfo {
  const ProducerInfoModel({
    required super.name,
    required super.type,
    required super.workersCount,
    required super.averageSalaryUsd,
  });

  factory ProducerInfoModel.fromJson(Map<String, dynamic> json) {
    return ProducerInfoModel(
      name: json['name']?.toString() ?? 'Unknown',
      type: json['type']?.toString() ?? 'Unknown',
      workersCount: (json['workers_count'] as num?)?.toInt() ?? 0,
      averageSalaryUsd: (json['average_salary_usd'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'workers_count': workersCount,
      'average_salary_usd': averageSalaryUsd,
    };
  }
}
