import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/product_model.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  // Mock wishlist data
  final List<Product> wishlistItems = [
    Product(
      id: '1',
      name: 'Organic Cotton T-Shirt',
      producer: 'EcoWear Co',
      imageUrl: '',
      ethicalScore: EthicalScore(
        overall: 85,
        environmental: 90,
        socialImpact: 85,
        transparency: 80,
        carbonFootprint: '2.5kg',
      ),
      description: 'Premium organic cotton tee',
      certifications: ['GOTS', 'Fair Trade'],
      ingredients: [],
      traceability: TraceabilityInfo(steps: []),
      reviews: [],
      rating: 4.8,
      scannedAt: DateTime.now(),
      isFavorite: true,
    ),
    Product(
      id: '2',
      name: 'Eco-Friendly Bag',
      producer: 'Green Goods',
      imageUrl: '',
      ethicalScore: EthicalScore(
        overall: 72,
        environmental: 75,
        socialImpact: 70,
        transparency: 70,
        carbonFootprint: '1.2kg',
      ),
      description: 'Recyclable material bag',
      certifications: ['Recyclable'],
      ingredients: [],
      traceability: TraceabilityInfo(steps: []),
      reviews: [],
      rating: 4.5,
      scannedAt: DateTime.now(),
      isFavorite: true,
    ),
    Product(
      id: '3',
      name: 'Fair Trade Coffee',
      producer: 'Coffee Collective',
      imageUrl: '',
      ethicalScore: EthicalScore(
        overall: 91,
        environmental: 88,
        socialImpact: 95,
        transparency: 90,
        carbonFootprint: '0.8kg',
      ),
      description: '100% Fair Trade Arabica',
      certifications: ['Fair Trade', 'Organic'],
      ingredients: [],
      traceability: TraceabilityInfo(steps: []),
      reviews: [],
      rating: 4.9,
      scannedAt: DateTime.now(),
      isFavorite: true,
    ),
  ];

  void _removeFromWishlist(int index) {
    setState(() {
      wishlistItems.removeAt(index);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Removed from wishlist'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Color _getScoreColor(String colorCode) {
    switch (colorCode) {
      case 'green':
        return AppColor.success;
      case 'orange':
        return AppColor.warning;
      case 'red':
        return AppColor.error;
      default:
        return AppColor.darkGray;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Wishlist'),
        centerTitle: true,
        actions: [
          if (wishlistItems.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${wishlistItems.length}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: wishlistItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_outline,
                    size: 80,
                    color: AppColor.mediumGray,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Your wishlist is empty',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Save products you love to compare later',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: wishlistItems.length,
              itemBuilder: (context, index) {
                final product = wishlistItems[index];
                final scoreColor = _getScoreColor(
                  product.ethicalScore.colorCode,
                );

                return Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      InkWell(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Viewing ${product.name}...',
                              ),
                            ),
                          );
                        },
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(12),
                          topRight: Radius.circular(12),
                        ),
                        child: Container(
                          width: double.infinity,
                          height: 150,
                          decoration: BoxDecoration(
                            color: AppColor.primaryGreen.withOpacity(0.1),
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(12),
                              topRight: Radius.circular(12),
                            ),
                          ),
                          child: const Icon(
                            Icons.shopping_bag,
                            size: 50,
                            color: AppColor.primaryGreen,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.name,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleSmall,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'by ${product.producer}',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall,
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.close,
                                    color: AppColor.error,
                                  ),
                                  onPressed: () {
                                    _removeFromWishlist(index);
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Ethical Score',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall,
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 10,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: scoreColor,
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            product.ethicalScore.grade,
                                            style: const TextStyle(
                                              color: AppColor.white,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '${product.ethicalScore.overall.toStringAsFixed(0)}/100',
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.end,
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      size: 16,
                                      color: Colors.amber,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      product.rating.toString(),
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () {},
                                    child: const Text('Compare'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () {},
                                    child: const Text('View Details'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
