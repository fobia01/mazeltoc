import 'package:flutter_test/flutter_test.dart';

import 'package:mazeltoc_app/main.dart';

void main() {
  testWidgets('App builds and shows the game webview', (WidgetTester tester) async {
    await tester.pumpWidget(const MazeltocApp());
    expect(find.byType(GameWebView), findsOneWidget);
  });
}
