import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../drawing/domain/models/drawing_tool.dart';
import '../../../../drawing/providers/tool_provider.dart';
import '../../screens/tool_settings_panel.dart';
import '../../../../subjects/math/presentation/widgets/math_toolbar.dart';
import '../../../../subjects/chemistry/presentation/widgets/chemistry_toolbar.dart';
import '../../../../subjects/physics/presentation/widgets/physics_toolbar.dart';
import '../../../../super_admin/providers/module_config_provider.dart';
import '../dialogs/pdf_import_dialog.dart';

class LeftToolbar extends ConsumerWidget {
  const LeftToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drawingState = ref.watch(drawingStateProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);
    final activeTool = drawingState.activeTool;

    return Container(
      width: 64.w,
      decoration: BoxDecoration(
        color: const Color(0xFF1E2235),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 4),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(height: 8.h),

            // Primary drawing tools
            _ToolButton(tool: ToolType.pen, icon: Icons.edit, label: 'Pen', activeTool: activeTool),
            _ToolButton(tool: ToolType.pencil, icon: Icons.create, label: 'Pencil', activeTool: activeTool),
            _ToolButton(tool: ToolType.highlighter, icon: Icons.highlight, label: 'Highlight', activeTool: activeTool),
            _ToolButton(tool: ToolType.ballpoint, icon: Icons.gesture, label: 'Ballpoint', activeTool: activeTool),

            _divider(),

            // Eraser & selection
            _ToolButton(tool: ToolType.eraser, icon: Icons.auto_fix_normal, label: 'Eraser', activeTool: activeTool),
            _ToolButton(tool: ToolType.lasso, icon: Icons.highlight_alt, label: 'Lasso', activeTool: activeTool),

            _divider(),

            // Object tools
            _ToolButton(tool: ToolType.shapes, icon: Icons.category_outlined, label: 'Shapes', activeTool: activeTool),
            _ToolButton(tool: ToolType.text, icon: Icons.text_fields, label: 'Text', activeTool: activeTool),
            _ToolButton(tool: ToolType.equation, icon: Icons.functions, label: 'Equation', activeTool: activeTool),
            _ToolButton(tool: ToolType.image, icon: Icons.image_outlined, label: 'Image', activeTool: activeTool),
            _SubjectButton(
              label: 'PDF',
              icon: Icons.picture_as_pdf_outlined,
              color: Colors.redAccent,
              onTap: () => showDialog(
                context: context,
                builder: (_) => const PdfImportDialog(),
              ),
            ),

            _divider(),

            // Laser pointer
            _ToolButton(tool: ToolType.laserPointer, icon: Icons.adjust, label: 'Laser', activeTool: activeTool, color: Colors.redAccent),

            _divider(),

            // Color swatch (current tool's color)
            _ColorSwatch(),

            _divider(),

            // ─── Subject Panels ─────────────────────────────────────────
            if (moduleConfig.mathTools)
              _SubjectButton(
                label: 'Math',
                icon: Icons.calculate_outlined,
                color: const Color(0xFF8B5CF6),
                onTap: () => showDialog(
                  context: context,
                  builder: (_) => Dialog(
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    child: SizedBox(
                      width: 400.w,
                      child: const MathToolbar(),
                    ),
                  ),
                ),
              ),
            if (moduleConfig.chemistryTools)
              _SubjectButton(
                label: 'Chem',
                icon: Icons.science_outlined,
                color: const Color(0xFF10B981),
                onTap: () => showDialog(
                  context: context,
                  builder: (_) => const ChemistryToolbar(),
                ),
              ),
            if (moduleConfig.physicsSimulations)
              _SubjectButton(
                label: 'Phys',
                icon: Icons.bolt_outlined,
                color: const Color(0xFF3B82F6),
                onTap: () => showDialog(
                  context: context,
                  builder: (_) => const PhysicsToolbar(),
                ),
              ),

            SizedBox(height: 8.h),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Divider(color: Colors.white12, height: 1, indent: 12, endIndent: 12),
      );
}

