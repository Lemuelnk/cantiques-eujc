import 'package:flutter/services.dart';

import '../models.dart';

class HymnRepository {
  const HymnRepository();

  Future<CanonicalCorpus> loadLessonOne() async {
    final source = await rootBundle.loadString(
      'assets/data/lesson-1-creation.json',
    );
    return CanonicalCorpus.fromJson(decodeObject(source));
  }
}
