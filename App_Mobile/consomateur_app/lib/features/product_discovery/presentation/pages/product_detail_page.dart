import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../widgets/score_gauge.dart';
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
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 200,
            backgroundColor: Colors.white,
            elevation: 0,
            foregroundColor: Colors.black87,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsetsDirectional.only(start: 16, bottom: 16),
              title: Text(
                widget.product.name,
                style: GoogleFonts.poppins(
                  color: Colors.grey[900],
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFE7F4E8), Colors.white],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
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
