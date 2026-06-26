import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:consomateur_app/core/theme/app_theme.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';
import '../widgets/score_gauge.dart';
import '../widgets/nutrition_card.dart';
import 'package:consomateur_app/core/services/preference_service.dart';

class ProductDetailPage extends StatefulWidget {
  final Product product;
  final ProductRepository repository;

  const ProductDetailPage({
    super.key,
    required this.product,
    required this.repository,
  });

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  late Future<List<Product>> _alternativesFuture;

  @override
  void initState() {
    super.initState();
    _loadAlternatives();
  }

  Future<void> _loadAlternatives() async {
    final userPreferences = await PreferenceService.getPreferences();
    _alternativesFuture = widget.repository.getEthicalAlternatives(
      widget.product.category,
      widget.product.ethicalScore,
      userPreferences,
    );
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 200,
            backgroundColor: AppTheme.surfaceColor,
            elevation: 0,
            foregroundColor: AppTheme.textPrimary,
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Center(
                  child: Tooltip(
                    message: 'Report product error',
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(10),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () {
                            // Report button functionality will be implemented
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Report feature coming soon'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12.0,
                              vertical: 8.0,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.flag_outlined,
                                  color: Colors.red[600],
                                  size: 20,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Report',
                                  style: GoogleFonts.lato(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.red[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsetsDirectional.only(start: 16, bottom: 16),
              title: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.product.name,
                    style: GoogleFonts.plusJakartaSans(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.w800,
                      fontSize: 17,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Source: ${widget.product.source.label}',
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              background: Container(
                decoration: BoxDecoration(gradient: AppTheme.softGradient),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            sliver: SliverList(
              delegate: SliverChildListDelegate(
                [
                  _buildOverviewCard(),
                  const SizedBox(height: 18),
                  _buildMetricsCard(),
                  const SizedBox(height: 18),
                  _buildCertificationsCard(),
                  const SizedBox(height: 24),
                  if (widget.product.source == ProductSource.openFoodFacts)
                    ..._buildOpenFoodFactsSection(),
                  _buildCompositionCard(),
                  const SizedBox(height: 24),
                  _buildProcessesCard(),
                  const SizedBox(height: 24),
                  _buildCommentsCard(),
                  const SizedBox(height: 24),
                  _buildAlternativesSection(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Score éthique',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 18),
          Center(
            child: ScoreGauge(ethicalScore: widget.product.ethicalScore),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.product.category,
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: Colors.grey[700],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${widget.product.price.toStringAsFixed(2)} ${widget.product.currency}',
                      style: GoogleFonts.lato(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.grey[900],
                      ),
                    ),
                  ],
                ),
              ),
              Builder(
                builder: (context) {
                  final authProvider = context.watch<AuthProvider>();
                  final isFavorite = authProvider.currentUser?.favorites.contains(widget.product.id) ?? false;
                  final messenger = ScaffoldMessenger.of(context);

                  return IconButton(
                    icon: Icon(
                      isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: isFavorite ? Colors.red.shade400 : Colors.grey[600],
                      size: 28,
                    ),
                    tooltip: isFavorite ? 'Remove from wishlist' : 'Add to wishlist',
                    onPressed: () async {
                      if (!authProvider.isAuthenticated) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Please log in to manage your wishlist.')),
                        );
                        return;
                      }

                      try {
                        if (isFavorite) {
                          await authProvider.removeFromFavorites(widget.product.id);
                          if (!mounted) return;
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Removed from wishlist')),
                          );
                        } else {
                          await authProvider.addToFavorites(widget.product.id);
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
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Éléments clés',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          _buildMetricRow(
            icon: Icons.eco,
            label: 'Empreinte carbone',
            value: '${widget.product.carbonFootprintKg.toStringAsFixed(2)} kg',
            color: Colors.green[700]!,
          ),
          const SizedBox(height: 14),
          _buildMetricRow(
            icon: Icons.verified,
            label: 'Commerce équitable',
            value: widget.product.fairTradeCertified ? 'Certifié' : 'Non certifié',
            color: widget.product.fairTradeCertified ? Colors.green[700]! : Colors.red[600]!,
          ),
          const SizedBox(height: 14),
          _buildMetricRow(
            icon: Icons.public,
            label: 'Pays d’origine',
            value: widget.product.originCountry,
            color: Colors.blueGrey[700]!,
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Row(
      children: [
        Container(
          height: 48,
          width: 48,
          decoration: BoxDecoration(
            color: color.withAlpha(31),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.lato(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: GoogleFonts.lato(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCertificationsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Certifications',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: widget.product.labels.map((label) {
              return Chip(
                label: Text(
                  label,
                  style: GoogleFonts.lato(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                backgroundColor: Colors.grey[100],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildOpenFoodFactsSection() {
    final offProduct = widget.product;
    
    // Try to cast to OpenFoodFactsProductModel to get nutrition data
    try {
      final offData = (offProduct as dynamic).nutritionData;
      if (offData != null) {
        return [
          NutritionCard(
            nutriments: offData.nutriments,
            nutrientLevels: offData.nutrientLevels,
            nutritionGrade: offData.nutritionGrade,
            nutriscoreScore: offData.nutriscoreScore,
            ecoscore: offData.ecoscore,
            novaGroup: offData.novaGroup,
            allergens: offData.allergens,
          ),
          const SizedBox(height: 24),
        ];
      }
    } catch (_) {
      // Not an OpenFoodFactsProductModel or no nutrition data
    }
    return [];
  }

  Widget _buildCompositionCard() {
    if (widget.product.composition.isEmpty) {
      return const SizedBox.shrink();
    }
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Composition',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          ...widget.product.composition.map((comp) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            comp.ingredient,
                            style: GoogleFonts.lato(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.grey[900],
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.blue[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${comp.percentage}%',
                            style: GoogleFonts.lato(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.blue[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 6),
                        Text(
                          comp.origin,
                          style: GoogleFonts.lato(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (comp.isOrganic)
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green[100],
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Bio',
                                style: GoogleFonts.lato(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.green[700],
                                ),
                              ),
                            ),
                          ),
                        if (comp.isRecycled)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.purple[100],
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Recyclé',
                              style: GoogleFonts.lato(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.purple[700],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildProcessesCard() {
    if (widget.product.processes.isEmpty) {
      return const SizedBox.shrink();
    }
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Traçabilité Blockchain',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.verified_user, size: 18, color: Colors.blue[600]),
            ],
          ),
          const SizedBox(height: 14),
          if (widget.product.blockchainRootHash != null) ...[
            Text(
              'Hash racine:',
              style: GoogleFonts.lato(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                widget.product.blockchainRootHash!.replaceRange(
                  20,
                  widget.product.blockchainRootHash!.length - 4,
                  '...',
                ),
                style: GoogleFonts.sourceCodePro(
                  fontSize: 11,
                  color: Colors.grey[800],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],
          Text(
            'Étapes de production:',
            style: GoogleFonts.lato(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 10),
          ...widget.product.processes.asMap().entries.map((entry) {
            final index = entry.key;
            final process = entry.value;
            final isLast = index == widget.product.processes.length - 1;
            return Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.blue[600],
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '${process.stepNumber}',
                              style: GoogleFonts.lato(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        if (!isLast)
                          Container(
                            width: 2,
                            height: 40,
                            color: Colors.blue[300],
                            margin: const EdgeInsets.symmetric(vertical: 4),
                          ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            process.process,
                            style: GoogleFonts.lato(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[900],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Hash: ${process.previousHash.replaceRange(
                              12,
                              process.previousHash.length - 4,
                              '...',
                            )}',
                            style: GoogleFonts.sourceCodePro(
                              fontSize: 10,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildCommentsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Community Comments',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.blue[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '12',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.blue[700],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Add Comment Input Section
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                TextField(
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Share your feedback about this product...',
                    hintStyle: GoogleFonts.lato(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(0),
                  ),
                  style: GoogleFonts.lato(
                    fontSize: 13,
                    color: Colors.grey[900],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        // Submit comment functionality will be implemented
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Comment feature coming soon'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[600],
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text(
                        'Post Comment',
                        style: GoogleFonts.lato(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          // Comments List
          Text(
            'Recent Comments',
            style: GoogleFonts.lato(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 12),
          // Sample Comment Item 1
          _buildCommentItem(
            userName: 'Sarah Ahmed',
            userImage: '👤',
            timeAgo: '2 hours ago',
            comment:
                'Great product! Really good quality. I verified the ethical score and it matches the information provided.',
            likes: 5,
          ),
          const SizedBox(height: 12),
          // Sample Comment Item 2
          _buildCommentItem(
            userName: 'Mohamed Hassan',
            userImage: '👤',
            timeAgo: '5 hours ago',
            comment:
                'Fair trade certified as mentioned. Would recommend to others looking for ethical products.',
            likes: 3,
          ),
          const SizedBox(height: 12),
          // Sample Comment Item 3
          _buildCommentItem(
            userName: 'Amina Bella',
            userImage: '👤',
            timeAgo: '1 day ago',
            comment:
                'Just purchased this. The carbon footprint info is very accurate based on my research.',
            likes: 8,
          ),
          const SizedBox(height: 14),
          // Load More Comments Button
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () {
                // Load more comments functionality
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Loading more comments...'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              child: Text(
                'View all comments',
                style: GoogleFonts.lato(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[600],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentItem({
    required String userName,
    required String userImage,
    required String timeAgo,
    required String comment,
    required int likes,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.blue[100],
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Center(
                  child: Text(
                    userImage,
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      userName,
                      style: GoogleFonts.lato(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.grey[900],
                      ),
                    ),
                    Text(
                      timeAgo,
                      style: GoogleFonts.lato(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            comment,
            style: GoogleFonts.lato(
              fontSize: 12,
              color: Colors.grey[800],
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      // Like functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Like functionality coming soon'),
                          duration: Duration(seconds: 1),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8.0,
                        vertical: 4.0,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.thumb_up_outlined,
                              size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            '$likes',
                            style: GoogleFonts.lato(
                              fontSize: 11,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Container(
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      // Reply functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Reply functionality coming soon'),
                          duration: Duration(seconds: 1),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8.0,
                        vertical: 4.0,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.reply_outlined,
                              size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            'Reply',
                            style: GoogleFonts.lato(
                              fontSize: 11,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlternativesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Meilleures alternatives',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 220,
          child: FutureBuilder<List<Product>>(
            future: _alternativesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return Center(
                  child: Text(
                    'Aucune alternative trouvée.',
                    style: GoogleFonts.lato(color: Colors.grey[600]),
                  ),
                );
              }
              return ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: snapshot.data!.length,
                separatorBuilder: (context, _) => const SizedBox(width: 14),
                itemBuilder: (context, index) {
                  final alternative = snapshot.data![index];
                  return _buildAlternativeCard(alternative);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAlternativeCard(Product alternative) {
    final scoreColor = alternative.ethicalScore >= 70
        ? const Color(0xFF2E7D32)
        : alternative.ethicalScore >= 40
            ? const Color(0xFFF2994A)
            : const Color(0xFFE63946);

    return Container(
      width: 180,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(15),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            alternative.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            alternative.category,
            style: GoogleFonts.lato(
              fontSize: 13,
              color: Colors.grey[600],
            ),
          ),
          const Spacer(),
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: scoreColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${alternative.ethicalScore}%',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: scoreColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Chip(
            label: Text(
              'Plus éthique',
              style: GoogleFonts.lato(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            backgroundColor: scoreColor,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          ),
        ],
      ),
    );
  }
}
