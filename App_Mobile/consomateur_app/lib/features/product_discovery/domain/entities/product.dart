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
  final String? blockchainRootHash;
  final List<ProductProcess> processes;
  final ProductSource source;

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
    this.blockchainRootHash,
    this.processes = const [],
    this.source = ProductSource.mongodb,
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
    String? blockchainRootHash,
    List<ProductProcess>? processes,
    ProductSource? source,
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
      blockchainRootHash: blockchainRootHash ?? this.blockchainRootHash,
      processes: processes ?? this.processes,
      source: source ?? this.source,
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
      blockchainRootHash,
      processes,
      source,
    ];
  }
}

enum ProductSource {
  mongodb,
  openFoodFacts,
}

extension ProductSourceLabel on ProductSource {
  String get label {
    switch (this) {
      case ProductSource.mongodb:
        return 'Ethico';
      case ProductSource.openFoodFacts:
        return 'Open Food Facts';
    }
  }

  String get description {
    switch (this) {
      case ProductSource.mongodb:
        return 'From our curated ethical database';
      case ProductSource.openFoodFacts:
        return 'From Open Food Facts database';
    }
  }
}

class ProductComposition extends Equatable {
  final String ingredient;
  final int percentage;
  final String origin;
  final bool isRecycled;
  final bool isOrganic;

  const ProductComposition({
    required this.ingredient,
    required this.percentage,
    required this.origin,
    required this.isRecycled,
    required this.isOrganic,
  });

  @override
  List<Object?> get props {
    return [ingredient, percentage, origin, isRecycled, isOrganic];
  }
}

class ProductProcess extends Equatable {
  final int stepNumber;
  final String process;
  final String previousHash;

  const ProductProcess({
    required this.stepNumber,
    required this.process,
    required this.previousHash,
  });

  @override
  List<Object?> get props => [stepNumber, process, previousHash];
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
