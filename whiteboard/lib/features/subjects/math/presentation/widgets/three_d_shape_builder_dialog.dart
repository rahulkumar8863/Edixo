import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../whiteboard/providers/canvas_provider.dart';
import 'shape_3d_painter.dart';
import 'dart:convert';
import 'package:uuid/uuid.dart';

class ThreeDShapeBuilderDialog extends StatefulWidget {
  const ThreeDShapeBuilderDialog({super.key});

  @override
  State<ThreeDShapeBuilderDialog> createState() => _ThreeDShapeBuilderDialogState();
}

class _ThreeDShapeBuilderDialogState extends State<ThreeDShapeBuilderDialog> {
  Shape3DType _selectedType = Shape3DType.cube;
  double _rx = 0.5;
  double _ry = 0.5;
  double _scale = 100.0;
  Color _selectedColor = AppTheme.primaryOrange;
  bool _isFilled = false;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24.r)),
      child: Container(
        width: 800.w,
        height: 600.h,
        padding: EdgeInsets.all(24.w),
        child: Row(
          children: [
            // Preview Area
            Expanded(
              flex: 2,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      _ry += details.delta.dx * 0.01;
                      _rx -= details.delta.dy * 0.01;
                    });
                  },
                  child: ClipRect(
                    child: CustomPaint(
                      painter: Shape3DPainter(
                        metadata: Shape3DMetadata(
                          type: _selectedType,
                          rx: _rx,
                          ry: _ry,
                          scale: _scale,
                        ),
                        color: _selectedColor,
                        isFilled: _isFilled,
                      ),
                      size: Size.infinite,
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 24.w),
            // Controls Area
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '3D Shape Builder',
                    style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 24.h),
                  _buildLabel('Select Shape'),
                  Wrap(
                    spacing: 8.w,
                    children: Shape3DType.values.map((type) {
                      final isSelected = _selectedType == type;
                      return ChoiceChip(
                        label: Text(type.name.toUpperCase()),
                        selected: isSelected,
                        onSelected: (val) => setState(() => _selectedType = type),
                        selectedColor: AppTheme.primaryOrange.withOpacity(0.2),
                        labelStyle: TextStyle(
                          color: isSelected ? AppTheme.primaryOrange : Colors.grey,
                          fontSize: 10.sp,
                        ),
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 24.h),
                  _buildLabel('Size'),
                  Slider(
                    value: _scale,
                    min: 50.0,
                    max: 200.0,
                    activeColor: AppTheme.primaryOrange,
                    onChanged: (val) => setState(() => _scale = val),
                  ),
                  SizedBox(height: 16.h),
                  Row(
                    children: [
                      _buildLabel('Filled Appearance'),
                      const Spacer(),
                      Switch(
                        value: _isFilled,
                        activeColor: AppTheme.primaryOrange,
                        onChanged: (val) => setState(() => _isFilled = val),
                      ),
                    ],
                  ),
                  SizedBox(height: 24.h),
                  _buildLabel('Color'),
                  Wrap(
                    spacing: 8.w,
                    children: [
                      Colors.red, Colors.blue, Colors.green, Colors.orange, Colors.purple, Colors.black
                    ].map((color) {
                      final isSelected = _selectedColor == color;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedColor = color),
                        child: Container(
                          width: 32.w,
                          height: 32.w,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                            border: isSelected ? Border.all(color: Colors.white, width: 3) : null,
                            boxShadow: isSelected ? [BoxShadow(color: Colors.black26, blurRadius: 4)] : null,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const Spacer(),
                  Consumer(builder: (context, ref, child) {
                    return SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryOrange,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                        ),
                        onPressed: () {
                          final metadata = Shape3DMetadata(
                            type: _selectedType,
                            rx: _rx,
                            ry: _ry,
                            scale: _scale,
                          );
                          
                          final stroke = Stroke(
                            id: const Uuid().v4(),
                            points: [const StrokePoint(500, 500)], // Anchor point
                            color: _selectedColor,
                            type: StrokeType.threeDObject,
                            text: jsonEncode(metadata.toJson()),
                            isFilled: _isFilled,
                            thickness: 2.0,
                          );
                          
                          ref.read(canvasStateProvider.notifier).addStroke(stroke);
                          Navigator.pop(context);
                        },
                        child: const Text('Insert to Canvas'),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        text,
        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: Colors.grey.shade700),
      ),
    );
  }
}
