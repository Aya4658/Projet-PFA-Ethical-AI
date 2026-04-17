import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  bool isCameraActive = false;
  String scannedProduct = '';

  void _toggleCamera() {
    setState(() {
      isCameraActive = !isCameraActive;
    });

    if (isCameraActive) {
      // Simulate scanning
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            scannedProduct = 'Organic Cotton T-Shirt';
          });
          _showProductDetails();
        }
      });
    }
  }

  void _showProductDetails() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColor.mediumGray,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Product Detected',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: AppColor.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.shopping_bag,
                    size: 80,
                    color: AppColor.primaryGreen,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  scannedProduct,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Certified Ethical • Sustainable • Fair Trade',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '4.8 (2,341 reviews)',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text('View Full Details'),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text('Scan Another'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Product'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Camera preview area
                Container(
                  color: Colors.black,
                  child: Center(
                    child: isCameraActive
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 240,
                                height: 240,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: AppColor.primaryOrange,
                                    width: 3,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.photo_camera,
                                    size: 80,
                                    color: AppColor.primaryOrange,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'Position product in frame',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge
                                    ?.copyWith(color: AppColor.white),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Scanning...',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: AppColor.white,
                                    ),
                              ),
                            ],
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColor.primaryGreen.withOpacity(0.2),
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  size: 60,
                                  color: AppColor.primaryGreen,
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'Camera turned on...',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge
                                    ?.copyWith(color: AppColor.white),
                              ),
                            ],
                          ),
                  ),
                ),

                // Close button (top-left)
                Positioned(
                  top: 16,
                  left: 16,
                  child: FloatingActionButton(
                    mini: true,
                    backgroundColor: Colors.black.withOpacity(0.5),
                    onPressed: () => Navigator.pop(context),
                    child: const Icon(Icons.close),
                  ),
                ),

                // Flash button (top-right)
                Positioned(
                  top: 16,
                  right: 16,
                  child: FloatingActionButton(
                    mini: true,
                    backgroundColor: Colors.black.withOpacity(0.5),
                    onPressed: () {},
                    child: const Icon(Icons.flash_on),
                  ),
                ),
              ],
            ),
          ),

          // Bottom controls
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: const BoxDecoration(
              color: AppColor.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 8,
                  offset: Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                children: [
                  Text(
                    isCameraActive ? 'Tap to stop scanning' : 'Ready to scan',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: FloatingActionButton.extended(
                      onPressed: _toggleCamera,
                      backgroundColor: AppColor.primaryGreen,
                      label: Text(
                        isCameraActive ? 'Stop Scanning' : 'Start Scanning',
                      ),
                      icon: Icon(isCameraActive ? Icons.stop : Icons.photo_camera),
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
