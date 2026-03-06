import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import 'dart:async';

class TimerWidget extends ConsumerStatefulWidget {
  final VoidCallback onClose;

  const TimerWidget({super.key, required this.onClose});

  @override
  ConsumerState<TimerWidget> createState() => _TimerWidgetState();
}

class _TimerWidgetState extends ConsumerState<TimerWidget> {
  bool _isCountdown = true;
  bool _isRunning = false;
  int _seconds = 0;
  int _totalSeconds = 5 * 60; // 5 min default
  Timer? _timer;
  Offset _position = const Offset(16, 16);

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _start() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        if (_isCountdown) {
          if (_seconds > 0) {
            _seconds--;
          } else {
            _timer?.cancel();
            _isRunning = false;
          }
        } else {
          _seconds++;
        }
      });
    });
    setState(() => _isRunning = true);
  }

  void _pause() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _reset() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      _seconds = _isCountdown ? _totalSeconds : 0;
    });
  }

  Color get _timerColor {
    if (!_isCountdown) return AppTheme.accentBlue;
    final ratio = _totalSeconds > 0 ? _seconds / _totalSeconds : 0;
    if (ratio > 0.5) return AppTheme.successGreen;
    if (ratio > 0.2) return const Color(0xFFF59E0B);
    return AppTheme.errorRed;
  }

  String get _timeDisplay {
    final mins = (_seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (_seconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  void _showSetTimer(BuildContext context) {
    final controller = TextEditingController(text: (_totalSeconds ~/ 60).toString());
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: const Text('Set Timer (minutes)', style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Minutes',
            hintStyle: TextStyle(color: Colors.white54),
            filled: true,
            fillColor: Colors.white12,
            border: OutlineInputBorder(borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final val = int.tryParse(controller.text) ?? 5;
              setState(() {
                _totalSeconds = val * 60;
                _seconds = val * 60;
                _isRunning = false;
              });
              _timer?.cancel();
              Navigator.pop(ctx);
            },
            child: const Text('Set'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: GestureDetector(
        onPanUpdate: (d) => setState(() => _position += d.delta),
        child: Material(
          color: Colors.transparent,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1E2235),
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: _timerColor.withOpacity(0.5), width: 2),
              boxShadow: [
                BoxShadow(
                  color: _timerColor.withOpacity(0.3),
                  blurRadius: 16,
                ),
              ],
            ),
            padding: EdgeInsets.all(16.w),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Row(
                  children: [
                    Icon(Icons.timer, color: _timerColor, size: 18.w),
                    SizedBox(width: 6.w),
                    Text(
                      _isCountdown ? 'Countdown' : 'Stopwatch',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.sp),
                    ),
                    const SizedBox(width: 12),
                    // Toggle
                    GestureDetector(
                      onTap: () {
                        _pause();
                        setState(() {
                          _isCountdown = !_isCountdown;
                          _seconds = _isCountdown ? _totalSeconds : 0;
                        });
                      },
                      child: Icon(Icons.swap_horiz, color: Colors.white54, size: 18.w),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: widget.onClose,
                      child: Icon(Icons.close, color: Colors.white54, size: 16.w),
                    ),
                  ],
                ),
                SizedBox(height: 12.h),

                // Timer Display
                GestureDetector(
                  onTap: _isCountdown ? () => _showSetTimer(context) : null,
                  child: Text(
                    _timeDisplay,
                    style: TextStyle(
                      color: _timerColor,
                      fontSize: 40.sp,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),

                SizedBox(height: 12.h),

                // Progress bar (countdown only)
                if (_isCountdown && _totalSeconds > 0)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4.r),
                    child: LinearProgressIndicator(
                      value: _seconds / _totalSeconds,
                      backgroundColor: Colors.white12,
                      valueColor: AlwaysStoppedAnimation<Color>(_timerColor),
                      minHeight: 6,
                    ),
                  ),

                SizedBox(height: 12.h),

                // Controls
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _ctrlBtn(Icons.replay, _reset, Colors.white70),
                    SizedBox(width: 12.w),
                    _ctrlBtn(
                      _isRunning ? Icons.pause : Icons.play_arrow,
                      _isRunning ? _pause : _start,
                      AppTheme.primaryOrange,
                      large: true,
                    ),
                    if (_isCountdown) ...[
                      SizedBox(width: 12.w),
                      _ctrlBtn(Icons.settings, () => _showSetTimer(context), Colors.white70),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _ctrlBtn(IconData icon, VoidCallback onTap, Color color, {bool large = false}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(50),
      child: Container(
        width: large ? 48.w : 36.w,
        height: large ? 48.w : 36.w,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: large ? color.withOpacity(0.2) : Colors.transparent,
          border: large ? Border.all(color: color, width: 2) : null,
        ),
        child: Icon(icon, color: color, size: large ? 24.w : 18.w),
      ),
    );
  }
}
