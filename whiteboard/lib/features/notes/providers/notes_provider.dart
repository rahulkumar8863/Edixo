import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/note.dart';

class NotesNotifier extends StateNotifier<List<Note>> {
  NotesNotifier() : super([
    Note(
      id: '1',
      title: 'Physics Chapter 1',
      subject: 'Physics',
      pageCount: 5,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    Note(
      id: '2',
      title: 'Math Calculus',
      subject: 'Math',
      pageCount: 12,
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      updatedAt: DateTime.now(),
    ),
  ]);

  void createNote({required String title, required String subject}) {
    final note = Note(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title.isEmpty ? 'Untitled' : title,
      subject: subject.isEmpty ? 'General' : subject,
      pageCount: 1,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    state = [note, ...state];
  }

  void deleteNote(String id) {
    state = state.where((n) => n.id != id).toList();
  }
}

final notesProvider = StateNotifierProvider<NotesNotifier, List<Note>>((ref) {
  return NotesNotifier();
});

class FilterArgs {
  final String search;
  final String filter;
  FilterArgs({required this.search, required this.filter});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FilterArgs &&
          runtimeType == other.runtimeType &&
          search == other.search &&
          filter == other.filter;

  @override
  int get hashCode => search.hashCode ^ filter.hashCode;
}

final filteredNotesProvider = Provider.family<AsyncValue<List<Note>>, FilterArgs>((ref, args) {
  final notes = ref.watch(notesProvider);
  var filtered = notes.where((note) {
    if (args.search.isNotEmpty) {
      if (!note.title.toLowerCase().contains(args.search.toLowerCase()) &&
          !note.subject.toLowerCase().contains(args.search.toLowerCase())) {
        return false;
      }
    }
    final now = DateTime.now();
    switch (args.filter) {
      case 'today':
        return note.updatedAt.day == now.day &&
            note.updatedAt.month == now.month &&
            note.updatedAt.year == now.year;
      case 'week':
        return now.difference(note.updatedAt).inDays <= 7;
      case 'month':
        return now.difference(note.updatedAt).inDays <= 30;
    }
    return true;
  }).toList();
  return AsyncValue.data(filtered);
});
