import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';

class SpotlightOverlay extends StatefulWidget {
  final VoidCallback onClose;

  const SpotlightOverlay({super.key, required this.onClose});

  @override
  State<SpotlightOverlay> createState() => _SpotlightOverlayState();
}

class _SpotlightOverlayState extends State<SpotlightOverlay>
    with SingleTickerProviderStateMixin {
  Offset _center = const Offset(400, 300);
  double _radius = 120;
  double _dimOpacity = 0.7;
  bool _isCircle = true;
  bool _locked = false;

  late AnimationController _anim;
  late Animation<double> _fadeIn;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 200));
    _fadeIn = Tween(begin: 0.0, end: 1.0).animate(_anim);
    _anim.forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    // Initialize center
    if (_center == const Offset(400, 300)) {
      _center = Offset(size.width / 2, size.height / 2);
    }

    return FadeTransition(
      opacity: _fadeIn,
      child: Stack(
        children: [
          // Dim overlay with hole
          GestureDetector(
            onTapDown: _locked ? null : (d) => setState(() => _center = d.localPosition),
            onPanUpdate: _locked
                ? null
                : (d) => setState(() => _center += d.delta),
            child: CustomPaint(
              size: Size(size.width, size.height),
              painter: _SpotlightPainter(
                center: _center,
                radius: _radius,
                dimOpacity: _dimOpacity,
                isCircle: _isCircle,
              ),
            ),
          ),

          // Controls panel (top center)
          Positioned(
            top: 12,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(24.r),
                ),
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Spotlight icon
                    Icon(Icons.highlight, color: Colors.white, size: 16.w),
                    SizedBox(width: 8.w),
                    Text('Spotlight', style: TextStyle(color: Colors.white, fontSize: 13.sp)),
                    SizedBox(width: 12.w),

                    // Shape toggle
                    _ctrlChip(
                      label: _isCircle ? 'Circle' : 'Rectangle',
                      icon: _isCircle ? Icons.circle_outlined : Icons.crop_square,
                      onTap: () => setState(() => _isCircle = !_isCircle),
                    ),
                    SizedBox(width: 8.w),

                    // Lock toggle
                    _ctrlChip(
                      label: _locked ? 'Locked' : 'Unlock',
                      icon: _locked ? Icons.lock : Icons.lock_open,
                      onTap: () => setState(() => _locked = !_locked),
                      active: _locked,
                    ),
                    SizedBox(width: 8.w),

                    // Dim level slider
                    Icon(Icons.brightness_4, color: Colors.white70, size: 14.w),
                    SizedBox(
                      width: 80.w,
                      child: Slider(
                        value: _dimOpacity,
                        min: 0.3,
                        max: 0.95,
                        activeColor: AppTheme.primaryOrange,
                        onChanged: (v) => setState(() => _dimOpacity = v),
                      ),
                    ),

                    // Size slider
                    Icon(Icons.zoom_out_map, color: Colors.white70, size: 14.w),
                    SizedBox(
                      width: 80.w,
                      child: Slider(
                        value: _radius,
                        min: 40,
                        max: 300,
                        activeColor: AppTheme.accentBlue,
                        onChanged: (v) => setState(() => _radius = v),
                      ),
                    ),

                    SizedBox(width: 8.w),
                    // Close
                    GestureDetector(
                      onTap: widget.onClose,
                      child: Container(
                        padding: EdgeInsets.all(6.w),
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(20.r),
                        ),
                        child: Icon(Icons.close, color: Colors.white, size: 14.w),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Resize handle
          Positioned(
            left: _center.dx + _radius * 0.7 - 10,
            top: _center.dy - 10,
            child: GestureDetector(
              onPanUpdate: (d) => setState(() {
                _radius = (_radius + d.delta.dx).clamp(40, 350);
              }),
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.primaryOrange, width: 2),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _ctrlChip({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
    bool active = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
        decoration: BoxDecoration(
          color: active ? AppTheme.primaryOrange.withOpacity(0.3) : Colors.white12,
          borderRadius: BorderRadius.circular(12.r),
          border: active ? Border.all(color: AppTheme.primaryOrange) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: Colors.white),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

// ─── Spotlight Painter ───────────────────────────────────────────────────────
class _SpotlightPainter extends CustomPainter {
  final Offset center;
  final double radius;
  final double dimOpacity;
  final bool isCircle;

  _SpotlightPainter({
    required this.center,
    required this.radius,
    required this.dimOpacity,
    required this.isCircle,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    if (isCircle) {
      path.addOval(Rect.fromCircle(center: center, radius: radius));
    } else {
      path.addRect(Rect.fromCenter(
        center: center,
        width: radius * 2.5,
        height: radius * 1.5,
      ));
    }

    path.fillType = PathFillType.evenOdd;

    final paint = Paint()..color = Colors.black.withOpacity(dimOpacity);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _SpotlightPainter old) =>
      center != old.center ||
      radius != old.radius ||
      dimOpacity != old.dimOpacity ||
      isCircle != old.isCircle;
}
