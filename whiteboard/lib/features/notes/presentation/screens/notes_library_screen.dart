import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/note.dart';
import '../../providers/notes_provider.dart';
import '../../../whiteboard/presentation/screens/whiteboard_screen.dart';

enum ViewMode { grid, list }

class NotesLibraryScreen extends ConsumerStatefulWidget {
  const NotesLibraryScreen({super.key});

  @override
  ConsumerState<NotesLibraryScreen> createState() => _NotesLibraryScreenState();
}

class _NotesLibraryScreenState extends ConsumerState<NotesLibraryScreen> {
  String _searchQuery = '';
  String _selectedFilter = 'all'; // all, today, week, month
  ViewMode _viewMode = ViewMode.grid;

  @override
  Widget build(BuildContext context) {
    final notesAsync = ref.watch(filteredNotesProvider(
      FilterArgs(search: _searchQuery, filter: _selectedFilter),
    ));

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Notes'),
        actions: [
          IconButton(
            icon: Icon(_viewMode == ViewMode.grid 
                ? Icons.view_list 
                : Icons.grid_view),
            onPressed: () {
              setState(() {
                _viewMode = _viewMode == ViewMode.grid 
                    ? ViewMode.list 
                    : ViewMode.grid;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: _showSortOptions,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Bar
          Container(
            padding: EdgeInsets.all(16.w),
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search notes...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () => setState(() => _searchQuery = ''),
                          )
                        : null,
                  ),
                  onChanged: (v) => setState(() => _searchQuery = v),
                ),
                SizedBox(height: 12.h),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All', 'all'),
                      _buildFilterChip('Today', 'today'),
                      _buildFilterChip('This Week', 'week'),
                      _buildFilterChip('This Month', 'month'),
                      _buildFilterChip('With Sets', 'sets'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Notes Grid/List
          Expanded(
            child: notesAsync.when(
              data: (notes) {
                if (notes.isEmpty) {
                  return _buildEmptyState();
                }
                return _viewMode == ViewMode.grid
                    ? _buildGridView(notes)
                    : _buildListView(notes);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createNewNote(),
        icon: const Icon(Icons.add),
        label: const Text('New Note'),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return Padding(
      padding: EdgeInsets.only(right: 8.w),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedFilter = value);
        },
        selectedColor: AppTheme.primaryOrange.withOpacity(0.2),
        checkmarkColor: AppTheme.primaryOrange,
      ),
    );
  }

  Widget _buildGridView(List<Note> notes) {
    return GridView.builder(
      padding: EdgeInsets.all(16.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16.w,
        mainAxisSpacing: 16.h,
      ),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        return NoteCard(
          note: notes[index],
          onTap: () => _openNote(notes[index]),
          onShare: () => _shareNote(notes[index]),
          onDelete: () => _deleteNote(notes[index]),
        );
      },
    );
  }

  Widget _buildListView(List<Note> notes) {
    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        final note = notes[index];
        return Card(
          margin: EdgeInsets.only(bottom: 12.h),
          child: ListTile(
            leading: Container(
              width: 60.w,
              height: 60.w,
              decoration: BoxDecoration(
                color: AppTheme.canvasBlue,
                borderRadius: BorderRadius.circular(8.r),
                image: note.thumbnailUrl != null
                    ? DecorationImage(
                        image: NetworkImage(note.thumbnailUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: note.thumbnailUrl == null
                  ? const Icon(Icons.note_alt_outlined)
                  : null,
            ),
            title: Text(note.title),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${note.pageCount} pages • ${note.subject}',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12.sp,
                  ),
                ),
                Text(
                  'Modified: ${DateFormat('MMM d, y').format(note.updatedAt)}',
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 11.sp,
                  ),
                ),
              ],
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'share':
                    _shareNote(note);
                    break;
                  case 'rename':
                    _renameNote(note);
                    break;
                  case 'export':
                    _exportNote(note);
                    break;
                  case 'delete':
                    _deleteNote(note);
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'share', child: Text('Share')),
                const PopupMenuItem(value: 'rename', child: Text('Rename')),
                const PopupMenuItem(value: 'export', child: Text('Export PDF')),
                const PopupMenuItem(
                  value: 'delete',
                  child: Text('Delete', style: TextStyle(color: AppTheme.errorRed)),
                ),
              ],
            ),
            onTap: () => _openNote(note),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.note_alt_outlined,
            size: 80.w,
            color: Colors.grey.shade400,
          ),
          SizedBox(height: 16.h),
          Text(
            'No notes yet',
            style: TextStyle(
              fontSize: 20.sp,
              color: Colors.grey.shade600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Create your first note to get started',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  void _createNewNote() {
    showDialog(
      context: context,
      builder: (context) => CreateNoteDialog(
        onCreate: (title, subject) {
          ref.read(notesProvider.notifier).createNote(
            title: title,
            subject: subject,
          );
        },
      ),
    );
  }

  void _openNote(Note note) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WhiteboardScreen(initialNote: note),
      ),
    );
  }

  void _shareNote(Note note) {
    // Implement share logic
  }

  void _renameNote(Note note) {
    final controller = TextEditingController(text: note.title);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename Note'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'New name'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // save
              Navigator.pop(context);
            },
            child: const Text('Rename'),
          )
        ],
      ),
    );
  }
  
  void _exportNote(Note note) {}
  void _deleteNote(Note note) {}
  void _showSortOptions() {}
}

class NoteCard extends StatelessWidget {
  final Note note;
  final VoidCallback onTap;
  final VoidCallback onShare;
  final VoidCallback onDelete;

  const NoteCard({
    super.key,
    required this.note,
    required this.onTap,
    required this.onShare,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            Expanded(
              child: note.thumbnailUrl != null
                  ? Image.network(note.thumbnailUrl!, fit: BoxFit.cover)
                  : const Center(child: Icon(Icons.note_alt, size: 48)),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(note.title, style: Theme.of(context).textTheme.titleMedium),
            )
          ],
        ),
      ),
    );
  }
}

class CreateNoteDialog extends StatelessWidget {
  final Function(String, String) onCreate;
  const CreateNoteDialog({super.key, required this.onCreate});

  @override
  Widget build(BuildContext context) {
    final titleController = TextEditingController();
    final subjectController = TextEditingController();
    return AlertDialog(
      title: const Text('Create New Note'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
          SizedBox(height: 8.h),
          TextField(controller: subjectController, decoration: const InputDecoration(labelText: 'Subject')),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: () {
            onCreate(titleController.text, subjectController.text);
            Navigator.pop(context);
          },
          child: const Text('Create'),
        ),
      ],
    );
  }
}
