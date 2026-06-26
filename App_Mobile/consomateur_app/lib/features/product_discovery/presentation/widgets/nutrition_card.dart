import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NutritionCard extends StatelessWidget {
  final Map<String, dynamic>? nutriments;
  final Map<String, dynamic>? nutrientLevels;
  final String? nutritionGrade;
  final int? nutriscoreScore;
  final String? ecoscore;
  final int? novaGroup;
  final String? allergens;

  const NutritionCard({
    super.key,
    this.nutriments,
    this.nutrientLevels,
    this.nutritionGrade,
    this.nutriscoreScore,
    this.ecoscore,
    this.novaGroup,
    this.allergens,
  });

  @override
  Widget build(BuildContext context) {
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
            'Nutritional Information',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          // Grades Row
          Row(
            children: [
              if (nutritionGrade != null) ...[
                Expanded(
                  child: _GradeBadge(
                    label: 'Nutri-Score',
                    grade: nutritionGrade!,
                    color: _gradeColor(nutritionGrade!),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              if (ecoscore != null) ...[
                Expanded(
                  child: _GradeBadge(
                    label: 'EcoScore',
                    grade: ecoscore!,
                    color: _gradeColor(ecoscore!),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              if (novaGroup != null)
                Expanded(
                  child: _GradeBadge(
                    label: 'NOVA Group',
                    grade: novaGroup.toString(),
                    color: _novaColor(novaGroup!),
                  ),
                ),
            ],
          ),
          if (allergens != null && (allergens as String).isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_rounded, size: 16, color: Colors.red[700]),
                      const SizedBox(width: 8),
                      Text(
                        'Allergens',
                        style: GoogleFonts.lato(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.red[900],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    allergens!.replaceAll('en:', ''),
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      color: Colors.red[800],
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (nutriments != null && (nutriments as Map).isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(
              'Per 100g',
              style: GoogleFonts.lato(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 10),
            ..._buildNutrientsList(nutriments as Map<String, dynamic>),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildNutrientsList(Map<String, dynamic> nutriments) {
    final items = <Widget>[];
    final keyMap = {
      'energy-kcal_100g': ('Energy', 'kcal'),
      'fat_100g': ('Fat', 'g'),
      'saturated-fat_100g': ('Saturated Fat', 'g'),
      'carbohydrates_100g': ('Carbs', 'g'),
      'sugars_100g': ('Sugars', 'g'),
      'fiber_100g': ('Fiber', 'g'),
      'proteins_100g': ('Protein', 'g'),
      'salt_100g': ('Salt', 'g'),
    };

    keyMap.forEach((key, labelUnit) {
      if (nutriments.containsKey(key)) {
        final value = nutriments[key];
        if (value != null) {
          items.add(
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    labelUnit.$1,
                    style: GoogleFonts.lato(fontSize: 13, color: Colors.grey[700]),
                  ),
                  Text(
                    '${value.toStringAsFixed(1)} ${labelUnit.$2}',
                    style: GoogleFonts.lato(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[900],
                    ),
                  ),
                ],
              ),
            ),
          );
        }
      }
    });

    return items;
  }

  Color _gradeColor(String grade) {
    switch (grade.toUpperCase()) {
      case 'A':
        return Colors.green;
      case 'B':
        return Colors.lightGreen;
      case 'C':
        return Colors.orange;
      case 'D':
        return Colors.deepOrange;
      case 'E':
      case 'F':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _novaColor(int group) {
    switch (group) {
      case 1:
        return Colors.green;
      case 2:
        return Colors.lightGreen;
      case 3:
        return Colors.orange;
      case 4:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

class _GradeBadge extends StatelessWidget {
  final String label;
  final String grade;
  final Color color;

  const _GradeBadge({
    required this.label,
    required this.grade,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.lato(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            grade,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
