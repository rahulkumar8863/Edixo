import 'package:flutter_riverpod/flutter_riverpod.dart';

enum ChemTool { periodicTable, structures, equations, bonds }

final selectedChemToolProvider = StateProvider<ChemTool?>((ref) => null);
