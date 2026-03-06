import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/drawing_tool.dart';
import '../../whiteboard/providers/canvas_provider.dart';

// ─── Tool Settings ───────────────────────────────────────────────────────────
class ToolSettings {
  final double thickness;
  final double opacity;
  final Color color;
  final StrokeType? shapeType;
  final bool isFilled;

  const ToolSettings({
    this.thickness = 2.0,
    this.opacity = 1.0,
    this.color = Colors.black,
    this.shapeType,
    this.isFilled = false,
  });

  ToolSettings copyWith({double? thickness, double? opacity, Color? color, StrokeType? shapeType, bool? isFilled}) {
    return ToolSettings(
      thickness: thickness ?? this.thickness,
      opacity: opacity ?? this.opacity,
      color: color ?? this.color,
      shapeType: shapeType ?? this.shapeType,
      isFilled: isFilled ?? this.isFilled,
    );
  }
}

// ─── Default settings per tool ──────────────────────────────────────────────
const _defaultSettings = {
  ToolType.pen: ToolSettings(thickness: 2.5, opacity: 1.0, color: Colors.black),
  ToolType.pencil: ToolSettings(thickness: 2.0, opacity: 0.85, color: Colors.black),
  ToolType.ballpoint: ToolSettings(thickness: 1.5, opacity: 1.0, color: Colors.black),
  ToolType.technicalPen: ToolSettings(thickness: 1.0, opacity: 1.0, color: Colors.black),
  ToolType.highlighter: ToolSettings(thickness: 16.0, opacity: 0.4, color: Color(0xFFFFEB3B)),
  ToolType.eraser: ToolSettings(thickness: 20.0, opacity: 1.0, color: Colors.white),
  ToolType.laserPointer: ToolSettings(thickness: 6.0, opacity: 1.0, color: Colors.red),
  ToolType.lasso: ToolSettings(thickness: 1.5, opacity: 0.7, color: Colors.blue),
  ToolType.shapes: ToolSettings(thickness: 2.0, opacity: 1.0, color: Colors.black, shapeType: StrokeType.rectangle, isFilled: false),
  ToolType.text: ToolSettings(thickness: 14.0, opacity: 1.0, color: Colors.black),
};

// ─── Drawing State ───────────────────────────────────────────────────────────
class DrawingState {
  final ToolType activeTool;
  final Map<ToolType, ToolSettings> toolSettings;
  final List<Color> recentColors;

  DrawingState({
    this.activeTool = ToolType.pen,
    Map<ToolType, ToolSettings>? toolSettings,
    List<Color>? recentColors,
  }) : toolSettings = toolSettings ?? Map.from(_defaultSettings),
       recentColors = recentColors ?? [Colors.black, Colors.red, Colors.blue, Color(0xFF1A73E8), Colors.green];

  ToolSettings get currentSettings => toolSettings[activeTool] ?? const ToolSettings();

  DrawingState copyWith({
    ToolType? activeTool,
    Map<ToolType, ToolSettings>? toolSettings,
    List<Color>? recentColors,
  }) {
    return DrawingState(
      activeTool: activeTool ?? this.activeTool,
      toolSettings: toolSettings ?? this.toolSettings,
      recentColors: recentColors ?? this.recentColors,
    );
  }
}

// ─── Drawing Notifier ────────────────────────────────────────────────────────
class DrawingStateNotifier extends StateNotifier<DrawingState> {
  DrawingStateNotifier() : super(DrawingState());

  void selectTool(ToolType tool) {
    state = state.copyWith(activeTool: tool);
  }

  void setColor(Color color) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(color: color);

    // Update recent colors
    final recent = List<Color>.from(state.recentColors);
    recent.remove(color);
    recent.insert(0, color);
    if (recent.length > 8) recent.removeLast();

    state = state.copyWith(toolSettings: toolSettings, recentColors: recent);
  }

  void setThickness(double thickness) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(thickness: thickness);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setOpacity(double opacity) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(opacity: opacity);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setShapeType(StrokeType shapeType) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(shapeType: shapeType);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setShapeFilled(bool isFilled) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(isFilled: isFilled);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void resetCurrentTool() {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    toolSettings[state.activeTool] = _defaultSettings[state.activeTool] ?? const ToolSettings();
    state = state.copyWith(toolSettings: toolSettings);
  }
}

final drawingStateProvider = StateNotifierProvider<DrawingStateNotifier, DrawingState>((ref) {
  return DrawingStateNotifier();
});

// Legacy compat providers
final currentToolProvider = Provider<ToolType>((ref) => ref.watch(drawingStateProvider).activeTool);
final toolSettingsProvider = Provider<Map<ToolType, ToolSettings>>((ref) => ref.watch(drawingStateProvider).toolSettings);
