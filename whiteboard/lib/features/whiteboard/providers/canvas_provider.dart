import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:typed_data';

// ─── Stroke Data ────────────────────────────────────────────────────────────
class StrokePoint {
  final double x;
  final double y;
  final double pressure;

  const StrokePoint(this.x, this.y, {this.pressure = 1.0});
}

class Stroke {
  final String id;
  final List<StrokePoint> points;
  final Color color;
  final double thickness;
  final double opacity;
  final StrokeType type;
  final String? text;
  final bool isFilled;
  final bool isSelected;

  Stroke({
    required this.id,
    required this.points,
    required this.color,
    this.thickness = 2.0,
    this.opacity = 1.0,
    this.type = StrokeType.pen,
    this.text,
    this.isFilled = false,
    this.isSelected = false,
  });

  Stroke copyWith({
    String? id,
    List<StrokePoint>? points,
    Color? color,
    double? thickness,
    double? opacity,
    StrokeType? type,
    String? text,
    bool? isFilled,
    bool? isSelected,
  }) {
    return Stroke(
      id: id ?? this.id,
      points: points ?? this.points,
      color: color ?? this.color,
      thickness: thickness ?? this.thickness,
      opacity: opacity ?? this.opacity,
      type: type ?? this.type,
      text: text ?? this.text,
      isFilled: isFilled ?? this.isFilled,
      isSelected: isSelected ?? this.isSelected,
    );
  }
}

enum StrokeType { 
  pen, pencil, highlighter, eraser, laserPointer,
  rectangle, circle, triangle, line, arrow, 
  text, threeDObject
}

// ─── Page Template ──────────────────────────────────────────────────────────
enum PageTemplate { blank, ruled, grid, dotGrid, mathGrid }
enum BackgroundColor { white, lightBlue, lightYellow, dark }

// ─── Page Data ──────────────────────────────────────────────────────────────
class PageData {
  final String id;
  final PageTemplate template;
  final BackgroundColor bgColor;
  final Uint8List? bgImageBytes;

  PageData({
    required this.id,
    List<Stroke>? strokes,
    this.template = PageTemplate.blank,
    this.bgColor = BackgroundColor.white,
    this.bgImageBytes,
  }) : strokes = strokes ?? [];

  PageData copyWith({
    List<Stroke>? strokes,
    PageTemplate? template,
    BackgroundColor? bgColor,
    Uint8List? bgImageBytes,
  }) {
    return PageData(
      id: id,
      strokes: strokes ?? this.strokes,
      template: template ?? this.template,
      bgColor: bgColor ?? this.bgColor,
      bgImageBytes: bgImageBytes ?? this.bgImageBytes,
    );
  }

  Color get backgroundColor {
    switch (bgColor) {
      case BackgroundColor.white:
        return Colors.white;
      case BackgroundColor.lightBlue:
        return const Color(0xFFF0F4F8);
      case BackgroundColor.lightYellow:
        return const Color(0xFFFEF9E7);
      case BackgroundColor.dark:
        return const Color(0xFF2D2D3A);
    }
  }
}

// ─── Canvas State ───────────────────────────────────────────────────────────
class CanvasState {
  final List<PageData> pages;
  final int currentPageIndex;
  final double zoom;
  final bool isDirty;
  final List<List<Stroke>> undoHistory;
  final List<List<Stroke>> redoHistory;
  final bool showThumbnails;
  final bool isSplitScreen;
  final Color backgroundColor;

  CanvasState({
    List<PageData>? pages,
    this.currentPageIndex = 0,
    this.zoom = 1.0,
    this.isDirty = false,
    List<List<Stroke>>? undoHistory,
    List<List<Stroke>>? redoHistory,
    this.showThumbnails = false,
    this.isFullscreen = false,
    this.showGrid = false,
    this.isSplitScreen = false,
    this.backgroundColor = Colors.white,
  })  : pages = pages ?? [PageData(id: 'page_0')],
        undoHistory = undoHistory ?? [],
        redoHistory = redoHistory ?? [];

  PageData get currentPage => pages[currentPageIndex];
  int get totalPages => pages.length;
  int get currentPageNumber => currentPageIndex + 1;

  CanvasState copyWith({
    List<PageData>? pages,
    int? currentPageIndex,
    double? zoom,
    bool? isDirty,
    List<List<Stroke>>? undoHistory,
    List<List<Stroke>>? redoHistory,
    bool? showThumbnails,
    bool? isFullscreen,
    bool? showGrid,
    bool? isSplitScreen,
    Color? backgroundColor,
  }) {
    return CanvasState(
      pages: pages ?? this.pages,
      currentPageIndex: currentPageIndex ?? this.currentPageIndex,
      zoom: zoom ?? this.zoom,
      isDirty: isDirty ?? this.isDirty,
      undoHistory: undoHistory ?? this.undoHistory,
      redoHistory: redoHistory ?? this.redoHistory,
      showThumbnails: showThumbnails ?? this.showThumbnails,
      isFullscreen: isFullscreen ?? this.isFullscreen,
      showGrid: showGrid ?? this.showGrid,
      isSplitScreen: isSplitScreen ?? this.isSplitScreen,
      backgroundColor: backgroundColor ?? this.backgroundColor,
    );
  }
}