// ─── Tool Button ─────────────────────────────────────────────────────────────
class _ToolButton extends ConsumerWidget {
  final ToolType tool;
  final IconData icon;
  final String label;
  final ToolType activeTool;
  final Color? color;

  const _ToolButton({
    required this.tool,
    required this.icon,
    required this.label,
    required this.activeTool,
    this.color,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isActive = activeTool == tool;

    return GestureDetector(
      onDoubleTap: () => _showSettings(context, ref),
      child: Tooltip(
        message: '$label\n(double-tap for settings)',
        child: InkWell(
          onTap: () => ref.read(drawingStateProvider.notifier).selectTool(tool),
          borderRadius: BorderRadius.circular(8.r),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            margin: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
            padding: EdgeInsets.all(10.w),
            decoration: BoxDecoration(
              color: isActive ? AppTheme.primaryOrange.withOpacity(0.2) : Colors.transparent,
              borderRadius: BorderRadius.circular(8.r),
              border: isActive
                  ? Border.all(color: AppTheme.primaryOrange, width: 1.5)
                  : null,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  icon,
                  color: isActive ? AppTheme.primaryOrange : (color ?? Colors.white70),
                  size: 22.w,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSettings(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => ToolSettingsPanel(toolType: tool),
    );
  }
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────
class _ColorSwatch extends ConsumerWidget {

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drawingState = ref.watch(drawingStateProvider);
    final currentColor = drawingState.currentSettings.color;
    final recentColors = drawingState.recentColors;

    return GestureDetector(
      onTap: () => _showColorPicker(context, ref, currentColor),
      child: Tooltip(
        message: 'Change color',
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
          child: Column(
            children: [
              // Current color
              Container(
                width: 36.w,
                height: 36.w,
                decoration: BoxDecoration(
                  color: currentColor,
                  borderRadius: BorderRadius.circular(8.r),
                  border: Border.all(color: Colors.white30, width: 1.5),
                  boxShadow: [BoxShadow(color: currentColor.withOpacity(0.4), blurRadius: 6)],
                ),
              ),
              SizedBox(height: 6.h),
              // Recent colors row
              Wrap(
                spacing: 3,
                children: recentColors.take(4).map((c) {
                  return GestureDetector(
                    onTap: () => ref.read(drawingStateProvider.notifier).setColor(c),
                    child: Container(
                      width: 10.w,
                      height: 10.w,
                      decoration: BoxDecoration(
                        color: c,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white24, width: 0.5),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showColorPicker(BuildContext context, WidgetRef ref, Color current) {
    const presets = [
      Colors.black,
      Colors.white,
      Color(0xFF1A73E8),
      Color(0xFFF4511E),
      Color(0xFF10B981),
      Color(0xFFEF4444),
      Color(0xFF8B5CF6),
      Color(0xFFF59E0B),
      Color(0xFFEC4899),
      Color(0xFF06B6D4),
    ];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
        title: Text('Choose Color', style: TextStyle(color: Colors.white, fontSize: 14.sp)),
        content: Wrap(
          spacing: 10,
          runSpacing: 10,
          children: presets.map((c) {
            return GestureDetector(
              onTap: () {
                ref.read(drawingStateProvider.notifier).setColor(c);
                Navigator.pop(ctx);
              },
              child: Container(
                width: 36.w,
                height: 36.w,
                decoration: BoxDecoration(
                  color: c,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: c == current ? AppTheme.primaryOrange : Colors.white24,
                    width: c == current ? 3 : 1,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

// ─── Subject Panel Button ─────────────────────────────────────────────────────
class _SubjectButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _SubjectButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: '$label Tools',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8.r),
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
          padding: EdgeInsets.all(9.w),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(color: color.withOpacity(0.3), width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 20.w),
              SizedBox(height: 2.h),
              Text(label,
                  style: TextStyle(
                      color: color, fontSize: 8.sp, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
