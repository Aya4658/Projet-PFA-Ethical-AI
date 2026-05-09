import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final String country;
  final UserPreferences preferences;
  final UserStats stats;
  final List<String> favorites;
  final List<ScanHistoryItem> scanHistory;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.country,
    required this.preferences,
    required this.stats,
    required this.favorites,
    required this.scanHistory,
  });

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? country,
    UserPreferences? preferences,
    UserStats? stats,
    List<String>? favorites,
    List<ScanHistoryItem>? scanHistory,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      country: country ?? this.country,
      preferences: preferences ?? this.preferences,
      stats: stats ?? this.stats,
      favorites: favorites ?? this.favorites,
      scanHistory: scanHistory ?? this.scanHistory,
    );
  }

  @override
  List<Object?> get props => [id, name, email, country, preferences, stats, favorites, scanHistory];
}

class UserPreferences extends Equatable {
  final bool isVegan;
  final bool isOrganicFocused;
  final bool isFairTradeFocused;
  final bool isLocalFocused;
  final double maxCarbonFootprint;

  const UserPreferences({
    required this.isVegan,
    required this.isOrganicFocused,
    required this.isFairTradeFocused,
    required this.isLocalFocused,
    required this.maxCarbonFootprint,
  });

  @override
  List<Object?> get props => [isVegan, isOrganicFocused, isFairTradeFocused, isLocalFocused, maxCarbonFootprint];
}

class UserStats extends Equatable {
  final int totalScans;
  final int totalPurchases;
  final int ethicalAwarenessScore;
  final double totalCo2SavedKg;

  const UserStats({
    required this.totalScans,
    required this.totalPurchases,
    required this.ethicalAwarenessScore,
    required this.totalCo2SavedKg,
  });

  UserStats copyWith({
    int? totalScans,
    int? totalPurchases,
    int? ethicalAwarenessScore,
    double? totalCo2SavedKg,
  }) {
    return UserStats(
      totalScans: totalScans ?? this.totalScans,
      totalPurchases: totalPurchases ?? this.totalPurchases,
      ethicalAwarenessScore: ethicalAwarenessScore ?? this.ethicalAwarenessScore,
      totalCo2SavedKg: totalCo2SavedKg ?? this.totalCo2SavedKg,
    );
  }

  @override
  List<Object?> get props => [totalScans, totalPurchases, ethicalAwarenessScore, totalCo2SavedKg];
}

class ScanHistoryItem extends Equatable {
  final String productId;
  final DateTime scannedAt;
  final bool wasAlternativeChosen;

  const ScanHistoryItem({
    required this.productId,
    required this.scannedAt,
    required this.wasAlternativeChosen,
  });

  @override
  List<Object?> get props => [productId, scannedAt, wasAlternativeChosen];
}