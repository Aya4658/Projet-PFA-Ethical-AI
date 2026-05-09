import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:consomateur_app/features/product_discovery/domain/repositories/product_repository.dart';
import 'package:consomateur_app/features/user_profile/presentation/pages/settings_page.dart';
import 'package:consomateur_app/features/user_management/presentation/providers/auth_provider.dart';

class ProfileScreen extends StatefulWidget {
  final ProductRepository productRepository;

  const ProfileScreen({super.key, required this.productRepository});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;

        if (user == null) {
          return const Scaffold(
            body: Center(
              child: Text('No user data available'),
            ),
          );
        }

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 200,
                backgroundColor: Theme.of(context).primaryColor,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(user.name),
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Theme.of(context).primaryColor,
                          Theme.of(context).primaryColor.withAlpha(200),
                        ],
                      ),
                    ),
                    child: const Center(
                      child: CircleAvatar(
                        radius: 50,
                        backgroundColor: Colors.white,
                        child: Icon(
                          Icons.person,
                          size: 50,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // User Info Section
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'User Information',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 12),
                              ListTile(
                                leading: const Icon(Icons.email),
                                title: const Text('Email'),
                                subtitle: Text(user.email),
                                dense: true,
                              ),
                              ListTile(
                                leading: const Icon(Icons.location_on),
                                title: const Text('Country'),
                                subtitle: Text(user.country),
                                dense: true,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Preferences Section
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Ethical Preferences',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 12),
                              ListTile(
                                leading: const Icon(Icons.eco),
                                title: const Text('Manage Preferences'),
                                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                dense: true,
                                onTap: () {
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
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Statistics Section
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Statistics',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildStatCard(
                                    context,
                                    user.stats.totalScans.toString(),
                                    'Products Scanned',
                                  ),
                                  _buildStatCard(
                                    context,
                                    user.favorites.length.toString(),
                                    'Wishlist Items',
                                  ),
                                  _buildStatCard(
                                    context,
                                    user.stats.ethicalAwarenessScore.toString(),
                                    'Ethical Score',
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Account Settings Section
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Account Settings',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 12),
                              ListTile(
                                leading: const Icon(Icons.notifications),
                                title: const Text('Notifications'),
                                trailing: Switch(
                                  value: true,
                                  onChanged: (value) {},
                                ),
                                dense: true,
                              ),
                              ListTile(
                                leading: const Icon(Icons.privacy_tip),
                                title: const Text('Privacy Policy'),
                                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                dense: true,
                                onTap: () {},
                              ),
                              ListTile(
                                leading: const Icon(Icons.help),
                                title: const Text('Help & Support'),
                                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                dense: true,
                                onTap: () {},
                              ),
                              ListTile(
                                leading: const Icon(Icons.logout, color: Colors.red),
                                title: const Text('Logout', style: TextStyle(color: Colors.red)),
                                dense: true,
                                onTap: () {
                                  authProvider.logout();
                                },
                              ),
                            ],
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
      },
    );
  }

  Widget _buildStatCard(BuildContext context, String value, String label) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
