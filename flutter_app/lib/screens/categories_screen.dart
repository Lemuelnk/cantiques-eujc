import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/categories.dart';
import '../theme/app_theme.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Categories')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: allCategories.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final cat = allCategories[i];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.book_outlined, color: AppColors.gold),
              title: Text(cat.label),
              subtitle: Text(cat.domain),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/cantiques/${cat.id}'),
            ),
          );
        },
      ),
    );
  }
}
