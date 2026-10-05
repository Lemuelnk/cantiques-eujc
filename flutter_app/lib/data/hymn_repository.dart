import 'package:flutter/services.dart';

import '../models/models.dart';

class HymnRepository {
  const HymnRepository();

  Future<CanonicalCorpus> loadCategory(String categoryId) async {
    final path = 'assets/data/canonical/$categoryId.json';
    final source = await rootBundle.loadString(path);
    return CanonicalCorpus.fromJson(decodeObject(source));
  }

  Future<CanonicalCorpus> loadLessonOne() =>
      loadCategory('lesson-1-creation');
}
