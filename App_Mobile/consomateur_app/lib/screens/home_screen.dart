import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/product_discovery/presentation/pages/scanner_page.dart';
import 'package:consomateur_app/features/user_profile/presentation/pages/settings_page.dart';
import 'search_screen.dart';
import 'wishlist_screen.dart';
import 'scan_history_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<String> _screenTitles = [
    'Scan Product',
    'Search',
    'Wishlist',
    'History',
    'Profile',
  ];

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // Get product repository from provider
    final productRepository = Provider.of<ProductRepository>(context);

    // Build screens lazily in build method to avoid theme access issues
    final screens = [
      ScannerPage(productRepository: productRepository, showAppBar: false),
      SearchScreen(productRepository: productRepository),
      WishlistScreen(productRepository: productRepository),
      ScanHistoryScreen(productRepository: productRepository),
      ProfileScreen(productRepository: productRepository),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_screenTitles[_selectedIndex]),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SettingsPage(),
                ),
              );
            },
          ),
        ],
      ),
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner),
            label: 'Scan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Wishlist',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}