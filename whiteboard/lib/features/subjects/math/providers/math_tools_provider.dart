import 'package:flutter_riverpod/flutter_riverpod.dart';

enum MathTool {
  graph,
  fraction,
  matrix,
  numberLine,
  geometry,
  function,
  shapeBuilder,
  physicsSim,
}

final selectedMathToolProvider = StateProvider<MathTool?>((ref) => null);
final latexPreviewProvider = StateProvider<String>((ref) => '');
