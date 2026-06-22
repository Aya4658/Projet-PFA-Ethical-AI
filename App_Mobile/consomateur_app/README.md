# consomateur_app

Flutter client for the Ethico consumer experience.

## Getting Started

### 1) Configure MongoDB URI securely

Do not commit credentials to the repository.

- Copy `.env.example` values into your own local secret manager.
- Pass the database URI at runtime with `--dart-define`.

Example:

```bash
flutter run --dart-define=MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/PFA?retryWrites=true&w=majority"
```

### 2) Run the app

```bash
flutter pub get
flutter run 
```

### 3) Notes

- The app reads product and user data directly from MongoDB collections.
- If `MONGODB_URI` is missing, startup will fail fast with a clear error.
- Keep secrets out of source control (`.env`, `assets/.env`, and similar files are ignored).

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
