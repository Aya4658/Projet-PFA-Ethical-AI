import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/product_model.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late bool isFavorite;
  double userRating = 0;

  @override
  void initState() {
    super.initState();
    isFavorite = widget.product.isFavorite;
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
    final score = widget.product.ethicalScore;
    final scoreColor = _getScoreColor(score.colorCode);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
        actions: [
          IconButton(
            icon: Icon(
              isFavorite ? Icons.favorite : Icons.favorite_outline,
              color: isFavorite ? AppColor.error : AppColor.white,
            ),
            onPressed: () {
              setState(() {
                isFavorite = !isFavorite;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isFavorite ? 'Added to wishlist' : 'Removed from wishlist',
                  ),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Product Image
            Container(
              width: double.infinity,
              height: 250,
              color: AppColor.primaryGreen.withOpacity(0.1),
              child: const Icon(
                Icons.shopping_bag,
                size: 100,
                color: AppColor.primaryGreen,
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Title & Producer
                  Text(
                    widget.product.name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'by ${widget.product.producer}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),

                  // Ethical Score Card (P0)
                  Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Ethical Score',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: scoreColor,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  score.grade,
                                  style: const TextStyle(
                                    color: AppColor.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          // Color-coded progress bar (P0)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: score.overall / 100,
                              minHeight: 8,
                              backgroundColor: AppColor.mediumGray,
                              valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${score.overall.toStringAsFixed(0)}/100',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 16),
                          // Score breakdown
                          _ScoreBreakdown(score: score),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Description (P0)
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.product.description,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  // Certifications (P0)
                  Text(
                    'Certifications',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  if (widget.product.certifications.isEmpty)
                    Text(
                      'No certifications available',
                      style: Theme.of(context).textTheme.bodySmall,
                    )
                  else
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.product.certifications
                          .map((cert) => Chip(
                                label: Text(cert),
                                backgroundColor: AppColor.primaryGreen
                                    .withOpacity(0.2),
                                labelStyle: const TextStyle(
                                  color: AppColor.primaryGreen,
                                ),
                              ))
                          .toList(),
                    ),
                  const SizedBox(height: 24),

                  // Traceability (P0)
                  Text(
                    'Traceability & Origin',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  _TraceabilityTimeline(
                    traceability: widget.product.traceability,
                  ),
                  const SizedBox(height: 24),

                  // Working Conditions & Environmental Impact (P0)
                  Text(
                    'Impact Details',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  _ImpactCard(
                    icon: Icons.eco,
                    title: 'Carbon Footprint',
                    value: '${score.carbonFootprint} CO₂',
                    color: Colors.green,
                  ),
                  const SizedBox(height: 8),
                  if (score.workingConditions != null)
                    _ImpactCard(
                      icon: Icons.people,
                      title: 'Working Conditions',
                      value: score.workingConditions!,
                      color: Colors.blue,
                    ),
                  const SizedBox(height: 24),

                  // Red Flags (P0)
                  if (score.flags.isNotEmpty) ...[
                    Text(
                      'Concerns',
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(color: AppColor.error),
                    ),
                    const SizedBox(height: 12),
                    ...score.flags
                        .map((flag) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.warning,
                                    color: AppColor.error,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      flag,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall,
                                    ),
                                  ),
                                ],
                              ),
                            ))
                        .toList(),
                    const SizedBox(height: 24),
                  ],

                  // Reviews Section (P1)
                  Text(
                    'Reviews (${widget.product.reviews.length})',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  _ReviewsWidget(reviews: widget.product.reviews),
                  const SizedBox(height: 24),

                  // Rating Input (P1)
                  Text(
                    'Leave a Review',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: List.generate(
                      5,
                      (index) => IconButton(
                        icon: Icon(
                          index < userRating ? Icons.star : Icons.star_outline,
                          color: Colors.amber,
                        ),
                        onPressed: () {
                          setState(() {
                            userRating = index + 1.0;
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Thank you for rating $userRating stars!',
                            ),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      child: const Text('Submit Review'),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Report Button (P1)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Product reported. Thank you for keeping EthicCommerce safe.',
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.flag_outlined),
                      label: const Text('Report Product'),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreBreakdown extends StatelessWidget {
  final EthicalScore score;

  const _ScoreBreakdown({required this.score});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _ScoreRow(
          label: 'Environmental',
          value: score.environmental,
        ),
        const SizedBox(height: 8),
        _ScoreRow(
          label: 'Social Impact',
          value: score.socialImpact,
        ),
        const SizedBox(height: 8),
        _ScoreRow(
          label: 'Transparency',
          value: score.transparency,
        ),
      ],
    );
  }
}

class _ScoreRow extends StatelessWidget {
  final String label;
  final double value;

  const _ScoreRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        Expanded(
          flex: 3,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value / 100,
              minHeight: 6,
              backgroundColor: AppColor.mediumGray,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColor.primaryGreen,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          width: 35,
          child: Text(
            '${value.toStringAsFixed(0)}%',
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}

class _TraceabilityTimeline extends StatelessWidget {
  final TraceabilityInfo traceability;

  const _TraceabilityTimeline({required this.traceability});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: traceability.steps.length * 80.0,
      child: ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        itemCount: traceability.steps.length,
        itemBuilder: (context, index) {
          final step = traceability.steps[index];
          final isLast = index == traceability.steps.length - 1;

          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColor.primaryGreen,
                        border: Border.all(
                          color: AppColor.white,
                          width: 3,
                        ),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 50,
                        color: AppColor.mediumGray,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.location,
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: AppColor.textDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        step.description,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        step.date.toString().split(' ')[0],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColor.darkGray,
                            ),
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

class _ImpactCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _ImpactCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColor.mediumGray),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewsWidget extends StatelessWidget {
  final List<UserReview> reviews;

  const _ReviewsWidget({required this.reviews});

  @override
  Widget build(BuildContext context) {
    if (reviews.isEmpty) {
      return Text(
        'No reviews yet. Be the first to review!',
        style: Theme.of(context).textTheme.bodySmall,
      );
    }

    return Column(
      children: reviews.take(3).map((review) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        review.userName,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      Row(
                        children: List.generate(
                          5,
                          (i) => Icon(
                            i < review.rating ? Icons.star : Icons.star_outline,
                            size: 12,
                            color: Colors.amber,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    review.comment,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    review.date.toString().split(' ')[0],
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColor.darkGray,
                        ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
