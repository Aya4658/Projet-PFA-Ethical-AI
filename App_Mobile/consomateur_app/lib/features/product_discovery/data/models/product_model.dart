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
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final labels = (json['labels'] as List<dynamic>?)
            ?.map((label) => label.toString())
            .toList() ??
        [];

    return ProductModel(
      id: _parseId(json),
      name: json['name'] as String,
      category: json['category'] as String,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String,
      originCountry: json['origin_country'] as String,
      fairTradeCertified: json['fair_trade_certified'] as bool,
      ethicalScore: (json['ethical_score'] as num).toInt(),
      carbonFootprintKg: (json['carbon_footprint_kg'] as num).toDouble(),
      composition: (json['composition'] as List<dynamic>?)
              ?.map((item) => ProductCompositionModel.fromJson(
                  item as Map<String, dynamic>))
              .toList() ??
          [],
      producer: ProducerInfoModel.fromJson(
          json['producer'] as Map<String, dynamic>),
      labels: labels,
      stock: (json['stock'] as num).toInt(),
      rating: (json['rating'] as num).toDouble(),
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
    required super.material,
    required super.percentage,
    required super.origin,
    required super.isRecycled,
    required super.isOrganic,
  });

  factory ProductCompositionModel.fromJson(Map<String, dynamic> json) {
    return ProductCompositionModel(
      material: json['material'] as String,
      percentage: (json['percentage'] as num).toInt(),
      origin: json['origin'] as String,
      isRecycled: json['is_recycled'] as bool,
      isOrganic: json['is_organic'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'material': material,
      'percentage': percentage,
      'origin': origin,
      'is_recycled': isRecycled,
      'is_organic': isOrganic,
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
