import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/subjects/chemistry/providers/chemistry_tools_provider.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/whiteboard_provider.dart';

class ChemistryToolbar extends ConsumerStatefulWidget {
  const ChemistryToolbar({super.key});

  @override
  ConsumerState<ChemistryToolbar> createState() => _ChemistryToolbarState();
}

class _ChemistryToolbarState extends ConsumerState<ChemistryToolbar>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E2235),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 600.w,
        height: 520.h,
        padding: EdgeInsets.all(20.w),
        child: Column(
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.science, color: const Color(0xFF10B981), size: 22.w),
                SizedBox(width: 10.w),
                Text('Chemistry Tools',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16.sp)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            SizedBox(height: 12.h),

            // Tabs
            TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFF10B981),
              labelColor: const Color(0xFF10B981),
              unselectedLabelColor: Colors.white54,
              tabs: const [
                Tab(text: 'Periodic Table'),
                Tab(text: 'Structures'),
                Tab(text: 'Equations'),
              ],
            ),
            SizedBox(height: 12.h),

            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _PeriodicTableTab(),
                  _StructuresTab(),
                  _EquationsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Periodic Table Tab ──────────────────────────────────────────────────────
class _PeriodicTableTab extends ConsumerWidget {
  final List<_Element> _elements = const [
    _Element('H', 'Hydrogen', 1, 'nonmetal', Color(0xFFECFDF5)),
    _Element('He', 'Helium', 2, 'noble', Color(0xFFF0FDF4)),
    _Element('Li', 'Lithium', 3, 'alkali', Color(0xFFFEF9C3)),
    _Element('Be', 'Beryllium', 4, 'alkaline', Color(0xFFFEF08A)),
    _Element('B', 'Boron', 5, 'metalloid', Color(0xFFE0F2FE)),
    _Element('C', 'Carbon', 6, 'nonmetal', Color(0xFFECFDF5)),
    _Element('N', 'Nitrogen', 7, 'nonmetal', Color(0xFFECFDF5)),
    _Element('O', 'Oxygen', 8, 'nonmetal', Color(0xFFECFDF5)),
    _Element('F', 'Fluorine', 9, 'halogen', Color(0xFFFCE7F3)),
    _Element('Ne', 'Neon', 10, 'noble', Color(0xFFF0FDF4)),
    _Element('Na', 'Sodium', 11, 'alkali', Color(0xFFFEF9C3)),
    _Element('Mg', 'Magnesium', 12, 'alkaline', Color(0xFFFEF08A)),
    _Element('Al', 'Aluminium', 13, 'metal', Color(0xFFE0F2FE)),
    _Element('Si', 'Silicon', 14, 'metalloid', Color(0xFFE0F2FE)),
    _Element('P', 'Phosphorus', 15, 'nonmetal', Color(0xFFECFDF5)),
    _Element('S', 'Sulphur', 16, 'nonmetal', Color(0xFFECFDF5)),
    _Element('Cl', 'Chlorine', 17, 'halogen', Color(0xFFFCE7F3)),
    _Element('Ar', 'Argon', 18, 'noble', Color(0xFFF0FDF4)),
    _Element('K', 'Potassium', 19, 'alkali', Color(0xFFFEF9C3)),
    _Element('Ca', 'Calcium', 20, 'alkaline', Color(0xFFFEF08A)),
    _Element('Fe', 'Iron', 26, 'metal', Color(0xFFE0F2FE)),
    _Element('Cu', 'Copper', 29, 'metal', Color(0xFFE0F2FE)),
    _Element('Zn', 'Zinc', 30, 'metal', Color(0xFFE0F2FE)),
    _Element('Ag', 'Silver', 47, 'metal', Color(0xFFE0F2FE)),
    _Element('Au', 'Gold', 79, 'metal', Color(0xFFFEF9C3)),
    _Element('Hg', 'Mercury', 80, 'metal', Color(0xFFE0F2FE)),
    _Element('Pb', 'Lead', 82, 'metal', Color(0xFFE0F2FE)),
    _Element('U', 'Uranium', 92, 'actinide', Color(0xFFFEE2E2)),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tap an element to add to canvas:',
            style: TextStyle(color: Colors.white70, fontSize: 11.sp)),
        SizedBox(height: 8.h),
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 0.9,
              crossAxisSpacing: 4.w,
              mainAxisSpacing: 4.h,
            ),
            itemCount: _elements.length,
            itemBuilder: (ctx, i) {
              final el = _elements[i];
              return GestureDetector(
                onTap: () {
                  ref.read(whiteboardContentProvider.notifier)
                      .addLatex('\\text{${el.symbol}}_{${el.atomicNum}}');
                  Navigator.pop(context);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: el.color,
                    borderRadius: BorderRadius.circular(4.r),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${el.atomicNum}',
                        style: TextStyle(fontSize: 7.sp, color: Colors.grey.shade600),
                      ),
                      Text(
                        el.symbol,
                        style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87),
                      ),
                      Text(
                        el.name,
                        style: TextStyle(fontSize: 5.5.sp, color: Colors.grey.shade700),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(height: 8.h),
        // Legend
        Wrap(
          spacing: 12.w,
          children: [
            _legend('Alkali', const Color(0xFFFEF9C3)),
            _legend('Nonmetal', const Color(0xFFECFDF5)),
            _legend('Noble Gas', const Color(0xFFF0FDF4)),
            _legend('Halogen', const Color(0xFFFCE7F3)),
            _legend('Metal', const Color(0xFFE0F2FE)),
          ],
        ),
      ],
    );
  }

  Widget _legend(String label, Color color) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
              width: 10, height: 10, color: color,
              decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade400))),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
        ],
      );
}

