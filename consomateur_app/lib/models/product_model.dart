class Product {
  final String id;
  final String name;
  final String producer;
  final String imageUrl;
  final EthicalScore ethicalScore;
  final String description;
  final List<String> certifications;
  final List<Ingredient> ingredients;
  final TraceabilityInfo traceability;
  final List<UserReview> reviews;
  final double rating;
  final DateTime scannedAt;
  final bool isFavorite;

  Product({
    required this.id,
    required this.name,
    required this.producer,
    required this.imageUrl,
    required this.ethicalScore,
    required this.description,
    required this.certifications,
    required this.ingredients,
    required this.traceability,
    required this.reviews,
    required this.rating,
    required this.scannedAt,
    this.isFavorite = false,
  });
}

class EthicalScore {
  final double overall; // 0-100
  final double environmental;
  final double socialImpact;
  final double transparency;
  final String carbonFootprint; // in kg CO2
  final String? workingConditions;
  final List<String> flags; // potential issues

  EthicalScore({
    required this.overall,
    required this.environmental,
    required this.socialImpact,
    required this.transparency,
    required this.carbonFootprint,
    this.workingConditions,
    this.flags = const [],
  });

  String get colorCode {
    if (overall >= 75) return 'green';
    if (overall >= 50) return 'orange';
    return 'red';
  }

  String get grade {
    if (overall >= 90) return 'A+';
    if (overall >= 80) return 'A';
    if (overall >= 70) return 'B';
    if (overall >= 60) return 'C';
    if (overall >= 50) return 'D';
    return 'F';
  }
}

class Ingredient {
  final String name;
  final bool isEthical;
  final String source;

  Ingredient({
    required this.name,
    required this.isEthical,
    required this.source,
  });
}

class TraceabilityInfo {
  final List<TraceabilityStep> steps;
  final String? blockchainHash;
  final DateTime? recordedDate;

  TraceabilityInfo({
    required this.steps,
    this.blockchainHash,
    this.recordedDate,
  });
}

class TraceabilityStep {
  final String location;
  final String description;
  final DateTime date;
  final String? personInCharge;

  TraceabilityStep({
    required this.location,
    required this.description,
    required this.date,
    this.personInCharge,
  });
}

class UserReview {
  final String userId;
  final String userName;
  final double rating;
  final String comment;
  final DateTime date;
  final int helpfulCount;

  UserReview({
    required this.userId,
    required this.userName,
    required this.rating,
    required this.comment,
    required this.date,
    this.helpfulCount = 0,
  });
}

class UserPreferences {
  final bool preferOrganic;
  final bool preferLocal;
  final bool preferVegan;
  final bool preferFairTrade;
  final int minEthicalScore;
  final List<String> interestedCategories;

  UserPreferences({
    this.preferOrganic = false,
    this.preferLocal = false,
    this.preferVegan = false,
    this.preferFairTrade = false,
    this.minEthicalScore = 50,
    this.interestedCategories = const [],
  });
}

class ScanHistory {
  final String productId;
  final String productName;
  final DateTime scannedAt;
  final double ethicalScore;

  ScanHistory({
    required this.productId,
    required this.productName,
    required this.scannedAt,
    required this.ethicalScore,
  });
}