// ─── Canvas Notifier ─────────────────────────────────────────────────────────
class CanvasStateNotifier extends StateNotifier<CanvasState> {
  Timer? _autoSaveTimer;

  CanvasStateNotifier() : super(CanvasState()) {
    _startAutoSave();
  }

  void _startAutoSave() {
    _autoSaveTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (state.isDirty) save();
    });
  }

  // ── Stroke Operations ─────────────────────────────────────────────────────
  void addStroke(Stroke stroke) {
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    final oldStrokes = List<Stroke>.from(page.strokes);

    pages[state.currentPageIndex] = page.copyWith(
      strokes: [...page.strokes, stroke],
    );

    // Push to undo history, clear redo
    final undoHistory = List<List<Stroke>>.from(state.undoHistory);
    undoHistory.add(oldStrokes);
    if (undoHistory.length > 50) undoHistory.removeAt(0);

    state = state.copyWith(
      pages: pages,
      isDirty: true,
      undoHistory: undoHistory,
      redoHistory: [],
    );
  }

  void updateCurrentStroke(List<StrokePoint> newPoints) {
    if (state.pages[state.currentPageIndex].strokes.isEmpty) return;
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    final strokes = List<Stroke>.from(page.strokes);
    final last = strokes.last;
    strokes[strokes.length - 1] = Stroke(
      id: last.id,
      points: newPoints,
      color: last.color,
      thickness: last.thickness,
      opacity: last.opacity,
      type: last.type,
    );
    pages[state.currentPageIndex] = page.copyWith(strokes: strokes);
    state = state.copyWith(pages: pages);
  }

  void undo() {
    final history = List<List<Stroke>>.from(state.undoHistory);
    if (history.isEmpty) return;

    final redoHistory = List<List<Stroke>>.from(state.redoHistory);
    redoHistory.add(List<Stroke>.from(state.currentPage.strokes));

    final previousStrokes = history.removeLast();
    final pages = List<PageData>.from(state.pages);
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(
      strokes: previousStrokes,
    );

    state = state.copyWith(
      pages: pages,
      undoHistory: history,
      redoHistory: redoHistory,
      isDirty: true,
    );
  }

  void redo() {
    final redoHistory = List<List<Stroke>>.from(state.redoHistory);
    if (redoHistory.isEmpty) return;

    final undoHistory = List<List<Stroke>>.from(state.undoHistory);
    undoHistory.add(List<Stroke>.from(state.currentPage.strokes));

    final nextStrokes = redoHistory.removeLast();
    final pages = List<PageData>.from(state.pages);
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(
      strokes: nextStrokes,
    );

    state = state.copyWith(
      pages: pages,
      undoHistory: undoHistory,
      redoHistory: redoHistory,
      isDirty: true,
    );
  }

  void clearPage() {
    final pages = List<PageData>.from(state.pages);
    final undoHistory = List<List<Stroke>>.from(state.undoHistory);
    undoHistory.add(List<Stroke>.from(pages[state.currentPageIndex].strokes));

    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(strokes: []);
    state = state.copyWith(pages: pages, undoHistory: undoHistory, isDirty: true);
  }

  // ── Selection Operations ──────────────────────────────────────────────────
  void selectStrokesInRegion(Path region) {
    bool hasChanged = false;
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    final strokes = page.strokes.map((stroke) {
      if (stroke.points.isEmpty) return stroke;
      
      bool inside = false;
      // Check if any point is inside the region bounds for performance, 
      // ideally we'd use Path.contains but this is a simple approximation
      final bounds = region.getBounds();
      for (final p in stroke.points) {
        if (bounds.contains(Offset(p.x, p.y))) {
          inside = true;
          break;
        }
      }

      if (inside != stroke.isSelected) {
        hasChanged = true;
        return stroke.copyWith(isSelected: inside);
      }
      return stroke;
    }).toList();

    if (hasChanged) {
      pages[state.currentPageIndex] = page.copyWith(strokes: strokes);
      state = state.copyWith(pages: pages);
    }
  }

  void clearSelection() {
    bool hasChanged = false;
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    final strokes = page.strokes.map((stroke) {
      if (stroke.isSelected) {
        hasChanged = true;
        return stroke.copyWith(isSelected: false);
      }
      return stroke;
    }).toList();

    if (hasChanged) {
      pages[state.currentPageIndex] = page.copyWith(strokes: strokes);
      state = state.copyWith(pages: pages);
    }
  }

  void moveSelection(Offset delta) {
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    
    // Check if anything is selected
    if (!page.strokes.any((s) => s.isSelected)) return;

    final strokes = page.strokes.map((stroke) {
      if (stroke.isSelected) {
        final newPoints = stroke.points.map((p) => StrokePoint(p.x + delta.dx, p.y + delta.dy, pressure: p.pressure)).toList();
        return stroke.copyWith(points: newPoints);
      }
      return stroke;
    }).toList();

    pages[state.currentPageIndex] = page.copyWith(strokes: strokes);
    state = state.copyWith(pages: pages, isDirty: true);
  }

  void commitSelectionMove() {
     // Push to undo history
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    final undoHistory = List<List<Stroke>>.from(state.undoHistory);
    // Note: We need the *previous* state for undo, which we'd need to store before the move starts. 
    // For simplicity, we just add the current state to undo history here.
    undoHistory.add(List<Stroke>.from(page.strokes));
    state = state.copyWith(undoHistory: undoHistory);
  }

  void deleteSelection() {
    final pages = List<PageData>.from(state.pages);
    final page = pages[state.currentPageIndex];
    
    if (!page.strokes.any((s) => s.isSelected)) return;

    final undoHistory = List<List<Stroke>>.from(state.undoHistory);
    undoHistory.add(List<Stroke>.from(page.strokes));

    final strokes = page.strokes.where((s) => !s.isSelected).toList();
    pages[state.currentPageIndex] = page.copyWith(strokes: strokes);
    state = state.copyWith(pages: pages, isDirty: true, undoHistory: undoHistory);
  }

  // ── Page Operations ───────────────────────────────────────────────────────
  void addPage() {
    if (state.totalPages >= 100) return;
    final pages = List<PageData>.from(state.pages);
    pages.add(PageData(id: 'page_${DateTime.now().millisecondsSinceEpoch}'));
    state = state.copyWith(
      pages: pages,
      currentPageIndex: pages.length - 1,
    );
  }

  void removePage(int index) {
    if (state.totalPages <= 1) return;
    final pages = List<PageData>.from(state.pages);
    pages.removeAt(index);
    final newIndex = (state.currentPageIndex >= pages.length)
        ? pages.length - 1
        : state.currentPageIndex;
    state = state.copyWith(pages: pages, currentPageIndex: newIndex);
  }

  void goToPage(int index) {
    if (index < 0 || index >= state.totalPages) return;
    save();
    state = state.copyWith(currentPageIndex: index);
  }

  void nextPage() => goToPage(state.currentPageIndex + 1);
  void previousPage() => goToPage(state.currentPageIndex - 1);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  void setZoom(double zoom) {
    state = state.copyWith(zoom: zoom.clamp(0.25, 4.0));
  }

  void zoomIn() => setZoom(state.zoom + 0.25);
  void zoomOut() => setZoom(state.zoom - 0.25);
  void resetZoom() => setZoom(1.0);

  // ── Background / Grid ─────────────────────────────────────────────────────
  void setBackgroundColor(Color color) {
    state = state.copyWith(backgroundColor: color);
  }

  void setPageTemplate(PageTemplate template) {
    final pages = List<PageData>.from(state.pages);
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(template: template);
    state = state.copyWith(pages: pages);
  }

  void toggleGrid() {
    state = state.copyWith(showGrid: !state.showGrid);
  }

  void toggleThumbnails() {
    state = state.copyWith(showThumbnails: !state.showThumbnails);
  }

  void setPageBackgroundImage(Uint8List? imageBytes) {
    final pages = List<PageData>.from(state.pages);
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(bgImageBytes: imageBytes);
    state = state.copyWith(pages: pages, isDirty: true);
  }

  void addBulkPagesWithImages(List<Uint8List> images) {
    final pages = List<PageData>.from(state.pages);
    for (final bytes in images) {
      pages.add(PageData(
        id: 'page_pdf_${DateTime.now().millisecondsSinceEpoch}_${images.indexOf(bytes)}',
        bgImageBytes: bytes,
      ));
    }
    state = state.copyWith(
      pages: pages,
      currentPageIndex: pages.length - images.length, // Go to the first newly added page
      isDirty: true,
    );
  }

  void toggleFullscreen() {
    state = state.copyWith(isFullscreen: !state.isFullscreen);
  }

  void toggleSplitScreen() {
    state = state.copyWith(isSplitScreen: !state.isSplitScreen);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  void markDirty() {
    if (!state.isDirty) state = state.copyWith(isDirty: true);
  }

  void save() {
    state = state.copyWith(isDirty: false);
    // TODO: trigger cloud save API call
  }

  @override
  void dispose() {
    _autoSaveTimer?.cancel();
    super.dispose();
  }
}

final canvasStateProvider = StateNotifierProvider<CanvasStateNotifier, CanvasState>((ref) {
  return CanvasStateNotifier();
});