// ─── Structures Tab ──────────────────────────────────────────────────────────
class _StructuresTab extends ConsumerWidget {
  final _compounds = [
    ['H₂O', 'Water', r'\text{H}_2\text{O}'],
    ['CO₂', 'Carbon Dioxide', r'\text{CO}_2'],
    ['NaCl', 'Salt', r'\text{NaCl}'],
    ['H₂SO₄', 'Sulfuric Acid', r'\text{H}_2\text{SO}_4'],
    ['HCl', 'Hydrochloric Acid', r'\text{HCl}'],
    ['NH₃', 'Ammonia', r'\text{NH}_3'],
    ['CH₄', 'Methane', r'\text{CH}_4'],
    ['C₆H₆', 'Benzene', r'\text{C}_6\text{H}_6'],
    ['Ca(OH)₂', 'Calcium Hydroxide', r'\text{Ca(OH)}_2'],
    ['HNO₃', 'Nitric Acid', r'\text{HNO}_3'],
    ['KMnO₄', 'Potassium Permanganate', r'\text{KMnO}_4'],
    ['CaCO₃', 'Calcium Carbonate', r'\text{CaCO}_3'],
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GridView.builder(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2.5,
        crossAxisSpacing: 8.w,
        mainAxisSpacing: 8.h,
      ),
      itemCount: _compounds.length,
      itemBuilder: (ctx, i) {
        final compound = _compounds[i];
        return GestureDetector(
          onTap: () {
            ref.read(whiteboardContentProvider.notifier).addLatex(compound[2]);
            Navigator.pop(context);
          },
          child: Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8.r),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(compound[0],
                    style: TextStyle(
                        color: const Color(0xFF10B981),
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp)),
                Text(compound[1],
                    style: TextStyle(color: Colors.white54, fontSize: 9.sp),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─── Equations Tab ───────────────────────────────────────────────────────────
class _EquationsTab extends ConsumerWidget {
  final _equations = [
    ['Photosynthesis', r'6\text{CO}_2 + 6\text{H}_2\text{O} \rightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2'],
    ['Combustion (CH₄)', r'\text{CH}_4 + 2\text{O}_2 \rightarrow \text{CO}_2 + 2\text{H}_2\text{O}'],
    ['Neutralisation', r'\text{HCl} + \text{NaOH} \rightarrow \text{NaCl} + \text{H}_2\text{O}'],
    ['Electrolysis (H₂O)', r'2\text{H}_2\text{O} \rightarrow 2\text{H}_2 + \text{O}_2'],
    ['Haber Process', r'\text{N}_2 + 3\text{H}_2 \rightleftharpoons 2\text{NH}_3'],
    ['Sodium + Water', r'2\text{Na} + 2\text{H}_2\text{O} \rightarrow 2\text{NaOH} + \text{H}_2'],
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView.builder(
      itemCount: _equations.length,
      itemBuilder: (ctx, i) {
        return GestureDetector(
          onTap: () {
            ref.read(whiteboardContentProvider.notifier).addLatex(_equations[i][1]);
            Navigator.pop(context);
          },
          child: Container(
            margin: EdgeInsets.only(bottom: 8.h),
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(10.r),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_equations[i][0],
                    style: TextStyle(
                        color: const Color(0xFF10B981),
                        fontWeight: FontWeight.w600,
                        fontSize: 12.sp)),
                SizedBox(height: 4.h),
                Text(_equations[i][1],
                    style: TextStyle(
                        color: Colors.white70, fontSize: 11.sp, fontFamily: 'monospace')),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Element {
  final String symbol;
  final String name;
  final int atomicNum;
  final String category;
  final Color color;

  const _Element(this.symbol, this.name, this.atomicNum, this.category, this.color);
}
