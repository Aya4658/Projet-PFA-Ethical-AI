import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:consomateur_app/features/product_discovery/domain/entities/product.dart';
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
  late MobileScannerController controller;
  final Set<String> scannedIds = {}; // To prevent multiple scans of the same code

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      controller = MobileScannerController();
    }
  }

  @override
  void dispose() {
    if (!kIsWeb) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final String scannedId = barcodes.first.rawValue ?? '';
      if (scannedId.isNotEmpty && !scannedIds.contains(scannedId)) {
        scannedIds.add(scannedId);
        _fetchProduct(scannedId);
      }
    }
  }

  Future<void> _fetchProduct(String id) async {
    try {
      final Product product = await widget.productRepository.getProductById(id);
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailPage(
              product: product,
              repository: widget.productRepository,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Product not found. Would you like to add it manually?'),
            action: SnackBarAction(
              label: 'Add',
              onPressed: () {
                // Placeholder for manual add functionality
                // TODO: Implement manual product addition
              },
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Scan Product'),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.web, size: 64, color: Colors.grey),
              SizedBox(height: 16),
              Text(
                'Barcode scanning is not available on web',
                style: TextStyle(fontSize: 18, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 8),
              Text(
                'Please use the mobile app for scanning functionality',
                style: TextStyle(fontSize: 14, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Product'),
        actions: kIsWeb ? null : [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => controller.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => controller.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _onDetect,
          ),
          // Scanning Overlay
          Container(
            color: Colors.black.withAlpha(128),
            child: Center(
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text(
                    'Align barcode here',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}