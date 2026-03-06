import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/whiteboard_session.dart';
import '../widgets/toolbar/top_toolbar.dart';
import '../widgets/toolbar/left_toolbar.dart';
import '../widgets/toolbar/bottom_toolbar.dart';
import '../widgets/canvas/whiteboard_canvas.dart';
import '../../../questions/presentation/widgets/panels/question_panel.dart';
import '../../../ai/presentation/widgets/panels/ai_panel.dart';
import '../../providers/whiteboard_provider.dart';
import '../../providers/canvas_provider.dart';
import '../../../super_admin/providers/module_config_provider.dart';
import '../widgets/panels/attendance_panel.dart';
import '../widgets/panels/homework_generator.dart';
import '../widgets/canvas/competition_scoreboard.dart';
import '../../../notes/domain/models/note.dart';
import '../../../auth/providers/auth_provider.dart';
import 'timer_screen.dart';
import 'spotlight_screen.dart';
import '../../services/export_service.dart';
import '../../../super_admin/presentation/screens/admin_dashboard.dart';

class WhiteboardScreen extends ConsumerStatefulWidget {
  final Note? initialNote;
  const WhiteboardScreen({super.key, this.initialNote});

  @override
  ConsumerState<WhiteboardScreen> createState() => _WhiteboardScreenState();
}

