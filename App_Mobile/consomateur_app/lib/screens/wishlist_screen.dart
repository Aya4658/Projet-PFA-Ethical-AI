import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/core/widgets/product_tile.dart';
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
        if (!mounted) return;
        setState(() => _wishlistProducts = products);
      } else {
        setState(() => _wishlistProducts = []);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading wishlist: $e')),
      );
      setState(() => _wishlistProducts = []);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_wishlistProducts.isEmpty) {
      return AppEmptyState(
        icon: Icons.favorite_outline_rounded,
        title: 'Your wishlist is empty',
        subtitle: 'Save products you love and come back to them anytime',
        actionLabel: 'Explore products',
        onAction: () {},
      );
    }

    return RefreshIndicator(
      onRefresh: _loadWishlist,
      color: Theme.of(context).primaryColor,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
        itemCount: _wishlistProducts.length,
        itemBuilder: (context, index) {
          final product = _wishlistProducts[index];
          return ProductTile(
            product: product,
            onTap: () {
              Navigator.pushNamed(
                context,
                '/product-detail',
                arguments: product,
              );
            },
            trailing: IconButton(
              icon: Icon(Icons.favorite_rounded, color: Colors.red.shade400),
              onPressed: () async {
                try {
                  final authProvider = context.read<AuthProvider>();
                  await authProvider.removeFromFavorites(product.id);
                  await _loadWishlist();
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Removed from wishlist')),
                  );
                } catch (e) {
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              },
            ),
          );
        },
      ),
    );
  }
}
