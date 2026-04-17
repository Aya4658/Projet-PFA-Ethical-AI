import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'scan_history_screen.dart';
import 'wishlist_screen.dart';
import 'notifications_screen.dart';
import 'preferences_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              color: AppColor.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColor.primaryGreen.withOpacity(0.2),
                      border: Border.all(
                        color: AppColor.primaryGreen,
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.person,
                      size: 60,
                      color: AppColor.primaryGreen,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '@Username',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'user@ethiccommerce.com',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Edit Profile'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Menu Sections
            _MenuSection(
              title: 'Activity',
              items: [
                _MenuItem(
                  icon: Icons.history,
                  label: 'Scan History',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ScanHistoryScreen(),
                      ),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.favorite_outline,
                  label: 'Wishlist',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const WishlistScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
            _MenuSection(
              title: 'Communication',
              items: [
                _MenuItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notifications',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const NotificationsScreen(),
                      ),
                    );
                  },
                ),
                _MenuItem(
                  icon: Icons.settings_outlined,
                  label: 'Preferences',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PreferencesScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
            _MenuSection(
              title: 'Settings',
              items: [
                _MenuItem(
                  icon: Icons.privacy_tip_outlined,
                  label: 'Privacy & Security',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.help_outline,
                  label: 'Help & Support',
                  onTap: () {},
                ),
              ],
            ),
            _MenuSection(
              title: 'Account',
              items: [
                _MenuItem(
                  icon: Icons.logout,
                  label: 'Logout',
                  onTap: () {},
                  color: AppColor.error,
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColor.darkGray,
                ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppColor.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: List.generate(
              items.length,
              (index) => Column(
                children: [
                  InkWell(
                    onTap: items[index].onTap,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Icon(
                            items[index].icon,
                            color: items[index].color ?? AppColor.primaryGreen,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              items[index].label,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: items[index].color ?? AppColor.textDark,
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right,
                            color: AppColor.darkGray,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (index < items.length - 1)
                    const Divider(height: 1, indent: 16, endIndent: 16),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });
}
