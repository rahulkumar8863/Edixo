import 'package:flutter/material.dart';
import 'dart:math' as math;

enum Shape3DType { cube, sphere, cone, pyramid, cylinder }

class Shape3DMetadata {
  final Shape3DType type;
  final double rx;
  final double ry;
  final double rz;
  final double scale;

  Shape3DMetadata({
    required this.type,
    this.rx = 0.5,
    this.ry = 0.5,
    this.rz = 0,
    this.scale = 100.0,
  });

  factory Shape3DMetadata.fromJson(Map<String, dynamic> json) {
    return Shape3DMetadata(
      type: Shape3DType.values.firstWhere((e) => e.name == json['type'], orElse: () => Shape3DType.cube),
      rx: (json['rx'] as num?)?.toDouble() ?? 0.0,
      ry: (json['ry'] as num?)?.toDouble() ?? 0.0,
      rz: (json['rz'] as num?)?.toDouble() ?? 0.0,
      scale: (json['scale'] as num?)?.toDouble() ?? 100.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type.name,
    'rx': rx,
    'ry': ry,
    'rz': rz,
    'scale': scale,
  };
}

class Shape3DPainter extends CustomPainter {
  final Shape3DMetadata metadata;
  final Color color;
  final bool isFilled;
  final double strokeWidth;

  Shape3DPainter({
    required this.metadata,
    required this.color,
    this.isFilled = false,
    this.strokeWidth = 2.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = isFilled ? PaintingStyle.fill : PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = color.withOpacity(0.2)
      ..style = PaintingStyle.fill;

    switch (metadata.type) {
      case Shape3DType.cube:
        _drawCube(canvas, center, paint, fillPaint);
        break;
      case Shape3DType.sphere:
        _drawSphere(canvas, center, paint);
        break;
      case Shape3DType.cone:
        _drawCone(canvas, center, paint, fillPaint);
        break;
      case Shape3DType.pyramid:
        _drawPyramid(canvas, center, paint, fillPaint);
        break;
      case Shape3DType.cylinder:
        _drawCylinder(canvas, center, paint, fillPaint);
        break;
    }
  }

  Offset _project(double x, double y, double z, Offset center) {
    // Rotation around X
    double y1 = y * math.cos(metadata.rx) - z * math.sin(metadata.rx);
    double z1 = y * math.sin(metadata.rx) + z * math.cos(metadata.rx);
    
    // Rotation around Y
    double x2 = x * math.cos(metadata.ry) + z1 * math.sin(metadata.ry);
    double z2 = -x * math.sin(metadata.ry) + z1 * math.cos(metadata.ry);
    
    // Rotation around Z
    double x3 = x2 * math.cos(metadata.rz) - y1 * math.sin(metadata.rz);
    double y3 = x2 * math.sin(metadata.rz) + y1 * math.cos(metadata.rz);

    return Offset(center.dx + x3 * metadata.scale, center.dy + y3 * metadata.scale);
  }

  void _drawCube(Canvas canvas, Offset center, Paint paint, Paint fillPaint) {
    final vertices = [
      [-1.0, -1.0, -1.0], [1.0, -1.0, -1.0], [1.0, 1.0, -1.0], [-1.0, 1.0, -1.0],
      [-1.0, -1.0, 1.0], [1.0, -1.0, 1.0], [1.0, 1.0, 1.0], [-1.0, 1.0, 1.0],
    ];

    final edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    final projected = vertices.map((v) => _project(v[0], v[1], v[2], center)).toList();

    if (isFilled) {
      final faces = [
        [0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], 
        [2, 3, 7, 6], [0, 3, 7, 4], [1, 2, 6, 5]
      ];
      for (var face in faces) {
        final path = Path()
          ..moveTo(projected[face[0]].dx, projected[face[0]].dy)
          ..lineTo(projected[face[1]].dx, projected[face[1]].dy)
          ..lineTo(projected[face[2]].dx, projected[face[2]].dy)
          ..lineTo(projected[face[3]].dx, projected[face[3]].dy)
          ..close();
        canvas.drawPath(path, fillPaint);
      }
    }

    for (var edge in edges) {
      canvas.drawLine(projected[edge[0]], projected[edge[1]], paint);
    }
  }

  void _drawPyramid(Canvas canvas, Offset center, Paint paint, Paint fillPaint) {
    final vertices = [
      [0.0, -1.0, 0.0], // Top
      [-1.0, 1.0, -1.0], [1.0, 1.0, -1.0], [1.0, 1.0, 1.0], [-1.0, 1.0, 1.0], // Base
    ];

    final edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
    ];

    final projected = vertices.map((v) => _project(v[0], v[1], v[2], center)).toList();

    if (isFilled) {
      final faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [1, 2, 3, 4]
      ];
      for (var face in faces) {
        final path = Path()
          ..moveTo(projected[face[0]].dx, projected[face[0]].dy)
          ..lineTo(projected[face[1]].dx, projected[face[1]].dy)
          ..lineTo(projected[face[2]].dx, projected[face[2]].dy);
        if (face.length > 3) path.lineTo(projected[face[3]].dx, projected[face[3]].dy);
        path.close();
        canvas.drawPath(path, fillPaint);
      }
    }

