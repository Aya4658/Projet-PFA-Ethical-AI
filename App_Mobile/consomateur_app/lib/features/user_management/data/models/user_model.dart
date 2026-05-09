import '../../domain/entities/user.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.country,
    required super.preferences,
    required super.stats,
    required super.favorites,
    required super.scanHistory,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: _parseUserId(json),
      name: json['name'] as String,
      email: json['email'] as String,
      country: json['country'] as String,
      preferences: UserPreferencesModel.fromJson(json['preferences'] as Map<String, dynamic>),
      stats: UserStatsModel.fromJson(json['stats'] as Map<String, dynamic>),
      favorites: List<String>.from(json['favorites'] ?? []),
      scanHistory: (json['scan_history'] as List<dynamic>?)
          ?.map((item) => ScanHistoryItemModel.fromJson(item as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    final numericId = int.tryParse(id);
    return {
      if (numericId != null) 'id': numericId,
      'name': name,
      'email': email,
      'country': country,
      'preferences': (preferences as UserPreferencesModel).toJson(),
      'stats': (stats as UserStatsModel).toJson(),
      'favorites': favorites,
      'scan_history': scanHistory.map((item) => (item as ScanHistoryItemModel).toJson()).toList(),
    };
  }

  static String _parseUserId(Map<String, dynamic> json) {
    final dynamic rawId = json['_id'] ?? json['id'];
    if (rawId == null) {
      throw Exception('User document is missing id field.');
    }
    return rawId.toString();
  }
}

class UserPreferencesModel extends UserPreferences {
  const UserPreferencesModel({
    required super.isVegan,
    required super.isOrganicFocused,
    required super.isFairTradeFocused,
    required super.isLocalFocused,
    required super.maxCarbonFootprint,
  });

  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) {
    return UserPreferencesModel(
      isVegan: json['is_vegan'] as bool? ?? false,
      isOrganicFocused: json['is_organic_focused'] as bool? ?? true,
      isFairTradeFocused: json['is_fair_trade_focused'] as bool? ?? true,
      isLocalFocused: json['is_local_focused'] as bool? ?? true,
      maxCarbonFootprint: (json['max_carbon_footprint'] as num?)?.toDouble() ?? 7.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_vegan': isVegan,
      'is_organic_focused': isOrganicFocused,
      'is_fair_trade_focused': isFairTradeFocused,
      'is_local_focused': isLocalFocused,
      'max_carbon_footprint': maxCarbonFootprint,
    };
  }
}

class UserStatsModel extends UserStats {
  const UserStatsModel({
    required super.totalScans,
    required super.totalPurchases,
    required super.ethicalAwarenessScore,
    required super.totalCo2SavedKg,
  });

  factory UserStatsModel.fromJson(Map<String, dynamic> json) {
    return UserStatsModel(
      totalScans: json['total_scans'] as int? ?? 0,
      totalPurchases: json['total_purchases'] as int? ?? 0,
      ethicalAwarenessScore: json['ethical_awareness_score'] as int? ?? 50,
      totalCo2SavedKg: (json['total_co2_saved_kg'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_scans': totalScans,
      'total_purchases': totalPurchases,
      'ethical_awareness_score': ethicalAwarenessScore,
      'total_co2_saved_kg': totalCo2SavedKg,
    };
  }
}

class ScanHistoryItemModel extends ScanHistoryItem {
  const ScanHistoryItemModel({
    required super.productId,
    required super.scannedAt,
    required super.wasAlternativeChosen,
  });

  factory ScanHistoryItemModel.fromJson(Map<String, dynamic> json) {
    final scannedAtRaw = json['scanned_at'] ?? json['timestamp'];
    return ScanHistoryItemModel(
      productId: json['product_id'].toString(),
      scannedAt: DateTime.parse(scannedAtRaw.toString()),
      wasAlternativeChosen: json['was_alternative_chosen'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'scanned_at': scannedAt.toIso8601String(),
      'was_alternative_chosen': wasAlternativeChosen,
    };
  }
}