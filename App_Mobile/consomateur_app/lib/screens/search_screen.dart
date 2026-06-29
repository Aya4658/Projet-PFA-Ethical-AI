import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/core/widgets/product_tile.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class SearchScreen extends StatefulWidget {
  final ProductRepository productRepository;

  const SearchScreen({super.key, required this.productRepository});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final Duration _searchDebounceDuration = const Duration(seconds: 1);
  Timer? _searchDebounceTimer;
  List<Product> _searchResults = [];
  bool _isLoading = false;

  void _scheduleSearch(String query) {
    _searchDebounceTimer?.cancel();
    _searchDebounceTimer = Timer(_searchDebounceDuration, () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    final trimmedQuery = query.trim();
    if (trimmedQuery.isEmpty) {
      if (!mounted) return;
      setState(() {
        _searchResults = [];
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = true);

    try {
      final searchResults = await widget.productRepository.searchProducts(trimmedQuery);

      if (!mounted) return;
      setState(() {
        _searchResults = searchResults;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Search failed: ${e.toString()}')),
      );
    }
  }

  @override
  void dispose() {
    _searchDebounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
          child: TextField(
            controller: _searchController,
            onChanged: _scheduleSearch,
            decoration: InputDecoration(
              hintText: 'Search products, brands...',
              prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryColor),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () {
                        _searchController.clear();
                        _searchDebounceTimer?.cancel();
                        _performSearch('');
                      },
                    )
                  : null,
              filled: true,
              fillColor: AppTheme.cardColor,
            ),
          ),
        ),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _searchResults.isEmpty
                  ? AppEmptyState(
                      icon: _searchController.text.isEmpty
                          ? Icons.manage_search_rounded
                          : Icons.search_off_rounded,
                      title: _searchController.text.isEmpty
                          ? 'Discover ethical products'
                          : 'No products found',
                      subtitle: _searchController.text.isEmpty
                          ? 'Type a product name or brand to start searching'
                          : 'Try a different keyword or check your spelling',
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final product = _searchResults[index];
                        final authProvider = context.watch<AuthProvider>();
                        final isFavorite = authProvider.currentUser?.favorites.contains(product.sourceAwareId) ?? false;

                        return ProductTile(
                          product: product,
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              '/product-detail',
                              arguments: product,
                            );
                          },
                          isFavorite: isFavorite,
                          onFavoritePressed: () async {
                            final messenger = ScaffoldMessenger.of(context);
                            if (!authProvider.isAuthenticated) {
                              messenger.showSnackBar(
                                const SnackBar(content: Text('Please log in to add items to your wishlist.')),
                              );
                              return;
                            }

                            try {
                              if (isFavorite) {
                                await authProvider.removeFromFavorites(product.sourceAwareId);
                                if (!mounted) return;
                                messenger.showSnackBar(
                                  const SnackBar(content: Text('Removed from wishlist')),
                                );
                              } else {
                                await authProvider.addToFavorites(product.sourceAwareId);
                                if (!mounted) return;
                                messenger.showSnackBar(
                                  const SnackBar(content: Text('Added to wishlist')),
                                );
                              }
                            } catch (e) {
                              if (!mounted) return;
                              messenger.showSnackBar(
                                SnackBar(content: Text('Unable to update wishlist: $e')),
                              );
                            }
                          },
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
