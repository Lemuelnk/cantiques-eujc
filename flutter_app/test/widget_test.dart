import 'package:flutter_test/flutter_test.dart';

import 'package:cantiques_eujc/main.dart';

void main() {
  testWidgets('l’accueil Cantiques EUJC est visible', (tester) async {
    await tester.pumpWidget(const CantiquesApp());

    expect(find.text('Cantiques EUJC'), findsOneWidget);
    expect(find.text('Bonjour 👋'), findsOneWidget);
    expect(find.text('Leçons'), findsOneWidget);
  });
}