    for (var edge in edges) {
      canvas.drawLine(projected[edge[0]], projected[edge[1]], paint);
    }
  }

  void _drawSphere(Canvas canvas, Offset center, Paint paint) {
    const latLines = 8;
    const lonLines = 12;

    for (int i = 0; i <= latLines; i++) {
        final lat = math.pi * i / latLines;
        final sy = math.cos(lat);
        final r = math.sin(lat);

        final path = Path();
        for (int j = 0; j <= lonLines; j++) {
            final lon = 2 * math.pi * j / lonLines;
            final sx = r * math.cos(lon);
            final sz = r * math.sin(lon);
            final p = _project(sx, sy, sz, center);
            if (j == 0) path.moveTo(p.dx, p.dy); else path.lineTo(p.dx, p.dy);
        }
        canvas.drawPath(path, paint);
    }

    for (int j = 0; j < lonLines; j++) {
        final lon = 2 * math.pi * j / lonLines;
        final path = Path();
        for (int i = 0; i <= latLines; i++) {
            final lat = math.pi * i / latLines;
            final sx = math.sin(lat) * math.cos(lon);
            final sy = math.cos(lat);
            final sz = math.sin(lat) * math.sin(lon);
            final p = _project(sx, sy, sz, center);
            if (i == 0) path.moveTo(p.dx, p.dy); else path.lineTo(p.dx, p.dy);
        }
        canvas.drawPath(path, paint);
    }
  }

  void _drawCone(Canvas canvas, Offset center, Paint paint, Paint fillPaint) {
    const segments = 16;
    final top = _project(0, -1.0, 0, center);
    final baseCenter = _project(0, 1.0, 0, center);
    
    final basePoints = List.generate(segments, (i) {
      final angle = 2 * math.pi * i / segments;
      return _project(math.cos(angle), 1.0, math.sin(angle), center);
    });

    if (isFilled) {
      final basePath = Path()
        ..moveTo(basePoints[0].dx, basePoints[0].dy);
      for (var p in basePoints) basePath.lineTo(p.dx, p.dy);
      basePath.close();
      canvas.drawPath(basePath, fillPaint);

      for (int i = 0; i < segments; i++) {
        final sidePath = Path()
          ..moveTo(top.dx, top.dy)
          ..lineTo(basePoints[i].dx, basePoints[i].dy)
          ..lineTo(basePoints[(i + 1) % segments].dx, basePoints[(i + 1) % segments].dy)
          ..close();
        canvas.drawPath(sidePath, fillPaint);
      }
    }

    for (int i = 0; i < segments; i++) {
      canvas.drawLine(top, basePoints[i], paint);
      canvas.drawLine(basePoints[i], basePoints[(i + 1) % segments], paint);
    }
  }

  void _drawCylinder(Canvas canvas, Offset center, Paint paint, Paint fillPaint) {
    const segments = 16;
    final topPoints = List.generate(segments, (i) {
      final angle = 2 * math.pi * i / segments;
      return _project(math.cos(angle), -1.0, math.sin(angle), center);
    });
    final bottomPoints = List.generate(segments, (i) {
      final angle = 2 * math.pi * i / segments;
      return _project(math.cos(angle), 1.0, math.sin(angle), center);
    });

    if (isFilled) {
       // logic omitted for brevity in first draft
    }

    for (int i = 0; i < segments; i++) {
      canvas.drawLine(topPoints[i], topPoints[(i + 1) % segments], paint);
      canvas.drawLine(bottomPoints[i], bottomPoints[(i + 1) % segments], paint);
      canvas.drawLine(topPoints[i], bottomPoints[i], paint);
    }
  }

  @override
  bool shouldRepaint(covariant Shape3DPainter oldDelegate) => true;
}
