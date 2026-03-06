import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../../super_admin/providers/module_config_provider.dart';

class BottomToolbar extends ConsumerWidget {
  const BottomToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);
    final notifier = ref.read(canvasStateProvider.notifier);

    return Container(
      height: 48.h,
      decoration: BoxDecoration(
        color: const Color(0xFF1E2235),
        border: Border(top: BorderSide(color: Colors.white12, width: 1)),
      ),
      child: Row(
        children: [
          SizedBox(width: 12.w),

          // Add Page
          _actionBtn(
            icon: Icons.add,
            label: '+ Page',
            onTap: () => notifier.addPage(),
            tooltip: 'Add new page',
          ),

          _vDivider(),

          // Page navigation
          _navBtn(
            icon: Icons.chevron_left,
            onTap: canvasState.currentPageIndex > 0 ? () => notifier.previousPage() : null,
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.w),
            child: Text(
              '${canvasState.currentPageNumber} / ${canvasState.totalPages}',
              style: TextStyle(color: Colors.white, fontSize: 13.sp, fontWeight: FontWeight.w600),
            ),
          ),
          _navBtn(
            icon: Icons.chevron_right,
            onTap: canvasState.currentPageIndex < canvasState.totalPages - 1
                ? () => notifier.nextPage()
                : null,
          ),

          _vDivider(),

          // Thumbnails Toggle
          _actionBtn(
            icon: Icons.view_module_outlined,
            label: 'Pages',
            onTap: () => notifier.toggleThumbnails(),
            tooltip: 'Show page thumbnails',
            active: canvasState.showThumbnails,
          ),

          _vDivider(),

          // Undo / Redo
          _navBtn(
            icon: Icons.undo,
            onTap: canvasState.undoHistory.isNotEmpty ? () => notifier.undo() : null,
            tooltip: 'Undo (Ctrl+Z)',
          ),
          _navBtn(
            icon: Icons.redo,
            onTap: canvasState.redoHistory.isNotEmpty ? () => notifier.redo() : null,
            tooltip: 'Redo (Ctrl+Y)',
          ),

          _vDivider(),

          // Clear page
          _actionBtn(
            icon: Icons.clear,
            label: 'Clear',
            onTap: () => _confirmClear(context, ref),
            tooltip: 'Clear current page',
          ),

          const Spacer(),

          // Page templates
          _TemplateSelector(),

          _vDivider(),

          // Zoom controls
          _navBtn(icon: Icons.remove, onTap: () => notifier.zoomOut(), tooltip: 'Zoom out'),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 6.w),
            child: GestureDetector(
              onTap: () => notifier.resetZoom(),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4.r),
                ),
                child: Text(
                  '${(canvasState.zoom * 100).toInt()}%',
                  style: TextStyle(color: Colors.white, fontSize: 12.sp),
                ),
              ),
            ),
          ),
          _navBtn(icon: Icons.add, onTap: () => notifier.zoomIn(), tooltip: 'Zoom in'),

          _vDivider(),

          // Split-Screen
          if (moduleConfig.splitScreen) ...[
            _navBtn(
              icon: Icons.splitscreen,
              onTap: () => notifier.toggleSplitScreen(),
              tooltip: 'Split-Screen Mode',
              active: canvasState.isSplitScreen,
            ),
            _vDivider(),
          ],

          // Fullscreen
          _navBtn(
            icon: canvasState.isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
            onTap: () => notifier.toggleFullscreen(),
            tooltip: 'Fullscreen (F11)',
          ),
          SizedBox(width: 8.w),
        ],
      ),
    );
  }

  Widget _vDivider() => Container(
        width: 1,
        height: 32,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        color: Colors.white12,
      );

  Widget _actionBtn({
    required IconData icon,
    required VoidCallback? onTap,
    String? label,
    String? tooltip,
    bool active = false,
  }) {
    final btn = InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: active ? AppTheme.primaryOrange.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: active ? Border.all(color: AppTheme.primaryOrange.withOpacity(0.5)) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: active ? AppTheme.primaryOrange : Colors.white70, size: 18),
            if (label != null) ...[
              const SizedBox(width: 4),
              Text(label,
                  style: TextStyle(
                      color: active ? AppTheme.primaryOrange : Colors.white70, fontSize: 12)),
            ],
          ],
        ),
      ),
    );
    if (tooltip != null) return Tooltip(message: tooltip, child: btn);
    return btn;
  }

  Widget _navBtn({required IconData icon, VoidCallback? onTap, String? tooltip, bool active = false}) {
    final btn = IconButton(
      icon: Icon(icon, color: active ? AppTheme.primaryOrange : (onTap != null ? Colors.white70 : Colors.white24), size: 20),
      onPressed: onTap,
      visualDensity: VisualDensity.compact,
    );
    if (tooltip != null) return Tooltip(message: tooltip, child: btn);
    return btn;
  }

  void _confirmClear(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: const Text('Clear Page?', style: TextStyle(color: Colors.white)),
        content: const Text('All strokes on this page will be removed.',
            style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear'),
            onPressed: () {
              ref.read(canvasStateProvider.notifier).clearPage();
              Navigator.pop(ctx);
            },
          ),
        ],
      ),
    );
  }
}

// ─── Template Selector ────────────────────────────────────────────────────────
class _TemplateSelector extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final template = ref.watch(canvasStateProvider).currentPage.template;
    final templates = {
      PageTemplate.blank: 'Blank',
      PageTemplate.ruled: 'Ruled',
      PageTemplate.grid: 'Grid',
      PageTemplate.dotGrid: 'Dot',
      PageTemplate.mathGrid: 'Math',
    };

    return Tooltip(
      message: 'Page template',
      child: PopupMenuButton<PageTemplate>(
        color: const Color(0xFF2D2D3A),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.grid_on_outlined, color: Colors.white70, size: 16),
              SizedBox(width: 4.w),
              Text(templates[template] ?? 'Blank',
                  style: TextStyle(color: Colors.white70, fontSize: 12)),
              Icon(Icons.arrow_drop_up, color: Colors.white54, size: 16),
            ],
          ),
        ),
        onSelected: (t) => ref.read(canvasStateProvider.notifier).setPageTemplate(t),
        itemBuilder: (ctx) => templates.entries
            .map((e) => PopupMenuItem(
                  value: e.key,
                  child: Text(e.value,
                      style: TextStyle(
                          color: e.key == template ? AppTheme.primaryOrange : Colors.white)),
                ))
            .toList(),
      ),
    );
  }
}
