import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:consomateur_app/core/services/preference_service.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';
import 'package:consomateur_app/core/widgets/app_card.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late Map<String, bool> _preferences;

  @override
  void initState() {
    super.initState();
    _preferences = {};
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await PreferenceService.getPreferences();
    if (!mounted) return;
    setState(() => _preferences = prefs);
  }

  Future<void> _savePreferences() async {
    await PreferenceService.savePreferences(_preferences);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Preferences saved!')),
    );
  }

  void _updatePreference(String key, bool value) {
    setState(() => _preferences[key] = value);
    _savePreferences();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      appBar: AppBar(
        title: Text(
          'Ethical Preferences',
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: _preferences.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  'Customize what matters most to you when discovering products.',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      _buildPreferenceTile(
                        title: 'Bio / Organic',
                        subtitle: 'Prioritize organic and sustainable products',
                        icon: Icons.eco_outlined,
                        key: 'Bio',
                        value: _preferences['Bio'] ?? true,
                      ),
                      const Divider(height: 1, indent: 16, endIndent: 16),
                      _buildPreferenceTile(
                        title: 'Local products',
                        subtitle: 'Support local producers and reduce emissions',
                        icon: Icons.location_on_outlined,
                        key: 'Local',
                        value: _preferences['Local'] ?? true,
                      ),
                      const Divider(height: 1, indent: 16, endIndent: 16),
                      _buildPreferenceTile(
                        title: 'Vegan',
                        subtitle: 'Prefer animal-free ingredients',
                        icon: Icons.spa_outlined,
                        key: 'Vegan',
                        value: _preferences['Vegan'] ?? false,
                      ),
                      const Divider(height: 1, indent: 16, endIndent: 16),
                      _buildPreferenceTile(
                        title: 'Fair trade',
                        subtitle: 'Support ethical labor and production',
                        icon: Icons.handshake_outlined,
                        key: 'Equitable',
                        value: _preferences['Equitable'] ?? true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildPreferenceTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required String key,
    required bool value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppTheme.primaryColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: (newValue) => _updatePreference(key, newValue),
            activeThumbColor: AppTheme.primaryColor,
          ),
        ],
      ),
    );
  }
}
