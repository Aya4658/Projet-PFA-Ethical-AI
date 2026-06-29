import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/core/widgets/product_tile.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class WishlistScreen extends StatelessWidget {
  final ProductRepository productRepository;

  const WishlistScreen({super.key, required this.productRepository});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final favorites = authProvider.currentUser?.favorites ?? [];

        if (favorites.isEmpty) {
          return AppEmptyState(
            icon: Icons.favorite_outline_rounded,
            title: 'Your wishlist is empty',
            subtitle: 'Save products you love and come back to them anytime',
            actionLabel: 'Explore products',
            onAction: () {},
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
          itemCount: favorites.length,
          itemBuilder: (context, index) {
            final productId = favorites[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: FutureBuilder<Product>(
                future: context.read<ProductRepository>().getProductById(productId),
                builder: (context, snapshot) {
                  final isLoading = snapshot.connectionState == ConnectionState.waiting;
                  final product = snapshot.data;

                  if (isLoading || product == null) {
                    return Container(
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : const SizedBox.shrink(),
                    );
                  }

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
                          await authProvider.removeFromFavorites(product.sourceAwareId);
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Removed from wishlist')),
                          );
                        } catch (e) {
                          if (!context.mounted) return;
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
          },
        );
      },
    );
  }
}
