import 'package:flutter/foundation.dart';

import '../../domain/entities/user.dart';
import '../../domain/repositories/user_repository.dart';

class AuthProvider extends ChangeNotifier {
  final UserRepository userRepository;

  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  AuthProvider({required this.userRepository}) {
    _checkCurrentUser();
  }

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;

  Future<void> _checkCurrentUser() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentUser = await userRepository.getCurrentUser();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentUser = await userRepository.login(email, password);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _currentUser = null;
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createAccount(String name, String email, String password, String country) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentUser = await userRepository.createAccount(name, email, password, country);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _currentUser = null;
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updatePreferences(UserPreferences preferences) async {
    if (_currentUser == null) return;

    try {
      await userRepository.updatePreferences(_currentUser!.id, preferences);
      _currentUser = _currentUser!.copyWith(preferences: preferences);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> addToFavorites(String productId) async {
    if (_currentUser == null) return;

    try {
      await userRepository.addToFavorites(_currentUser!.id, productId);
      final updatedFavorites = List<String>.from(_currentUser!.favorites)..add(productId);
      _currentUser = _currentUser!.copyWith(favorites: updatedFavorites);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> removeFromFavorites(String productId) async {
    if (_currentUser == null) return;

    try {
      await userRepository.removeFromFavorites(_currentUser!.id, productId);
      final updatedFavorites = List<String>.from(_currentUser!.favorites)..remove(productId);
      _currentUser = _currentUser!.copyWith(favorites: updatedFavorites);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> recordScan(String productId, bool wasAlternativeChosen) async {
    if (_currentUser == null) return;

    try {
      await userRepository.recordScan(_currentUser!.id, productId, wasAlternativeChosen);
      // Update stats
      final updatedStats = _currentUser!.stats.copyWith(
        totalScans: _currentUser!.stats.totalScans + 1,
      );
      _currentUser = _currentUser!.copyWith(stats: updatedStats);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await userRepository.logout();
      _currentUser = null;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}