class _WhiteboardScreenState extends ConsumerState<WhiteboardScreen> {
  bool _showQuestionPanel = false;
  bool _showAIPanel = false;
  bool _showTimer = false;
  bool _showSpotlight = false;
  bool _showAttendance = false;
  bool _showHomework = false;
  bool _timerIsCountdown = true;

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);
    final isMobile = MediaQuery.of(context).size.width < 768;

    return KeyboardListener(
      focusNode: FocusNode(),
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.f11) {
            ref.read(canvasStateProvider.notifier).toggleFullscreen();
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          children: [
            // ── Main Layout ──────────────────────────────────────────────────
            Column(
              children: [
                // Top Toolbar
                if (!canvasState.isFullscreen)
                  TopToolbar(
                    sessionName: 'Untitled Session',
                    onSave: () {},
                    onTimer: () => setState(() => _showTimer = !_showTimer),
                    onShare: _showShareDialog,
                    onAI: () {
                      if (moduleConfig.aiAssistant) {
                        setState(() {
                          _showAIPanel = !_showAIPanel;
                          if (_showAIPanel) _showQuestionPanel = false;
                        });
                      }
                    },
                    onMenu: _showMainMenu,
                    onLoadQuestions: () => setState(() {
                      _showQuestionPanel = !_showQuestionPanel;
                      if (_showQuestionPanel) {
                        _showAIPanel = false; _showAttendance = false; _showHomework = false;
                      }
                    }),
                    onAttendance: () {
                      if (moduleConfig.attendance) {
                        setState(() {
                          _showAttendance = !_showAttendance;
                          if (_showAttendance) {
                            _showQuestionPanel = false; _showAIPanel = false; _showHomework = false;
                          }
                        });
                      }
                    },
                    onHomework: () {
                      if (moduleConfig.homeworkGenerator) {
                        setState(() {
                          _showHomework = !_showHomework;
                          if (_showHomework) {
                            _showQuestionPanel = false; _showAIPanel = false; _showAttendance = false;
                          }
                        });
                      }
                    },
                  ),

                // Canvas + Sidebars
                Expanded(
                  child: Row(
                    children: [
                      // Left Toolbar (desktop)
                      if (!isMobile && !canvasState.isFullscreen)
                        const LeftToolbar(),

                      // Canvas
                      Expanded(
                        child: Stack(
                          children: [
                            canvasState.isSplitScreen
                                ? _buildSplitScreenLayout()
                                : const WhiteboardCanvas(),

                            // Spotlight overlay
                            if (_showSpotlight)
                              SpotlightOverlay(
                                onClose: () => setState(() => _showSpotlight = false),
                              ),

                            // Mobile floating toolbar
                            if (isMobile) _buildMobileFloatingToolbar(),

                            // Fullscreen exit button
                            if (canvasState.isFullscreen)
                              Positioned(
                                top: 12,
                                right: 12,
                                child: FloatingActionButton.small(
                                  backgroundColor: Colors.black54,
                                  onPressed: () => ref.read(canvasStateProvider.notifier).toggleFullscreen(),
                                  child: const Icon(Icons.fullscreen_exit, color: Colors.white),
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Right Panel — Questions, AI, Attendance, or Homework
                      _buildRightPanel(isMobile),
                    ],
                  ),
                ),

                // Bottom Toolbar
                if (!canvasState.isFullscreen)
                  const BottomToolbar(),

                // Page Thumbnails
                if (canvasState.showThumbnails && !canvasState.isFullscreen)
                  _PageThumbnailStrip(),
              ],
            ),

            // ── Timer Overlay ────────────────────────────────────────────────
            if (_showTimer)
              Positioned(
                top: 70.h,
                right: 16.w,
                child: TimerWidget(
                  onClose: () => setState(() => _showTimer = false),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRightPanel(bool isMobile) {
    if (!_showQuestionPanel && !_showAIPanel && !_showAttendance && !_showHomework) {
      return const SizedBox.shrink();
    }

    if (_showAttendance) return const AttendancePanel();
    if (_showHomework) return const HomeworkGeneratorPanel();

    return Container(
      width: isMobile ? MediaQuery.of(context).size.width : 340.w,
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(left: BorderSide(color: Color(0xFFE5E7EB))),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
      ),
      child: Column(
        children: [
          // Panel toggle header
          Container(
            decoration: const BoxDecoration(color: Color(0xFFF9FAFB)),
            child: Row(
              children: [
                _panelTab('Questions', Icons.quiz_outlined, _showQuestionPanel, () {
                  setState(() { 
                    _showQuestionPanel = true; _showAIPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  });
                }),
                _panelTab('AI', Icons.auto_awesome, _showAIPanel, () {
                  setState(() { 
                    _showAIPanel = true; _showQuestionPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  });
                }),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: () => setState(() { 
                    _showQuestionPanel = false; _showAIPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  }),
                ),
              ],
            ),
          ),
          Expanded(child: _showAIPanel ? const AIPanel() : const QuestionPanel()),
        ],
      ),
    );
  }

  Widget _buildSplitScreenLayout() {
    return Stack(
      children: [
        GridView.builder(
          padding: EdgeInsets.all(8.w),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 8.w,
            mainAxisSpacing: 8.w,
            childAspectRatio: 1.5,
          ),
          itemCount: 4, // 4 panels for multi-user mode
          itemBuilder: (context, index) {
            return Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white24),
                borderRadius: BorderRadius.circular(12.r),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  const WhiteboardCanvas(),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Text(
                        'Panel ${index + 1}',
                        style: TextStyle(color: Colors.white, fontSize: 10.sp),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        // Overlaid Scoreboard
        const Align(
          alignment: Alignment.topCenter,
          child: CompetitionScoreboard(),
        ),
      ],
    );
  }

  Widget _panelTab(String label, IconData icon, bool active, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? AppTheme.primaryOrange : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? AppTheme.primaryOrange : Colors.grey),
            SizedBox(width: 6.w),
            Text(
              label,
              style: TextStyle(
                fontSize: 13.sp,
                color: active ? AppTheme.primaryOrange : Colors.grey,
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileFloatingToolbar() {
    return Positioned(
      left: 8.w,
      top: 0,
      bottom: 0,
      child: Center(
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E2235).withOpacity(0.9),
            borderRadius: BorderRadius.circular(16.r),
          ),
          child: const LeftToolbar(),
        ),
      ),
    );
  }

  void _showMainMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (ctx) => _MainMenuSheet(
        onSpotlight: () {
          Navigator.pop(ctx);
          setState(() => _showSpotlight = true);
        },
        onLogout: () {
          Navigator.pop(ctx);
          ref.read(authProvider.notifier).logout();
        },
      ),
    );
  }

  void _showShareDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: const Text('Share with Students', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Students can join your live session using this code:',
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '8 4 7 2 9 1',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 12,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('0 students connected', style: TextStyle(color: Colors.green, fontSize: 12)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.stop),
            label: const Text('Stop Sharing'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
  }
}

// ─── Page Thumbnail Strip ────────────────────────────────────────────────────
class _PageThumbnailStrip extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);

    return Container(
      height: 90.h,
      color: const Color(0xFF1A1A2E),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.all(8.w),
        itemCount: canvasState.totalPages + 1,
        itemBuilder: (ctx, i) {
          if (i == canvasState.totalPages) {
            return GestureDetector(
              onTap: () => notifier.addPage(),
              child: Container(
                width: 60.w,
                margin: EdgeInsets.only(left: 8.w),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white30, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(6.r),
                ),
                child: const Icon(Icons.add, color: Colors.white54),
              ),
            );
          }
          final isActive = i == canvasState.currentPageIndex;
          return GestureDetector(
            onTap: () => notifier.goToPage(i),
            child: Container(
              width: 60.w,
              margin: EdgeInsets.only(right: 6.w),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6.r),
                border: Border.all(
                  color: isActive ? AppTheme.primaryOrange : Colors.transparent,
                  width: 2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Spacer(),
                  Container(
                    color: const Color(0xFF1A1A2E).withOpacity(0.7),
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      '${i + 1}',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white, fontSize: 10.sp),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Main Menu Sheet ─────────────────────────────────────────────────────────
class _MainMenuSheet extends ConsumerWidget {
  final VoidCallback onSpotlight;
  final VoidCallback onLogout;

  const _MainMenuSheet({required this.onSpotlight, required this.onLogout});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          _menuItem(Icons.highlight, 'Spotlight Tool', onSpotlight, context),
          _menuItem(Icons.picture_as_pdf, 'Export as PDF', () {
            Navigator.pop(context);
            // This reads the current page of the canvas
            final canvasState = ref.read(canvasStateProvider);
            ExportService.exportPageToPdf(canvasState.currentPage);
          }, context),
          _menuItem(Icons.share, 'Share Note', () => Navigator.pop(context), context),
          _menuItem(Icons.library_books, 'Notes Library', () => Navigator.pop(context), context),
          _menuItem(Icons.admin_panel_settings, 'Super Admin Panel', () {
            Navigator.pop(context);
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SuperAdminDashboard()));
          }, context, color: Colors.blueAccent),
          const Divider(color: Colors.white24),
          _menuItem(Icons.logout, 'Logout', onLogout, context, color: Colors.red),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap, BuildContext context, {Color color = Colors.white}) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(label, style: TextStyle(color: color)),
      onTap: onTap,
    );
  }
}
