import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
import 'package:consomateur_app/core/widgets/app_empty_state.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/presentation/pages/product_detail_page.dart';

class ScannerPage extends StatefulWidget {
  final ProductRepository productRepository;
  final bool showAppBar;

  const ScannerPage({
    super.key,
    required this.productRepository,
    this.showAppBar = true,
  });

  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  MobileScannerController? controller;
  final Set<String> scannedIds = {};

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      controller = MobileScannerController();
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final scannedId = barcodes.first.rawValue ?? '';
    if (scannedId.isNotEmpty && !scannedIds.contains(scannedId)) {
      scannedIds.add(scannedId);
      _fetchProduct(scannedId);
    }
  }

  Future<void> _fetchProduct(String id) async {
    try {
      final product = await widget.productRepository.getProductById(id);
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ProductDetailPage(
            product: product,
            repository: widget.productRepository,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Product not found in our database'),
          action: SnackBarAction(
            label: 'Retry',
            onPressed: () => scannedIds.remove(id),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return const AppEmptyState(
        icon: Icons.qr_code_scanner_rounded,
        title: 'Scanner unavailable on web',
        subtitle: 'Use the mobile app to scan product barcodes',
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: widget.showAppBar
          ? AppBar(
              title: const Text('Scan Product'),
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              actions: [
                IconButton(
                  icon: const Icon(Icons.flash_on_outlined),
                  onPressed: () => controller?.toggleTorch(),
                ),
                IconButton(
                  icon: const Icon(Icons.flip_camera_android_outlined),
                  onPressed: () => controller?.switchCamera(),
                ),
              ],
            )
          : null,
      body: Stack(
        fit: StackFit.expand,
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _onDetect,
          ),
          _ScannerOverlay(),
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.eco_rounded, color: AppTheme.accentColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Align the barcode inside the frame to scan',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScannerOverlay extends StatelessWidget {
  static const double _scanSize = 260;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final top = (constraints.maxHeight - _scanSize) / 2;
        final left = (constraints.maxWidth - _scanSize) / 2;

        return Stack(
          children: [
            Positioned(top: 0, left: 0, right: 0, height: top, child: _dim()),
            Positioned(
              top: top + _scanSize,
              left: 0,
              right: 0,
              bottom: 0,
              child: _dim(),
            ),
            Positioned(top: top, left: 0, width: left, height: _scanSize, child: _dim()),
            Positioned(
              top: top,
              left: left + _scanSize,
              right: 0,
              height: _scanSize,
              child: _dim(),
            ),
            Positioned(
              top: top,
              left: left,
              width: _scanSize,
              height: _scanSize,
              child: CustomPaint(painter: _CornerFramePainter()),
            ),
          ],
        );
      },
    );
  }

  Widget _dim() => Container(color: Colors.black.withValues(alpha: 0.5));
}

class _CornerFramePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.accentColor
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const corner = 28.0;
    final w = size.width;
    final h = size.height;

    // Top-left
    canvas.drawLine(const Offset(0, corner), const Offset(0, 0), paint);
    canvas.drawLine(const Offset(0, 0), const Offset(corner, 0), paint);
    // Top-right
    canvas.drawLine(Offset(w - corner, 0), Offset(w, 0), paint);
    canvas.drawLine(Offset(w, 0), Offset(w, corner), paint);
    // Bottom-left
    canvas.drawLine(Offset(0, h - corner), Offset(0, h), paint);
    canvas.drawLine(Offset(0, h), Offset(corner, h), paint);
    // Bottom-right
    canvas.drawLine(Offset(w - corner, h), Offset(w, h), paint);
    canvas.drawLine(Offset(w, h - corner), Offset(w, h), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
