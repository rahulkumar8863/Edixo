import 'package:flutter_riverpod/flutter_riverpod.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier();
});

final authNotifierProvider = Provider<AuthNotifier>((ref) {
  return ref.watch(authProvider.notifier);
});

class User {
  final String id;
  final String name;
  final String role;

  User({required this.id, this.name = 'Teacher', this.role = 'teacher'});
}

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  // In dev mode, auto-login
  AuthNotifier() : super(AsyncData(User(id: 'dev_user', name: 'Dev Teacher')));

  /// Called by the login screen with (id, password) positional args
  Future<bool> login(String id, String password) async {
    state = const AsyncLoading();
    await Future.delayed(const Duration(milliseconds: 600));

    // Mock credentials — accept any non-empty id+pass for dev
    if (id.isNotEmpty && password.length >= 4) {
      state = AsyncData(User(id: id, name: 'Teacher'));
      return true;
    }

    state = const AsyncData(null);
    return false;
  }

  /// Dev bypass — skip login
  void loginDev() {
    state = AsyncData(User(id: 'dev_user', name: 'Dev Teacher'));
  }

  void logout() {
    state = const AsyncData(null);
  }
}
