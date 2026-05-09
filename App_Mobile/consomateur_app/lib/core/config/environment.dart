import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  Environment._();

  static String get apiBaseUrl {
    final fromDotEnv = _normalizeUrl(dotenv.env['API_BASE_URL'] ?? '');
    final resolvedUrl = fromDotEnv.isEmpty ? 'http://localhost:3000/api' : fromDotEnv;
    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
      throw Exception(
        'Invalid API_BASE_URL scheme. Expected http:// or https://',
      );
    }
    return resolvedUrl.endsWith('/') ? resolvedUrl.substring(0, resolvedUrl.length - 1) : resolvedUrl;
  }

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
}
