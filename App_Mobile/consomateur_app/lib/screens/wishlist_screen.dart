import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class WishlistScreen extends StatefulWidget {
  final ProductRepository productRepository;

  const WishlistScreen({super.key, required this.productRepository});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  List<Product> _wishlistProducts = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadWishlist();
  }

  Future<void> _loadWishlist() async {
    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final user = authProvider.currentUser;

      if (user != null && user.favorites.isNotEmpty) {
        final products = <Product>[];
        for (final productId in user.favorites) {
          try {
            final product = await context.read<ProductRepository>().getProductById(productId);
            products.add(product);
          } catch (e) {
            debugPrint('Error loading wishlist product $productId: $e');
          }
        }
        setState(() => _wishlistProducts = products);
      } else {
        setState(() => _wishlistProducts = []);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading wishlist: $e')),
      );
      setState(() => _wishlistProducts = []);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: const Text('My Wishlist'),
            backgroundColor: Theme.of(context).primaryColor,
          ),
          if (_isLoading)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else if (_wishlistProducts.isEmpty)
            SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 48),
                      Icon(
                        Icons.favorite_border,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Your wishlist is empty',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Start adding products you love',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () {
                          // Navigate to search
                          Navigator.of(context).pushNamed('/');
                        },
                        child: const Text('Explore Products'),
                      ),
                    ],
                  ),
                ),
              ),
            )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final product = _wishlistProducts[index];
                    return ListTile(
                      leading: Icon(
                        Icons.favorite,
                        color: Colors.red[500],
                      ),
                      title: Text(product.name),
                      subtitle: Text('${product.producer.name} - \$${product.price.toStringAsFixed(2)}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete),
                        onPressed: () async {
                          try {
                            final authProvider = context.read<AuthProvider>();
                            await authProvider.removeFromFavorites(product.id);
                            await _loadWishlist();
                            if (!mounted) {
                              return;
                            }
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Removed from wishlist')),
                            );
                          } catch (e) {
                            if (!mounted) {
                              return;
                            }
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Error: $e')),
                            );
                          }
                        },
                      ),
                    );
                  },
                  childCount: _wishlistProducts.length,
                ),
              ),
        ],
      ),
    );
  }
}
