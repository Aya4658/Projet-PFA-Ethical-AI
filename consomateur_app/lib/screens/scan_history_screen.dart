import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/product_model.dart';

class ScanHistoryScreen extends StatefulWidget {
  const ScanHistoryScreen({super.key});

  @override
  State<ScanHistoryScreen> createState() => _ScanHistoryScreenState();
}

class _ScanHistoryScreenState extends State<ScanHistoryScreen> {
  // Mock data
  final List<ScanHistory> scanHistory = [
    ScanHistory(
      productId: '1',
      productName: 'Organic Cotton T-Shirt',
      scannedAt: DateTime.now().subtract(const Duration(days: 2)),
      ethicalScore: 85,
    ),
    ScanHistory(
      productId: '2',
      productName: 'Eco-Friendly Bag',
      scannedAt: DateTime.now().subtract(const Duration(days: 5)),
      ethicalScore: 72,
    ),
    ScanHistory(
      productId: '3',
      productName: 'Fair Trade Coffee',
      scannedAt: DateTime.now().subtract(const Duration(days: 8)),
      ethicalScore: 91,
    ),
    ScanHistory(
      productId: '4',
      productName: 'Sustainable Sneakers',
      scannedAt: DateTime.now().subtract(const Duration(days: 10)),
      ethicalScore: 78,
    ),
    ScanHistory(
      productId: '5',
      productName: 'Vegan Skincare Set',
      scannedAt: DateTime.now().subtract(const Duration(days: 15)),
      ethicalScore: 88,
    ),
  ];

  String _getColorCode(double score) {
    if (score >= 75) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  }

  Color _getScoreColor(double score) {
    if (score >= 75) return AppColor.success;
    if (score >= 50) return AppColor.warning;
    return AppColor.error;
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()} weeks ago';
    } else {
      return '${(difference.inDays / 30).floor()} months ago';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan History'),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'export') {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Exporting history as PDF...'),
                    duration: Duration(seconds: 2),
                  ),
                );
              }
            },
            itemBuilder: (BuildContext context) {
              return [
                const PopupMenuItem<String>(
                  value: 'export',
                  child: Row(
                    children: [
                      Icon(Icons.download, color: AppColor.primaryGreen),
                      SizedBox(width: 8),
                      Text('Export as PDF'),
                    ],
                  ),
                ),
              ];
            },
          ),
        ],
      ),
      body: scanHistory.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history,
                    size: 80,
                    color: AppColor.mediumGray,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No scans yet',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Start scanning products to build your history',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: scanHistory.length,
              itemBuilder: (context, index) {
                final scan = scanHistory[index];
                final scoreColor = _getScoreColor(scan.ethicalScore);

                return Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: InkWell(
                    onTap: () {
                      // Navigate to product detail
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Opening ${scan.productName} details...',
                          ),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          // Product Icon
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: scoreColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              Icons.shopping_bag,
                              color: scoreColor,
                              size: 30,
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Product Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  scan.productName,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _formatDate(scan.scannedAt),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall,
                                ),
                              ],
                            ),
                          ),

                          // Score Badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: scoreColor,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${scan.ethicalScore.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: AppColor.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
