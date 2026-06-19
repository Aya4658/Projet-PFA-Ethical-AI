import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
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

  static const List<String> _screenSubtitles = [
    'Point your camera at a barcode',
    'Find ethical products',
    'Your saved favorites',
    'Recently scanned items',
    'Your account & stats',
  ];

  @override
  Widget build(BuildContext context) {
    final productRepository = Provider.of<ProductRepository>(context);

    final screens = [
      ScannerPage(productRepository: productRepository, showAppBar: false),
      SearchScreen(productRepository: productRepository),
      WishlistScreen(productRepository: productRepository),
      ScanHistoryScreen(productRepository: productRepository),
      ProfileScreen(productRepository: productRepository),
    ];

    final showHeader = _selectedIndex != 4;

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      appBar: showHeader
          ? AppBar(
              title: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _screenTitles[_selectedIndex],
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    _screenSubtitles[_selectedIndex],
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
              actions: [
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.tune_rounded, color: AppTheme.primaryColor),
                    tooltip: 'Preferences',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const SettingsPage()),
                      );
                    },
                  ),
                ),
              ],
            )
          : null,
      body: screens[_selectedIndex],
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.borderColor),
            boxShadow: AppTheme.cardShadow,
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: NavigationBar(
              selectedIndex: _selectedIndex,
              backgroundColor: AppTheme.cardColor,
              indicatorColor: AppTheme.primaryColor.withValues(alpha: 0.12),
              elevation: 0,
              height: 68,
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              onDestinationSelected: (index) => setState(() => _selectedIndex = index),
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.qr_code_scanner_outlined),
                  selectedIcon: Icon(Icons.qr_code_scanner_rounded),
                  label: 'Scan',
                ),
                NavigationDestination(
                  icon: Icon(Icons.search_rounded),
                  selectedIcon: Icon(Icons.manage_search_rounded),
                  label: 'Search',
                ),
                NavigationDestination(
                  icon: Icon(Icons.favorite_outline_rounded),
                  selectedIcon: Icon(Icons.favorite_rounded),
                  label: 'Wishlist',
                ),
                NavigationDestination(
                  icon: Icon(Icons.history_rounded),
                  selectedIcon: Icon(Icons.history_toggle_off_rounded),
                  label: 'History',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline_rounded),
                  selectedIcon: Icon(Icons.person_rounded),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
