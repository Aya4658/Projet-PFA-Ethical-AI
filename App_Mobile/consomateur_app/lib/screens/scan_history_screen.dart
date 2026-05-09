import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class ScanHistoryScreen extends StatefulWidget {
  final ProductRepository productRepository;

  const ScanHistoryScreen({super.key, required this.productRepository});

  @override
  State<ScanHistoryScreen> createState() => _ScanHistoryScreenState();
}

class _ScanHistoryScreenState extends State<ScanHistoryScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          final scanHistory = user?.scanHistory ?? [];

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                title: const Text('Scan History'),
                backgroundColor: Theme.of(context).primaryColor,
                actions: [
                  if (scanHistory.isNotEmpty)
                    PopupMenuButton(
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          child: Text('Clear History'),
                        ),
                      ],
                      onSelected: (value) {
                        // TODO: Implement clear history
                      },
                    ),
                ],
              ),
              if (scanHistory.isEmpty)
                SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 48),
                          Icon(
                            Icons.history,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No scan history yet',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Your scanned products will appear here',
                            style: TextStyle(color: Colors.grey[600]),
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
                      final historyItem = scanHistory[index];
                      return FutureBuilder<Product>(
                        future: context.read<ProductRepository>().getProductById(historyItem.productId),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState == ConnectionState.waiting) {
                            return const ListTile(
                              leading: Icon(Icons.qr_code_2),
                              title: CircularProgressIndicator(),
                            );
                          }

                          if (snapshot.hasError) {
                            return ListTile(
                              leading: const Icon(Icons.qr_code_2),
                              title: const Text('Unknown Product'),
                              subtitle: Text(DateFormat('MMM dd, yyyy - hh:mm a').format(historyItem.scannedAt)),
                            );
                          }

                          final product = snapshot.data;
                          if (product == null) {
                            return ListTile(
                              leading: const Icon(Icons.qr_code_2),
                              title: const Text('Product Not Found'),
                              subtitle: Text(DateFormat('MMM dd, yyyy - hh:mm a').format(historyItem.scannedAt)),
                            );
                          }

                          return ListTile(
                            leading: const Icon(Icons.qr_code_2),
                            title: Text(product.name),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(DateFormat('MMM dd, yyyy - hh:mm a').format(historyItem.scannedAt)),
                                if (historyItem.wasAlternativeChosen)
                                  const Padding(
                                    padding: EdgeInsets.only(top: 4.0),
                                    child: Text(
                                      'Alternative chosen',
                                      style: TextStyle(color: Colors.green),
                                    ),
                                  ),
                              ],
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                '/product-detail',
                                arguments: product,
                              );
                            },
                          );
                        },
                      );
                    },
                    childCount: scanHistory.length,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
