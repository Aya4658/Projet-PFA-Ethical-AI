import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<String> searchHistory = ['Organic Cotton T-shirt', 'Eco-friendly Bag', 'Recycled Sneakers'];
  List<Product> searchResults = [];
  bool isSearching = false;
  
  // Filters
  bool filterOrganic = false;
  bool filterLocal = false;
  bool filterFairTrade = false;
  int minScore = 0;

  void _performSearch() {
    if (_searchController.text.isEmpty) return;

    setState(() {
      isSearching = true;
      // Add to history if not already there
      if (!searchHistory.contains(_searchController.text)) {
        searchHistory.insert(0, _searchController.text);
      }
    });

    // Simulate search results
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          searchResults = [
            Product(
              title: _searchController.text,
              description: 'Ethical and sustainable product',
              imageColor: Colors.blue.shade100,
              rating: 4.5,
            ),
            Product(
              title: '${_searchController.text} Premium',
              description: 'Premium quality sustainable product',
              imageColor: Colors.green.shade100,
              rating: 4.8,
            ),
            Product(
              title: '${_searchController.text} Deluxe',
              description: 'Luxury ethical product',
              imageColor: Colors.amber.shade100,
              rating: 4.9,
            ),
          ];
          isSearching = false;
        });
      }
    });
  }

  void _clearHistory() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Search History?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                searchHistory.clear();
              });
              Navigator.pop(context);
            },
            child: const Text('Clear', style: TextStyle(color: AppColor.error)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Products'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Search bar
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColor.white,
              child: TextField(
                controller: _searchController,
                onSubmitted: (_) => _performSearch(),
                decoration: InputDecoration(
                  hintText: 'Search ethical products...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              searchResults.clear();
                            });
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (value) {
                  setState(() {});
                },
              ),
            ),
            const SizedBox(height: 8),

            // Search loading or results
            if (isSearching)
              const Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(color: AppColor.primaryGreen),
              )
            else if (searchResults.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Search Results (${searchResults.length})',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    ...searchResults.map((product) => _ProductCard(product: product)),                    const SizedBox(height: 24),
                    // Alternatives Section (P0)
                    Text(
                      'More Ethical Alternatives',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'We found products with better ethical scores:',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    _AlternativeCard(
                      title: '${_searchController.text} - Eco Premium',
                      rating: 4.9,
                      ethicalScore: 92,
                      improvement: '+15%',
                    ),
                    const SizedBox(height: 12),
                    _AlternativeCard(
                      title: '${_searchController.text} - Fair Trade Version',
                      rating: 4.8,
                      ethicalScore: 88,
                      improvement: '+12%',
                    ),                  ],
                ),
              )
            else if (_searchController.text.isEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Search History',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        if (searchHistory.isNotEmpty)
                          TextButton(
                            onPressed: _clearHistory,
                            child: const Text('Clear'),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (searchHistory.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 32),
                          child: Text(
                            'No search history yet',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      )
                    else
                      ...searchHistory.map((item) => _HistoryItem(
                            item: item,
                            onTap: () {
                              _searchController.text = item;
                              _performSearch();
                            },
                            onDelete: () {
                              setState(() {
                                searchHistory.remove(item);
                              });
                            },
                          )),
                  ],
                ),
              )
            else
              Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    const Icon(Icons.search, size: 64, color: AppColor.mediumGray),
                    const SizedBox(height: 16),
                    Text(
                      'No results found',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Try searching with different keywords',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class Product {
  final String title;
  final String description;
  final Color imageColor;
  final double rating;

  Product({
    required this.title,
    required this.description,
    required this.imageColor,
    required this.rating,
  });
}

class _ProductCard extends StatelessWidget {
  final Product product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: product.imageColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.shopping_bag, size: 40, color: AppColor.darkGray),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.title,
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.description,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        '${product.rating}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryItem extends StatelessWidget {
  final String item;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _HistoryItem({
    required this.item,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(color: AppColor.mediumGray),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: const Icon(Icons.history, color: AppColor.darkGray),
        title: Text(item),
        trailing: IconButton(
          icon: const Icon(Icons.close, size: 20),
          onPressed: onDelete,
        ),
        onTap: onTap,
      ),
    );
  }
}

class _AlternativeCard extends StatelessWidget {
  final String title;
  final double rating;
  final int ethicalScore;
  final String improvement;

  const _AlternativeCard({
    required this.title,
    required this.rating,
    required this.ethicalScore,
    required this.improvement,
  });

  @override
  Widget build(BuildContext context) {
    Color scoreColor;
    if (ethicalScore >= 75) {
      scoreColor = AppColor.success;
    } else if (ethicalScore >= 50) {
      scoreColor = AppColor.warning;
    } else {
      scoreColor = AppColor.error;
    }

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: scoreColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.check_circle,
                size: 30,
                color: scoreColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        '$rating',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: scoreColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$ethicalScore',
                          style: const TextStyle(
                            color: AppColor.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColor.success.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    improvement,
                    style: const TextStyle(
                      color: AppColor.success,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Icon(
                  Icons.arrow_forward,
                  size: 16,
                  color: AppColor.primaryGreen,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
