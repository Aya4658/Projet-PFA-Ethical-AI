import 'package:flutter/material.dart';

class ScoreGauge extends StatelessWidget {
  final int ethicalScore;
  final double size;

  const ScoreGauge({
    super.key,
    required this.ethicalScore,
    this.size = 160,
  });

  Color get _scoreColor {
    if (ethicalScore >= 70) {
      return const Color(0xFF2E7D32);
    }
    if (ethicalScore >= 40) {
      return const Color(0xFFF2994A);
    }
    return const Color(0xFFE63946);
  }

  String get _scoreLabel {
    if (ethicalScore >= 70) {
      return 'Excellent';
    }
    if (ethicalScore >= 40) {
      return 'Correct';
    }
    return 'Attention';
  }

  @override
  Widget build(BuildContext context) {
    final color = _scoreColor;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: color.withAlpha(51),
                width: 14,
              ),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$ethicalScore',
                style: TextStyle(
                  color: color,
                  fontSize: size * 0.3,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _scoreLabel,
                style: TextStyle(
                  color: Colors.grey[700],
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
