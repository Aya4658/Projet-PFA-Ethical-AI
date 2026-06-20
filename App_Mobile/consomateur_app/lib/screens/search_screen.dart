import 'package:flutter/material.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/core/widgets/product_tile.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';

class SearchScreen extends StatefulWidget {
  final ProductRepository productRepository;

  const SearchScreen({super.key, required this.productRepository});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Product> _searchResults = [];
  bool _isLoading = false;

  void _performSearch(String query) async {
    if (query.isEmpty) {
      setState(() => _searchResults = []);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final searchResults = await widget.productRepository.searchProducts(query);

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
            onChanged: _performSearch,
            decoration: InputDecoration(
              hintText: 'Search products, brands...',
              prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryColor),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () {
                        _searchController.clear();
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
                        return ProductTile(
                          product: product,
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              '/product-detail',
                              arguments: product,
                            );
                          },
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
