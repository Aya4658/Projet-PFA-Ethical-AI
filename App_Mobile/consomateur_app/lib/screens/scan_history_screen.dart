import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
import 'package:consomateur_app/core/widgets/app_card.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class ScanHistoryScreen extends StatelessWidget {
  final ProductRepository productRepository;

  const ScanHistoryScreen({super.key, required this.productRepository});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final scanHistory = authProvider.currentUser?.scanHistory ?? [];

        if (scanHistory.isEmpty) {
          return const AppEmptyState(
            icon: Icons.history_rounded,
            title: 'No scan history yet',
            subtitle: 'Products you scan will appear here for quick access',
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
          itemCount: scanHistory.length,
          itemBuilder: (context, index) {
            final historyItem = scanHistory[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: FutureBuilder<Product>(
                future: context.read<ProductRepository>().getProductById(historyItem.productId),
                builder: (context, snapshot) {
                  final isLoading = snapshot.connectionState == ConnectionState.waiting;
                  final product = snapshot.data;
                  final title = isLoading
                      ? 'Loading...'
                      : product?.name ?? 'Unknown product';
                  final subtitle = DateFormat('MMM dd, yyyy · hh:mm a')
                      .format(historyItem.scannedAt);

                  return AppCard(
                    onTap: product == null
                        ? null
                        : () {
                            Navigator.pushNamed(
                              context,
                              '/product-detail',
                              arguments: product,
                            );
                          },
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: isLoading
                              ? const Padding(
                                  padding: EdgeInsets.all(12),
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(
                                  Icons.qr_code_2_rounded,
                                  color: AppTheme.primaryColor,
                                ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.plusJakartaSans(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                subtitle,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                              if (historyItem.wasAlternativeChosen) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppTheme.accentColor.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    'Alternative chosen',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (product != null)
                          Icon(
                            Icons.chevron_right_rounded,
                            color: AppTheme.textSecondary.withValues(alpha: 0.5),
                          ),
                      ],
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
