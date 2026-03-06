class AIMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? code;

  AIMessage({
    required this.id,
    required this.text,
    required this.isUser,
    DateTime? timestamp,
    this.code,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get hasCode => code != null && code!.isNotEmpty;
}
