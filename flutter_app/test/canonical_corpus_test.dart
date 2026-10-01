import 'package:flutter_test/flutter_test.dart';

import 'package:cantiques_eujc/data/hymn_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('le corpus de la Leçon 1 se charge avec 12 cantiques', () async {
    const repository = HymnRepository();
    final corpus = await repository.loadLessonOne();

    expect(corpus.taxonomy.lessonId, 'lesson-1');
    expect(corpus.hymns, hasLength(12));
    expect(corpus.hymns.first.primaryVersion?.title, 'APO MWANZO');
    expect(
      corpus.hymns.first.primaryVersion?.content.first.type,
      'source_block',
    );
  });
}
