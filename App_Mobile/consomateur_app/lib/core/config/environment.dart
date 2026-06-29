import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  Environment._();

  static String get apiBaseUrl {
    final fromDotEnv = _normalizeUrl(dotenv.env['API_BASE_URL'] ?? '');
    final resolvedUrl = fromDotEnv.isNotEmpty
        ? _trimTrailingSlash(fromDotEnv)
        : (kIsWeb
            ? 'http://192.168.11.108:3000/api'
            : (_isAndroid ? 'http://10.0.2.2:3000/api' : 'http://192.168.11.108:3000/api'));
    return resolvedUrl;
  }

  static String get aiBotBaseUrl {
    final fromDotEnv = _normalizeUrl(dotenv.env['AI_BOT_BASE_URL'] ?? '');
    if (fromDotEnv.isNotEmpty) {
      return _trimTrailingSlash(fromDotEnv);
    }

    if (kIsWeb) {
      return 'http://192.168.11.108:8000';
    }

    return _isAndroid ? 'http://10.0.2.2:8000' : 'http://192.168.11.108:8000';
  }

  static bool get _isAndroid => defaultTargetPlatform == TargetPlatform.android;

  static String _normalizeUrl(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) {
      return '';
    }
    final firstToken = trimmed.split(RegExp(r'\s+')).first;

    // Remove wrapping quotes if they were passed through.
    if ((firstToken.startsWith('"') && firstToken.endsWith('"')) ||
        (firstToken.startsWith("'") && firstToken.endsWith("'"))) {
      return firstToken.substring(1, firstToken.length - 1);
    }

    return firstToken;
  }

  static String _trimTrailingSlash(String url) {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
}
