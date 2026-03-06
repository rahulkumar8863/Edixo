import 'package:flutter/material.dart';

enum ToolType {
  pen,
  pencil,
  ballpoint,
  technicalPen,
  highlighter,
  laserPointer,
  eraser,
  lasso,
  shapes,
  text,
  equation,
  image,
  settings,
}

class DrawingTool {
  final ToolType type;
  final String label;
  final IconData icon;
  final double thickness;
  final Color color;
  final double opacity;
  final Map<String, dynamic>? settings;

  const DrawingTool({
    required this.type,
    required this.label,
    required this.icon,
    this.thickness = 2.0,
    this.color = Colors.black,
    this.opacity = 1.0,
    this.settings,
  });

  DrawingTool copyWith({
    double? thickness,
    Color? color,
    double? opacity,
    Map<String, dynamic>? settings,
  }) {
    return DrawingTool(
      type: type,
      label: label,
      icon: icon,
      thickness: thickness ?? this.thickness,
      color: color ?? this.color,
      opacity: opacity ?? this.opacity,
      settings: settings ?? this.settings,
    );
  }

  // Predefined tools
  static const DrawingTool pen = DrawingTool(
    type: ToolType.pen,
    label: 'Pen',
    icon: Icons.edit,
    thickness: 2.0,
  );

  static const DrawingTool pencil = DrawingTool(
    type: ToolType.pencil,
    label: 'Pencil',
    icon: Icons.create,
    thickness: 1.5,
  );

  static const DrawingTool highlighter = DrawingTool(
    type: ToolType.highlighter,
    label: 'Highlighter',
    icon: Icons.highlight,
    thickness: 15.0,
    color: Colors.yellow,
    opacity: 0.3,
  );

  static const DrawingTool eraser = DrawingTool(
    type: ToolType.eraser,
    label: 'Eraser',
    icon: Icons.auto_fix_normal,
    thickness: 20.0,
  );

  static const DrawingTool lasso = DrawingTool(
    type: ToolType.lasso,
    label: 'Lasso',
    icon: Icons.gesture,
  );

  static const DrawingTool shapes = DrawingTool(
    type: ToolType.shapes,
    label: 'Shapes',
    icon: Icons.category,
  );

  static const DrawingTool text = DrawingTool(
    type: ToolType.text,
    label: 'Text',
    icon: Icons.text_fields,
  );

  static const DrawingTool equation = DrawingTool(
    type: ToolType.equation,
    label: 'Equation',
    icon: Icons.functions,
  );

  static const DrawingTool image = DrawingTool(
    type: ToolType.image,
    label: 'Image',
    icon: Icons.image,
  );

  static const DrawingTool settingsTool = DrawingTool(
    type: ToolType.settings,
    label: 'Settings',
    icon: Icons.settings,
  );
}
