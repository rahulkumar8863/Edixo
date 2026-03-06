class WhiteboardSession {
  final String id;
  final String name;
  final int currentPage;
  final int totalPages;
  final double zoom;

  WhiteboardSession({
    required this.id,
    required this.name,
    this.currentPage = 1,
    this.totalPages = 1,
    this.zoom = 1.0,
  });

  WhiteboardSession copyWith({
    String? id,
    String? name,
    int? currentPage,
    int? totalPages,
    double? zoom,
  }) {
    return WhiteboardSession(
      id: id ?? this.id,
      name: name ?? this.name,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      zoom: zoom ?? this.zoom,
    );
  }
}
