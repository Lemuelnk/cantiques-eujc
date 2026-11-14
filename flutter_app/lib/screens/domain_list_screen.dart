import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/categories.dart';
import '../theme/app_theme.dart';

class DomainListScreen extends StatelessWidget {
  const DomainListScreen({super.key, required this.domain, required this.title});
  final String domain;
  final String title;

  @override
  Widget build(BuildContext context) {
    final cats = allCategories.where((c) => c.domain == domain).toList();
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: cats.isEmpty
          ? const Center(child: Text('Aucune categorie dans ce domaine.'))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: cats.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final cat = cats[i];
                final num = (i + 1).toString().padLeft(2, '0');
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.forest700,
                      child: Text(
                        num,
                        style: const TextStyle(
                          color: AppColors.textInverse,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(cat.label),
                    subtitle: Text(cat.id),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/cantiques/${cat.id}'),
                  ),
                );
              },
            ),
    );
  }
}
