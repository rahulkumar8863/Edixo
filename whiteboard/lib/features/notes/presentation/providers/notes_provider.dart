import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/note.dart';

class NotesState {
  final List<Note> notes;
  final bool isLoading;

  NotesState({List<Note>? notes, this.isLoading = false})
      : notes = notes ?? _mockNotes;

  NotesState copyWith({List<Note>? notes, bool? isLoading}) {
    return NotesState(notes: notes ?? this.notes, isLoading: isLoading ?? this.isLoading);
  }
}

final _mockNotes = <Note>[
  Note(
    id: 'note_1',
    title: 'Algebra Class — 4 March',
    subject: 'Mathematics',
    pageCount: 5,
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
  ),
  Note(
    id: 'note_2',
    title: 'Chemical Bonding',
    subject: 'Chemistry',
    pageCount: 3,
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    updatedAt: DateTime.now().subtract(const Duration(days: 1)),
  ),
];

class NotesNotifier extends StateNotifier<NotesState> {
  NotesNotifier() : super(NotesState());

  void createNote({required String title, required String subject}) {
    final newNote = Note(
      id: 'note_${DateTime.now().millisecondsSinceEpoch}',
      title: title.isEmpty ? 'Untitled Session' : title,
      subject: subject.isEmpty ? 'General' : subject,
      pageCount: 1,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    state = state.copyWith(notes: [newNote, ...state.notes]);
  }

  void deleteNote(String id) {
    state = state.copyWith(notes: state.notes.where((n) => n.id != id).toList());
  }
}

final notesProvider = StateNotifierProvider<NotesNotifier, NotesState>((ref) => NotesNotifier());

List<Note> filterNotes(List<Note> notes, String search, String filter) {
  var filtered = notes;
  if (search.isNotEmpty) {
    filtered = filtered.where((n) =>
      n.title.toLowerCase().contains(search.toLowerCase()) ||
      n.subject.toLowerCase().contains(search.toLowerCase())
    ).toList();
  }
  final now = DateTime.now();
  switch (filter) {
    case 'today':
      filtered = filtered.where((n) =>
        n.updatedAt.day == now.day &&
        n.updatedAt.month == now.month &&
        n.updatedAt.year == now.year
      ).toList();
      break;
    case 'week':
      filtered = filtered.where((n) => now.difference(n.updatedAt).inDays <= 7).toList();
      break;
    case 'month':
      filtered = filtered.where((n) => now.difference(n.updatedAt).inDays <= 30).toList();
      break;
  }
  return filtered;
}
