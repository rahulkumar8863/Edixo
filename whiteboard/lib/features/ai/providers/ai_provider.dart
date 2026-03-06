import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../domain/models/ai_message.dart';
import 'package:uuid/uuid.dart';
import '../../super_admin/providers/module_config_provider.dart';

class AIState {
  final List<AIMessage> messages;
  final bool isLoading;
  final String language;
  final int gradeLevel;
  final int usedTokens;
  final bool isQuotaExceeded;

  AIState({
    this.messages = const [],
    this.isLoading = false,
    this.language = 'English',
    this.gradeLevel = 10,
    this.usedTokens = 0,
    this.isQuotaExceeded = false,
  });

  AIState copyWith({
    List<AIMessage>? messages,
    bool? isLoading,
    String? language,
    int? gradeLevel,
    int? usedTokens,
    bool? isQuotaExceeded,
  }) {
    return AIState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      language: language ?? this.language,
      gradeLevel: gradeLevel ?? this.gradeLevel,
      usedTokens: usedTokens ?? this.usedTokens,
      isQuotaExceeded: isQuotaExceeded ?? this.isQuotaExceeded,
    );
  }
}

class AINotifier extends StateNotifier<AIState> {
  AINotifier() : super(AIState());

  void _addMessage(AIMessage message) {
    state = state.copyWith(messages: [...state.messages, message]);
  }

  Future<void> sendMessage(String text, WidgetRef ref) async {
    final config = ref.read(moduleConfigProvider);
    if (state.usedTokens >= config.globalAiTokenLimit) {
      state = state.copyWith(isQuotaExceeded: true);
      _addMessage(AIMessage(
        id: const Uuid().v4(),
        text: "AI limit reached for this session. Please contact admin.",
        isUser: false,
        timestamp: DateTime.now(),
      ));
      return;
    }

    final userMsg = AIMessage(
      id: const Uuid().v4(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );
    
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isLoading: true,
    );

    // Simulated API call
    await Future.delayed(const Duration(seconds: 1));
    final response = _generateResponse(text);
    
    _addMessage(AIMessage(
      id: const Uuid().v4(),
      text: response,
      isUser: false,
      timestamp: DateTime.now(),
    ));

    state = state.copyWith(
      isLoading: false,
      usedTokens: state.usedTokens + (text.length + response.length) * 5, // Mock token calculation
    );
  }

  Future<void> explainCurrentTopic() => sendMessage('Is topic ko step-by-step explain karo aur samajhne mein aasaan banao.');
  Future<void> solveCurrentQuestion() => sendMessage('Is question ka solution step-by-step dikhao.');
  Future<void> generateExamples() => sendMessage('Is concept ke 3 aur examples do jo students ke liye helpful hon.');
  Future<void> summarizePage() => sendMessage('Current whiteboard page ka content summarize karo.');
  Future<void> recognizeHandwriting() => sendMessage('[OCR] Whiteboard ka handwritten text identify karo.');
  Future<void> askAboutQuestion(dynamic question) => sendMessage('Is question ke baare mein explain karo: ${question.questionText}');

  void setLanguage(String lang) => state = state.copyWith(language: lang);
  void setGradeLevel(int level) => state = state.copyWith(gradeLevel: level);

  Future<void> startVoiceRecognition() async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(seconds: 2));
    // Simulated transcript
    final transcript = state.language == 'hi' ? 'Newton ka second law samjhao' : 'Explain Newtons second law';
    state = state.copyWith(isLoading: false);
    sendMessage(transcript);
  }

  String _generateResponse(String query) {
    final q = query.toLowerCase();
    final isHindi = state.language == 'hi';
    final isAdvanced = state.gradeLevel > 10;

    if (q.contains('newton') || q.contains('law')) {
      if (isHindi) {
        return isAdvanced 
          ? '**Newton ka Second Law (Advanced):**\n\nForce (F) momentum ke change ki rate ke barabar hota hai: $F = \\frac{dp}{dt} = ma$. Ye vector quantity hai.\n\n*Class ${state.gradeLevel} ke hisaab se.*'
          : '**Newton ka Second Law (Simple):**\n\nKisi object ko push ya pull (Force) karne se uska acceleration mass par depend karta hai: $F = ma$.\n\n*Class ${state.gradeLevel} ke hisaab se.*';
      } else {
        return isAdvanced
          ? '**Newton\'s Second Law (Advanced):**\n\nForce is the rate of change of momentum: $F = \\frac{dp}{dt} = ma$. It involves vector calculus.\n\n*Grade ${state.gradeLevel} complexity.*'
          : '**Newton\'s Second Law (Simple):**\n\nForce equals mass times acceleration: $F = ma$. It means heavy things need more force to move.\n\n*Grade ${state.gradeLevel} complexity.*';
      }
    }

    if (q.contains('explain')) {
      return isHindi 
        ? '**Explanation (Class ${state.gradeLevel}):**\n\n1. Concept ki shuruat\n2. Main point\n3. Daily life example'
        : '**Explanation (Grade ${state.gradeLevel}):**\n\n1. Concept Foundation\n2. Theoretical core\n3. Real-world application';
    }
    
    return isHindi 
      ? 'Main Class ${state.gradeLevel} ke level par Hindi mein aapki help kar sakta hun. Kya puchna chahte hain?'
      : 'I can assist you in English for Grade ${state.gradeLevel} level. What is your question?';
  }
}

final aiProvider = StateNotifierProvider<AINotifier, AIState>((ref) => AINotifier());
final aiMessagesProvider = Provider<List<AIMessage>>((ref) => ref.watch(aiProvider).messages);
final aiLoadingProvider = Provider<bool>((ref) => ref.watch(aiProvider).isLoading);
final aiPanelVisibilityProvider = StateProvider<bool>((ref) => false);
