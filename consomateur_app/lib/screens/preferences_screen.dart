import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/product_model.dart';

class PreferencesScreen extends StatefulWidget {
  final UserPreferences? initialPreferences;

  const PreferencesScreen({super.key, this.initialPreferences});

  @override
  State<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends State<PreferencesScreen> {
  late bool preferOrganic;
  late bool preferLocal;
  late bool preferVegan;
  late bool preferFairTrade;
  late int minEthicalScore;
  late List<String> selectedCategories;

  final List<String> availableCategories = [
    'Food & Beverage',
    'Clothing',
    'Electronics',
    'Home & Garden',
    'Beauty & Personal Care',
    'Sports & Outdoors',
  ];

  @override
  void initState() {
    super.initState();
    final prefs = widget.initialPreferences ??
        UserPreferences();
    preferOrganic = prefs.preferOrganic;
    preferLocal = prefs.preferLocal;
    preferVegan = prefs.preferVegan;
    preferFairTrade = prefs.preferFairTrade;
    minEthicalScore = prefs.minEthicalScore;
    selectedCategories = List.from(prefs.interestedCategories);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Preferences'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Preferences Section
              Text(
                'Product Preferences',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              _PreferenceCheckbox(
                title: 'Organic Products',
                subtitle: 'Prefer certified organic items',
                value: preferOrganic,
                icon: Icons.balance,
                onChanged: (value) {
                  setState(() {
                    preferOrganic = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 12),
              _PreferenceCheckbox(
                title: 'Local Products',
                subtitle: 'Support local producers',
                value: preferLocal,
                icon: Icons.location_on,
                onChanged: (value) {
                  setState(() {
                    preferLocal = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 12),
              _PreferenceCheckbox(
                title: 'Vegan Products',
                subtitle: 'Animal-free alternatives',
                value: preferVegan,
                icon: Icons.favorite,
                onChanged: (value) {
                  setState(() {
                    preferVegan = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 12),
              _PreferenceCheckbox(
                title: 'Fair Trade Products',
                subtitle: 'Support fair labor practices',
                value: preferFairTrade,
                icon: Icons.handshake,
                onChanged: (value) {
                  setState(() {
                    preferFairTrade = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 32),

              // Ethical Score Threshold
              Text(
                'Minimum Ethical Score',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColor.mediumGray),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Score Threshold',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColor.primaryGreen.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${minEthicalScore.toInt()}/100',
                            style: const TextStyle(
                              color: AppColor.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Slider(
                      value: minEthicalScore.toDouble(),
                      min: 0,
                      max: 100,
                      divisions: 10,
                      activeColor: AppColor.primaryGreen,
                      inactiveColor: AppColor.mediumGray,
                      onChanged: (value) {
                        setState(() {
                          minEthicalScore = value.toInt();
                        });
                      },
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Low',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Text(
                          'Medium',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Text(
                          'High',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Interested Categories
              Text(
                'Interested Categories',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: availableCategories.map((category) {
                  final isSelected = selectedCategories.contains(category);
                  return FilterChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (value) {
                      setState(() {
                        if (value) {
                          selectedCategories.add(category);
                        } else {
                          selectedCategories.remove(category);
                        }
                      });
                    },
                    backgroundColor: AppColor.white,
                    selectedColor: AppColor.primaryGreen.withOpacity(0.3),
                    side: BorderSide(
                      color: isSelected
                          ? AppColor.primaryGreen
                          : AppColor.mediumGray,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),

              // Notification Preferences (P3)
              Text(
                'Notifications',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              _PreferenceCheckbox(
                title: 'Push Notifications',
                subtitle: 'Get alerts on product updates',
                value: true,
                onChanged: (value) {},
              ),
              const SizedBox(height: 12),
              _PreferenceCheckbox(
                title: 'Email Notifications',
                subtitle: 'Receive recommendations via email',
                value: true,
                onChanged: (value) {},
              ),
              const SizedBox(height: 32),

              // Save Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Preferences saved successfully!'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.check),
                  label: const Text('Save Preferences'),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _PreferenceCheckbox extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool?> onChanged;
  final IconData? icon;

  const _PreferenceCheckbox({
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: CheckboxListTile(
        title: Text(title),
        subtitle: subtitle != null ? Text(subtitle!) : null,
        value: value,
        onChanged: onChanged,
        secondary: icon != null ? Icon(icon, color: AppColor.primaryGreen) : null,
        activeColor: AppColor.primaryGreen,
        checkColor: AppColor.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 0),
      ),
    );
  }
}
