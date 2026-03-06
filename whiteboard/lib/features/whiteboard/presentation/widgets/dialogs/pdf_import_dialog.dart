import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/pdf_import_provider.dart';
import '../../../providers/canvas_provider.dart';

class PdfImportDialog extends ConsumerStatefulWidget {
  const PdfImportDialog({super.key});

  @override
  ConsumerState<PdfImportDialog> createState() => _PdfImportDialogState();
}

class _PdfImportDialogState extends ConsumerState<PdfImportDialog> {
  int? _selectedPage;

  @override
  Widget build(BuildContext context) {
    final pdfState = ref.watch(pdfImportProvider);
    final pdfNotifier = ref.read(pdfImportProvider.notifier);

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 600.w,
        height: 500.h,
        decoration: BoxDecoration(
          color: const Color(0xFF1E2235),
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          children: [
            _buildHeader(pdfState),
            Expanded(
              child: pdfState.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryOrange))
                  : pdfState.filePath == null
                      ? _buildEmptyState(pdfNotifier)
                      : _buildPageSelection(pdfState),
            ),
            _buildFooter(pdfState, pdfNotifier),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(PdfImportState state) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          const Icon(Icons.picture_as_pdf, color: Colors.redAccent),
          SizedBox(width: 12.w),
          Text(
            state.fileName ?? 'Import PDF',
            style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white54),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(PdfImportNotifier notifier) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.upload_file, size: 64.w, color: Colors.white24),
        SizedBox(height: 16.h),
        Text('No PDF selected', style: TextStyle(color: Colors.white54, fontSize: 14.sp)),
        SizedBox(height: 24.h),
        ElevatedButton.icon(
          onPressed: () => notifier.pickPdf(),
          icon: const Icon(Icons.add),
          label: const Text('Select PDF File'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryOrange,
            padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
          ),
        ),
      ],
    );
  }

  Widget _buildPageSelection(PdfImportState state) {
    return GridView.builder(
      padding: EdgeInsets.all(20.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16.w,
        mainAxisSpacing: 16.h,
        childAspectRatio: 0.7,
      ),
      itemCount: state.thumbnails.length,
      itemBuilder: (context, index) {
        final isSelected = _selectedPage == index + 1;
        return GestureDetector(
          onTap: () => setState(() => _selectedPage = index + 1),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.r),
              border: Border.all(
                color: isSelected ? AppTheme.primaryOrange : Colors.white10,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [BoxShadow(color: AppTheme.primaryOrange.withOpacity(0.3), blurRadius: 8)]
                  : null,
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.memory(state.thumbnails[index], fit: BoxFit.cover),
                Positioned(
                  bottom: 4,
                  right: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(4)),
                    child: Text('P${index + 1}', style: const TextStyle(color: Colors.white, fontSize: 10)),
                  ),
                ),
                if (isSelected)
                  const Center(
                    child: Icon(Icons.check_circle, color: AppTheme.primaryOrange, size: 32),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFooter(PdfImportState state, PdfImportNotifier notifier) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          SizedBox(width: 12.w),
          if (state.filePath != null)
            OutlinedButton.icon(
              onPressed: () => _importAllPages(state, notifier),
              icon: const Icon(Icons.auto_stories, size: 18),
              label: const Text('Import All Pages'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.blueAccent,
                side: const BorderSide(color: Colors.blueAccent),
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              ),
            ),
          SizedBox(width: 12.w),
          ElevatedButton(
            onPressed: _selectedPage == null ? null : () => _importPage(state, notifier),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange,
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
            ),
            child: const Text('Import Selected'),
          ),
        ],
      ),
    );
  }

  Future<void> _importPage(PdfImportState state, PdfImportNotifier notifier) async {
    if (_selectedPage == null) return;
    
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator(color: AppTheme.primaryOrange)),
    );

    final bytes = await notifier.renderPage(_selectedPage!);
    
    if (mounted) {
      Navigator.pop(context); // Close loading indicator
      if (bytes != null) {
        ref.read(canvasStateProvider.notifier).setPageBackgroundImage(bytes);
        Navigator.pop(context); // Close PDF dialog
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to render PDF page')),
        );
      }
    }
  }

  Future<void> _importAllPages(PdfImportState state, PdfImportNotifier notifier) async {
    // Show loading indicator with progress or just a simple spinner
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppTheme.primaryOrange),
            SizedBox(height: 16),
            Text('Processing all pages...', style: TextStyle(color: Colors.white, decoration: TextDecoration.none, fontSize: 14)),
          ],
        ),
      ),
    );

    final images = await notifier.renderAllPages();
    
    if (mounted) {
      Navigator.pop(context); // Close loading indicator
      if (images.isNotEmpty) {
        ref.read(canvasStateProvider.notifier).addBulkPagesWithImages(images);
        Navigator.pop(context); // Close PDF dialog
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to render PDF pages')),
        );
      }
    }
  }
}
