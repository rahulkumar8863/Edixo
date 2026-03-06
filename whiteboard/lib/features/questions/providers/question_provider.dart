import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/question.dart';

class QuestionPanelState {
  final String setId;
  final String setName;
  final String creatorName;
  final List<Question> questions;
  final int currentIndex;

  QuestionPanelState({
    required this.setId,
    required this.setName,
    required this.creatorName,
    required this.questions,
    this.currentIndex = 0,
  });

  Question? get currentQuestion => 
      questions.isNotEmpty && currentIndex < questions.length 
          ? questions[currentIndex] 
          : null;

  int get totalQuestions => questions.length;

  QuestionPanelState copyWith({
    String? setId,
    String? setName,
    String? creatorName,
    List<Question>? questions,
    int? currentIndex,
  }) {
    return QuestionPanelState(
      setId: setId ?? this.setId,
      setName: setName ?? this.setName,
      creatorName: creatorName ?? this.creatorName,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
    );
  }
}

class QuestionPanelNotifier extends StateNotifier<AsyncValue<QuestionPanelState>> {
  QuestionPanelNotifier() : super(AsyncValue.data(QuestionPanelState(
    setId: '',
    setName: '',
    creatorName: '',
    questions: [],
  )));

  Future<bool> loadSet({required String id, required String password, required String type}) async {
    state = const AsyncValue.loading();
    try {
      // Mock network call
      await Future.delayed(const Duration(seconds: 1));
      
      final mockData = QuestionPanelState(
        setId: id,
        setName: 'Mock Physics Test 1',
        creatorName: 'Aman Sir',
        questions: [
          Question(
            id: '1',
            text: 'What is the SI unit of Force?',
            options: ['Joule', 'Newton', 'Watt', 'Pascal'],
            correctOption: 1,
            explanation: 'Newton is the SI unit of force. 1 N = 1 kg*m/s^2',
          ),
          Question(
            id: '2',
            text: 'Solve for x: 2x + 5 = 15',
            options: ['3', '4', '5', '6'],
            correctOption: 2,
          ),
        ],
      );
      
      state = AsyncValue.data(mockData);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  void nextQuestion() {
    state.whenData((data) {
      if (data.currentIndex < data.questions.length - 1) {
        state = AsyncValue.data(data.copyWith(currentIndex: data.currentIndex + 1));
      }
    });
  }

  void previousQuestion() {
    state.whenData((data) {
      if (data.currentIndex > 0) {
        state = AsyncValue.data(data.copyWith(currentIndex: data.currentIndex - 1));
      }
    });
  }
}

final questionPanelProvider = StateNotifierProvider<QuestionPanelNotifier, AsyncValue<QuestionPanelState>>((ref) {
  return QuestionPanelNotifier();
});

final questionPanelVisibilityProvider = StateProvider<bool>((ref) => false);
