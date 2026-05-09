import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String name;
  final String category;
  final double price;
  final String currency;
  final String originCountry;
  final bool fairTradeCertified;
  final int ethicalScore;
  final double carbonFootprintKg;
  final List<ProductComposition> composition;
  final ProducerInfo producer;
  final List<String> labels;
  final int stock;
  final double rating;

  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.currency,
    required this.originCountry,
    required this.fairTradeCertified,
    required this.ethicalScore,
    required this.carbonFootprintKg,
    required this.composition,
    required this.producer,
    required this.labels,
    required this.stock,
    required this.rating,
  });

  Product copyWith({
    String? id,
    String? name,
    String? category,
    double? price,
    String? currency,
    String? originCountry,
    bool? fairTradeCertified,
    int? ethicalScore,
    double? carbonFootprintKg,
    List<ProductComposition>? composition,
    ProducerInfo? producer,
    List<String>? labels,
    int? stock,
    double? rating,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      originCountry: originCountry ?? this.originCountry,
      fairTradeCertified: fairTradeCertified ?? this.fairTradeCertified,
      ethicalScore: ethicalScore ?? this.ethicalScore,
      carbonFootprintKg: carbonFootprintKg ?? this.carbonFootprintKg,
      composition: composition ?? this.composition,
      producer: producer ?? this.producer,
      labels: labels ?? this.labels,
      stock: stock ?? this.stock,
      rating: rating ?? this.rating,
    );
  }

  @override
  List<Object?> get props {
    return [
      id,
      name,
      category,
      price,
      currency,
      originCountry,
      fairTradeCertified,
      ethicalScore,
      carbonFootprintKg,
      composition,
      producer,
      labels,
      stock,
      rating,
    ];
  }
}

class ProductComposition extends Equatable {
  final String material;
  final int percentage;
  final String origin;
  final bool isRecycled;
  final bool isOrganic;

  const ProductComposition({
    required this.material,
    required this.percentage,
    required this.origin,
    required this.isRecycled,
    required this.isOrganic,
  });

  @override
  List<Object?> get props {
    return [material, percentage, origin, isRecycled, isOrganic];
  }
}

class ProducerInfo extends Equatable {
  final String name;
  final String type;
  final int workersCount;
  final int averageSalaryUsd;

  const ProducerInfo({
    required this.name,
    required this.type,
    required this.workersCount,
    required this.averageSalaryUsd,
  });

  @override
  List<Object?> get props {
    return [name, type, workersCount, averageSalaryUsd];
  }
}
