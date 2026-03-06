import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';

class OTPInputField extends StatefulWidget {
  final int length;
  final bool obscureText;
  final bool isPassword;
  final Function(List<String>) onChanged;
  final bool hasError;
  final Widget? suffix;

  const OTPInputField({
    super.key,
    required this.length,
    this.obscureText = false,
    this.isPassword = false,
    required this.onChanged,
    this.hasError = false,
    this.suffix,
  });

  bool get _hideText => obscureText || isPassword;

  @override
  State<OTPInputField> createState() => _OTPInputFieldState();
}

class _OTPInputFieldState extends State<OTPInputField> {
  final List<TextEditingController> _controllers = [];
  final List<FocusNode> _focusNodes = [];
  final List<String> _values = [];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.length; i++) {
      _controllers.add(TextEditingController());
      _focusNodes.add(FocusNode());
      _values.add('');
    }
  }

  void _onChanged(int index, String value) {
    if (value.length > 1) {
      // Handle paste
      final pasted = value.substring(0, widget.length - index);
      for (int i = 0; i < pasted.length && (index + i) < widget.length; i++) {
        _controllers[index + i].text = pasted[i];
        _values[index + i] = pasted[i];
      }
      widget.onChanged(_values);
      
      // Focus last filled or next empty
      final lastIndex = (index + pasted.length - 1).clamp(0, widget.length - 1);
      if (lastIndex < widget.length - 1) {
        _focusNodes[lastIndex + 1].requestFocus();
      } else {
        _focusNodes[lastIndex].unfocus();
      }
      return;
    }

    if (value.isNotEmpty) {
      _values[index] = value;
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      }
    } else {
      _values[index] = '';
    }
    widget.onChanged(_values);
  }

  void _onKey(int index, RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (event.logicalKey == LogicalKeyboardKey.backspace) {
        if (_controllers[index].text.isEmpty && index > 0) {
          _focusNodes[index - 1].requestFocus();
          _controllers[index - 1].clear();
          _values[index - 1] = '';
          widget.onChanged(_values);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ...List.generate(widget.length, (index) {
          return Container(
            width: 48.w,
            height: 56.h,
            margin: EdgeInsets.only(right: index < widget.length - 1 ? 8.w : 0),
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(1),
              ],
              obscureText: widget._hideText,
              style: TextStyle(
                fontSize: 24.sp,
                fontWeight: FontWeight.bold,
                color: widget.hasError ? AppTheme.errorRed : AppTheme.primaryDark,
              ),
              decoration: InputDecoration(
                filled: true,
                fillColor: widget.hasError 
                    ? AppTheme.errorRed.withOpacity(0.1) 
                    : Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: BorderSide(
                    color: widget.hasError ? AppTheme.errorRed : AppTheme.primaryOrange,
                    width: 2,
                  ),
                ),
                contentPadding: EdgeInsets.zero,
              ),
              onChanged: (v) => _onChanged(index, v),
            ),
          );
        }),
        if (widget.suffix != null) ...[
          SizedBox(width: 12.w),
          widget.suffix!,
        ],
      ],
    );
  }

  @override
  void dispose() {
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }
}
