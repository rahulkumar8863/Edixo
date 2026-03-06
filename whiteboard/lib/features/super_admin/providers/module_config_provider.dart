import 'package:flutter_riverpod/flutter_riverpod.dart';

class ModuleConfig {
  final bool aiAssistant;
  final bool periodicTable;
  final bool shapeBuilder3D;
  final bool attendance;
  final bool homeworkGenerator;
  final bool splitScreen;
  final bool mathTools;
  final bool chemistryTools;
  final bool physicsSimulations;
  
  // Class Calibration
  final List<int> allowedGrades;
  final int globalAiTokenLimit; // Tokens per class session

  ModuleConfig({
    this.aiAssistant = true,
    this.periodicTable = true,
    this.shapeBuilder3D = true,
    this.attendance = true,
    this.homeworkGenerator = true,
    this.splitScreen = true,
    this.mathTools = true,
    this.chemistryTools = true,
    this.physicsSimulations = true,
    this.allowedGrades = const [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    this.globalAiTokenLimit = 5000,
  });

  ModuleConfig copyWith({
    bool? aiAssistant,
    bool? periodicTable,
    bool? shapeBuilder3D,
    bool? attendance,
    bool? homeworkGenerator,
    bool? splitScreen,
    bool? mathTools,
    bool? chemistryTools,
    bool? physicsSimulations,
    List<int>? allowedGrades,
    int? globalAiTokenLimit,
  }) {
    return ModuleConfig(
      aiAssistant: aiAssistant ?? this.aiAssistant,
      periodicTable: periodicTable ?? this.periodicTable,
      shapeBuilder3D: shapeBuilder3D ?? this.shapeBuilder3D,
      attendance: attendance ?? this.attendance,
      homeworkGenerator: homeworkGenerator ?? this.homeworkGenerator,
      splitScreen: splitScreen ?? this.splitScreen,
      mathTools: mathTools ?? this.mathTools,
      chemistryTools: chemistryTools ?? this.chemistryTools,
      physicsSimulations: physicsSimulations ?? this.physicsSimulations,
      allowedGrades: allowedGrades ?? this.allowedGrades,
      globalAiTokenLimit: globalAiTokenLimit ?? this.globalAiTokenLimit,
    );
  }
}

class ModuleConfigNotifier extends StateNotifier<ModuleConfig> {
  ModuleConfigNotifier() : super(ModuleConfig());

  void toggleModule(String key, bool value) {
    switch (key) {
      case 'aiAssistant': state = state.copyWith(aiAssistant: value); break;
      case 'periodicTable': state = state.copyWith(periodicTable: value); break;
      case 'shapeBuilder3D': state = state.copyWith(shapeBuilder3D: value); break;
      case 'attendance': state = state.copyWith(attendance: value); break;
      case 'homeworkGenerator': state = state.copyWith(homeworkGenerator: value); break;
      case 'splitScreen': state = state.copyWith(splitScreen: value); break;
      case 'mathTools': state = state.copyWith(mathTools: value); break;
      case 'chemistryTools': state = state.copyWith(chemistryTools: value); break;
      case 'physicsSimulations': state = state.copyWith(physicsSimulations: value); break;
    }
  }

  void updateAllowedGrades(List<int> grades) {
    state = state.copyWith(allowedGrades: grades);
  }

  void updateTokenLimit(int limit) {
    state = state.copyWith(globalAiTokenLimit: limit);
  }
}

final moduleConfigProvider = StateNotifierProvider<ModuleConfigNotifier, ModuleConfig>((ref) {
  return ModuleConfigNotifier();
});
