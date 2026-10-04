import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/categories.dart';
import '../data/hymn_repository.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class CantiquesScreen extends StatefulWidget {
  const CantiquesScreen({super.key, required this.categoryId});
  final String categoryId;

  @override
  State<CantiquesScreen> createState() => _CantiquesScreenState();
}

class _CantiquesScreenState extends State<CantiquesScreen> {
  final _repo = const HymnRepository();
  late Future<CanonicalCorpus> _future;

  @override
  void initState() {
    super.initState();
    _future = _repo.loadCategory(widget.categoryId);
  }

  @override
  Widget build(BuildContext context) {
    final cat = allCategories.firstWhere(
      (c) => c.id == widget.categoryId,
      orElse: () => Category(id: widget.categoryId, label: widget.categoryId, domain: 'lessons'),
    );
    return Scaffold(
      appBar: AppBar(title: Text(cat.label)),
      body: FutureBuilder<CanonicalCorpus>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Erreur : ${snap.error}'));
          }
          final hymns = snap.data?.hymns ?? const [];
          if (hymns.isEmpty) {
            return const Center(child: Text('Aucun cantique dans cette categorie.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: hymns.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final h = hymns[i];
              final v = h.primaryVersion;
              final num = v?.source.number ?? '${i + 1}';
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.cream,
                    child: Text(num, style: const TextStyle(color: AppColors.forest700, fontWeight: FontWeight.bold)),
                  ),
                  title: Text(v?.title ?? h.title),
                  subtitle: Text(v?.language.displayLabel ?? ''),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/cantique/${widget.categoryId}/$num'),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
