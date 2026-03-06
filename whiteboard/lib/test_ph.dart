import 'package:flutter/material.dart';
import 'package:perfect_freehand/perfect_freehand.dart';

void main() {
  List<PointVector> points = [PointVector(0, 0, 0.5), PointVector(10, 10, 0.5)];
  List<Offset> outline = getStroke(
    points,
    options: StrokeOptions(
      size: 5.0,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
      isComplete: false,
    ),
  );
  print(outline.length);
}
