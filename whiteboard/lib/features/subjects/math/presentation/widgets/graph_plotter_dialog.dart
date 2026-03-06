import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:math' as math;
import '../../../../../core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/whiteboard_provider.dart';

class GraphPlotterDialog extends ConsumerStatefulWidget {
  const GraphPlotterDialog({super.key});

  @override
  ConsumerState<GraphPlotterDialog> createState() => _GraphPlotterDialogState();
}

class _GraphPlotterDialogState extends ConsumerState<GraphPlotterDialog> {
  String _function = 'x^2';
  double _minX = -10;
  double _maxX = 10;
  double _minY = -10;
  double _maxY = 10;
  List<Offset> _points = [];

  @override
  void initState() {
    super.initState();
    _calculatePoints();
  }

  void _calculatePoints() {
    _points = [];
    final step = (_maxX - _minX) / 200;
    
    for (double x = _minX; x <= _maxX; x += step) {
      final y = _evaluateFunction(x);
      if (y.isFinite && y >= _minY && y <= _maxY) {
        _points.add(Offset(x, y));
      }
    }
    setState(() {});
  }

  double _evaluateFunction(double x) {
    // Simple evaluation for demo - replace with proper math parser
    try {
      if (_function == 'x^2') return x * x;
      if (_function == 'x^3') return x * x * x;
      if (_function == 'sin(x)') return math.sin(x);
      if (_function == 'cos(x)') return math.cos(x);
      if (_function == 'sqrt(x)') return x >= 0 ? math.sqrt(x) : double.nan;
      if (_function == '1/x') return x != 0 ? 1 / x : double.nan;
      if (_function == 'e^x') return math.exp(x);
      if (_function == 'ln(x)') return x > 0 ? math.log(x) : double.nan;
      return x * x; // default
    } catch (e) {
      return double.nan;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Container(
        width: 600.w,
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Graph Plotter',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 24.h),
            
            // Function Input
            TextField(
              decoration: InputDecoration(
                labelText: 'Function f(x)',
                hintText: 'e.g., x^2, sin(x), e^x',
                prefixIcon: const Icon(Icons.functions),
              ),
              onChanged: (v) => setState(() => _function = v),
              controller: TextEditingController(text: _function),
            ),
            
            SizedBox(height: 16.h),
            
            // Range Controls
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      labelText: 'Min X',
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => setState(() => _minX = double.tryParse(v) ?? -10),
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      labelText: 'Max X',
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => setState(() => _maxX = double.tryParse(v) ?? 10),
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 16.h),
            
            // Graph Preview
            Container(
              height: 300.h,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: CustomPaint(
                size: Size.infinite,
                painter: GraphPainter(
                  points: _points,
                  minX: _minX,
                  maxX: _maxX,
                  minY: _minY,
                  maxY: _maxY,
                ),
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // Quick Functions
            Wrap(
              spacing: 8.w,
              children: [
                'x^2', 'x^3', 'sin(x)', 'cos(x)', 
                'sqrt(x)', '1/x', 'e^x', 'ln(x)'
              ].map((f) {
                return ActionChip(
                  label: Text(f),
                  onPressed: () {
                    setState(() => _function = f);
                    _calculatePoints();
                  },
                );
              }).toList(),
            ),
            
            SizedBox(height: 24.h),
            
            // Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Insert graph to canvas
                      ref.read(whiteboardContentProvider.notifier).addGraph(
                        function: _function,
                        points: _points,
                        bounds: Rect.fromLTRB(_minX, _minY, _maxX, _maxY),
                      );
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Insert to Canvas'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class GraphPainter extends CustomPainter {
  final List<Offset> points;
  final double minX, maxX, minY, maxY;

  GraphPainter({
    required this.points,
    required this.minX,
    required this.maxX,
    required this.minY,
    required this.maxY,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final axisPaint = Paint()
      ..color = Colors.grey.shade400
      ..strokeWidth = 1;

    final gridPaint = Paint()
      ..color = Colors.grey.shade200
      ..strokeWidth = 0.5;

    // Draw grid
    for (int i = minX.toInt(); i <= maxX.toInt(); i++) {
      final x = _mapX(i.toDouble(), size);
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        gridPaint,
      );
    }
    for (int i = minY.toInt(); i <= maxY.toInt(); i++) {
      final y = _mapY(i.toDouble(), size);
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        gridPaint,
      );
    }

    // Draw axes
    final zeroX = _mapX(0, size);
    final zeroY = _mapY(0, size);
    canvas.drawLine(Offset(zeroX, 0), Offset(zeroX, size.height), axisPaint);
    canvas.drawLine(Offset(0, zeroY), Offset(size.width, zeroY), axisPaint);

    // Draw function
    if (points.length > 1) {
      final path = Path();
      bool first = true;
      for (final point in points) {
        final x = _mapX(point.dx, size);
        final y = _mapY(point.dy, size);
        if (first) {
          path.moveTo(x, y);
          first = false;
        } else {
          path.lineTo(x, y);
        }
      }
      canvas.drawPath(path, paint);
    }
  }

  double _mapX(double x, Size size) {
    return (x - minX) / (maxX - minX) * size.width;
  }

  double _mapY(double y, Size size) {
    return size.height - (y - minY) / (maxY - minY) * size.height;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
