import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../../super_admin/providers/module_config_provider.dart';

// ─── Save State Provider ──────────────────────────────────────────────────────
final saveFlashProvider = StateProvider<bool>((ref) => false);

class TopToolbar extends ConsumerStatefulWidget {
  final String sessionName;
  final VoidCallback onSave;
  final VoidCallback onTimer;
  final VoidCallback onShare;
  final VoidCallback onAI;
  final VoidCallback onMenu;
  final VoidCallback onLoadQuestions;
  final VoidCallback onAttendance;
  final VoidCallback onHomework;

  const TopToolbar({
    super.key,
    required this.sessionName,
    required this.onSave,
    required this.onTimer,
    required this.onShare,
    required this.onAI,
    required this.onMenu,
    required this.onLoadQuestions,
    required this.onAttendance,
    required this.onHomework,
  });

  @override
  ConsumerState<TopToolbar> createState() => _TopToolbarState();
}

class _TopToolbarState extends ConsumerState<TopToolbar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _saveAnim;
  late final Animation<double> _saveOpacity;
  bool _editingName = false;
  late TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.sessionName);
    _saveAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _saveOpacity = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _saveAnim, curve: Curves.easeInOut));
  }

  void _triggerSaveFlash() {
    _saveAnim.forward(from: 0).then((_) => _saveAnim.reverse());
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);

    // Flash save indicator when saved
    ref.listen(canvasStateProvider, (prev, next) {
      if (prev?.isDirty == true && !next.isDirty) {
        _triggerSaveFlash();
      }
    });

    return Container(
      height: 56.h,
      decoration: BoxDecoration(
        color: AppTheme.primaryDark,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          // Menu button
          _toolbarButton(icon: Icons.menu, onTap: widget.onMenu, tooltip: 'Menu'),
          const SizedBox(width: 4),

          // EduHub logo / back
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.w),
            child: Row(
              children: [
                Container(
                  width: 28.w,
                  height: 28.w,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryOrange,
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                  child: Icon(Icons.school, color: Colors.white, size: 16.w),
                ),
                SizedBox(width: 8.w),
                Text(
                  'EduHub',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14.sp,
                  ),
                ),
              ],
            ),
          ),

          Container(width: 1, height: 32, color: Colors.white24),
          SizedBox(width: 12.w),

          // Session Name (editable)
          _editingName
              ? SizedBox(
                  width: 220.w,
                  height: 36.h,
                  child: TextField(
                    controller: _nameController,
                    autofocus: true,
                    style: TextStyle(color: Colors.white, fontSize: 14.sp),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white12,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6.r),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 0),
                    ),
                    onSubmitted: (_) => setState(() => _editingName = false),
                    onEditingComplete: () => setState(() => _editingName = false),
                  ),
                )
              : GestureDetector(
                  onTap: () => setState(() => _editingName = true),
                  child: Row(
                    children: [
                      Text(
                        _nameController.text.isEmpty ? 'Untitled Session' : _nameController.text,
                        style: TextStyle(color: Colors.white70, fontSize: 14.sp),
                      ),
                      SizedBox(width: 4.w),
                      Icon(Icons.edit, color: Colors.white30, size: 14.w),
                    ],
                  ),
                ),

          // Save indicator
          SizedBox(width: 12.w),
          FadeTransition(
            opacity: _saveOpacity,
            child: Row(
              children: [
                Icon(Icons.check_circle, color: AppTheme.successGreen, size: 16.w),
                SizedBox(width: 4.w),
                Text('Saved', style: TextStyle(color: AppTheme.successGreen, fontSize: 12.sp)),
              ],
            ),
          ),

          if (canvasState.isDirty) ...[
            SizedBox(width: 8.w),
            Container(
              width: 6.w,
              height: 6.w,
              decoration: const BoxDecoration(color: AppTheme.primaryOrange, shape: BoxShape.circle),
            ),
          ],

          const Spacer(),

          // Action buttons
          _toolbarButton(
            icon: Icons.inventory_2_outlined,
            label: 'Load Q',
            onTap: widget.onLoadQuestions,
            tooltip: 'Load Questions (Set ID)',
            color: AppTheme.primaryOrange,
          ),
          _toolbarButton(icon: Icons.timer_outlined, onTap: widget.onTimer, tooltip: 'Class Timer'),
          if (moduleConfig.attendance)
            _toolbarButton(icon: Icons.checklist_outlined, onTap: widget.onAttendance, tooltip: 'Attendance'),
          if (moduleConfig.homeworkGenerator)
            _toolbarButton(icon: Icons.assignment_outlined, onTap: widget.onHomework, tooltip: 'AI Homework'),
          _toolbarButton(icon: Icons.groups_outlined, onTap: widget.onShare, tooltip: 'Share with Students'),
          if (moduleConfig.aiAssistant)
            _toolbarButton(
              icon: Icons.auto_awesome,
              label: 'AI',
              onTap: widget.onAI,
              tooltip: 'EduHub AI Assistant',
              color: Colors.purpleAccent,
            ),
          SizedBox(width: 8.w),

          // Save button
          Padding(
            padding: EdgeInsets.only(right: 8.w),
            child: InkWell(
              onTap: () {
                ref.read(canvasStateProvider.notifier).save();
                widget.onSave();
              },
              borderRadius: BorderRadius.circular(6.r),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: canvasState.isDirty
                      ? AppTheme.primaryOrange
                      : Colors.white12,
                  borderRadius: BorderRadius.circular(6.r),
                ),
                child: Row(
                  children: [
                    Icon(Icons.save_outlined, color: Colors.white, size: 16.w),
                    SizedBox(width: 4.w),
                    Text('Save', style: TextStyle(color: Colors.white, fontSize: 13.sp)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _toolbarButton({
    required IconData icon,
    required VoidCallback onTap,
    required String tooltip,
    String? label,
    Color color = Colors.white,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6.r),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 8.h),
          child: Row(
            children: [
              Icon(icon, color: color, size: 20.w),
              if (label != null) ...[
                SizedBox(width: 4.w),
                Text(label, style: TextStyle(color: color, fontSize: 12.sp, fontWeight: FontWeight.w600)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _saveAnim.dispose();
    _nameController.dispose();
    super.dispose();
  }
}
