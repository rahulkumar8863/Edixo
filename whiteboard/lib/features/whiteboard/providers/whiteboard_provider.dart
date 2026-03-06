import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import '../../questions/domain/models/question.dart';
import '../../notes/domain/models/note.dart';
import '../domain/models/whiteboard_session.dart';

class WhiteboardContent {
  final List<dynamic> items;
  
  WhiteboardContent({this.items = const []});

  WhiteboardContent copyWith({List<dynamic>? items}) {
    return WhiteboardContent(
      items: items ?? this.items,
    );
  }
}

class WhiteboardContentNotifier extends StateNotifier<WhiteboardContent> {
  WhiteboardContentNotifier() : super(WhiteboardContent());

  void loadNote(Note note) {
    // load content
  }

  void addQuestion(Question question) {
    state = state.copyWith(items: [...state.items, question]);
  }

  void addLatex(String latex) {
    state = state.copyWith(items: [...state.items, latex]);
  }

  void addGraph({required String function, required List<Offset> points, required Rect bounds}) {
    state = state.copyWith(items: [...state.items, {'type': 'graph', 'function': function, 'points': points, 'bounds': bounds}]);
  }
}

final whiteboardContentProvider = StateNotifierProvider<WhiteboardContentNotifier, WhiteboardContent>((ref) {
  return WhiteboardContentNotifier();
});

class WhiteboardSessionNotifier extends StateNotifier<WhiteboardSession?> {
  WhiteboardSessionNotifier() : super(null);

  void saveSession() {}
  void addPage() {}
  void setPage(int page) {}
  void setZoom(double zoom) {}
}

final whiteboardSessionProvider = StateNotifierProvider<WhiteboardSessionNotifier, WhiteboardSession?>((ref) {
  return WhiteboardSessionNotifier();
});
