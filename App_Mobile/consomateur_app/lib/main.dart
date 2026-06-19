import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme/app_theme.dart';
import 'features/product_discovery/data/datasources/product_remote_data_source.dart';
import 'features/product_discovery/data/repositories/product_repository_impl.dart';
import 'features/product_discovery/domain/entities/product.dart';
import 'features/product_discovery/domain/repositories/product_repository.dart';
import 'features/product_discovery/presentation/pages/product_detail_page.dart';
import 'features/user_management/data/datasources/user_remote_data_source.dart';
import 'features/user_management/data/repositories/user_repository_impl.dart';
import 'features/user_management/domain/repositories/user_repository.dart';
import 'features/user_management/presentation/pages/login_screen.dart';
import 'features/user_management/presentation/pages/register_screen.dart';
import 'features/user_management/presentation/providers/auth_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: '.env');
  } catch (firstError) {
    try {
      await dotenv.load(fileName: 'assets/.env');
    } catch (secondError) {
      throw Exception(
        'Unable to load environment file. '
        'Tried .env and assets/.env. '
        'First error: $firstError. '
        'Second error: $secondError.',
      );
    }
  }

  // Initialize shared preferences
  final sharedPreferences = await SharedPreferences.getInstance();

  runApp(MyApp(sharedPreferences: sharedPreferences));
}

class MyApp extends StatelessWidget {
  final SharedPreferences sharedPreferences;

  const MyApp({super.key, required this.sharedPreferences});

  @override
  Widget build(BuildContext context) {
    // Initialize repositories
    final ProductRemoteDataSource productRemoteDataSource = ProductRemoteDataSourceImpl();
    final ProductRepository productRepository = ProductRepositoryImpl(productRemoteDataSource);

    final UserRemoteDataSource userRemoteDataSource = UserRemoteDataSourceImpl();
    final UserRepository userRepository = UserRepositoryImpl(
      remoteDataSource: userRemoteDataSource,
      sharedPreferences: sharedPreferences,
    );

    return MultiProvider(
      providers: [
        Provider<ProductRepository>.value(value: productRepository),
        ChangeNotifierProvider(
          create: (_) => AuthProvider(userRepository: userRepository),
        ),
      ],
      child: MaterialApp(
        title: 'Ethical Commerce App',
        theme: AppTheme.light,
        initialRoute: '/',
        onGenerateRoute: (settings) {
          if (settings.name == '/product-detail') {
            final product = settings.arguments;
            if (product is Product) {
              return MaterialPageRoute(
                builder: (context) => ProductDetailPage(
                  product: product,
                  repository: context.read<ProductRepository>(),
                ),
              );
            }
          }
          return null;
        },
        routes: {
          '/': (context) => const AuthWrapper(
            authenticatedScreen: HomeScreen(),
            unauthenticatedScreen: LoginScreen(),
          ),
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  final Widget authenticatedScreen;
  final Widget unauthenticatedScreen;

  const AuthWrapper({
    super.key,
    required this.authenticatedScreen,
    required this.unauthenticatedScreen,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isLoading) {
          return Scaffold(
            body: Container(
              decoration: BoxDecoration(gradient: AppTheme.primaryGradient),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.15),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: const Icon(Icons.eco_rounded, color: Colors.white, size: 36),
                    ),
                    const SizedBox(height: 24),
                    const CircularProgressIndicator(color: Colors.white),
                  ],
                ),
              ),
            ),
          );
        }

        if (authProvider.isAuthenticated) {
          return authenticatedScreen;
        }

        return unauthenticatedScreen;
      },
    );
  }
}
