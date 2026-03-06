class Note {
  final String id;
  final String title;
  final String subject;
  final int pageCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? thumbnailUrl;
  final String? linkedSetId;

  Note({
    required this.id,
    required this.title,
    required this.subject,
    required this.pageCount,
    required this.createdAt,
    required this.updatedAt,
    this.thumbnailUrl,
    this.linkedSetId,
  });
}
