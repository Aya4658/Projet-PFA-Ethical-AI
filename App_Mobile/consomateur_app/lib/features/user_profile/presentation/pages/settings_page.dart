import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:consomateur_app/core/services/preference_service.dart';
import 'package:consomateur_app/core/theme/app_theme.dart';

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
    setState(() {
      _preferences = prefs;
    });
  }

  Future<void> _savePreferences() async {
    await PreferenceService.savePreferences(_preferences);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preferences saved!')),
      );
    }
  }

  void _updatePreference(String key, bool value) {
    setState(() {
      _preferences[key] = value;
    });
    _savePreferences();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Ethical Preferences',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: _preferences.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildPreferenceTile(
                  title: 'Bio/Organic',
                  subtitle: 'Prioritize organic and sustainable products',
                  key: 'Bio',
                  value: _preferences['Bio'] ?? true,
                ),
                const Divider(height: 1),
                _buildPreferenceTile(
                  title: 'Local Products',
                  subtitle: 'Support local producers and reduce transport emissions',
                  key: 'Local',
                  value: _preferences['Local'] ?? true,
                ),
                const Divider(height: 1),
                _buildPreferenceTile(
                  title: 'Vegan',
                  subtitle: 'Choose products free from animal-derived ingredients',
                  key: 'Vegan',
                  value: _preferences['Vegan'] ?? false,
                ),
                const Divider(height: 1),
                _buildPreferenceTile(
                  title: 'Fair Trade/Equitable',
                  subtitle: 'Support fair labor practices and ethical production',
                  key: 'Equitable',
                  value: _preferences['Equitable'] ?? true,
                ),
              ],
            ),
    );
  }

  Widget _buildPreferenceTile({
    required String title,
    required String subtitle,
    required String key,
    required bool value,
  }) {
    return SwitchListTile(
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: Colors.black87,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 14,
          color: Colors.grey[600],
        ),
      ),
      value: value,
      onChanged: (newValue) => _updatePreference(key, newValue),
      activeThumbColor: AppTheme.light.colorScheme.primary,
      activeTrackColor: AppTheme.light.colorScheme.primary.withAlpha(128),
    );
  }
}