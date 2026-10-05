import 'package:flutter/material.dart';

import '../data/hymn_repository.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class CantiqueScreen extends StatefulWidget {
  const CantiqueScreen({
    super.key,
    required this.categoryId,
    required this.number,
  });
  final String categoryId;
  final String number;

  @override
  State<CantiqueScreen> createState() => _CantiqueScreenState();
}

class _CantiqueScreenState extends State<CantiqueScreen> {
  final _repo = const HymnRepository();
  late Future<HymnVersion?> _future;

  @override
  void initState() {
    super.initState();
    _future = _findVersion();
  }

  Future<HymnVersion?> _findVersion() async {
    final corpus = await _repo.loadCategory(widget.categoryId);
    for (final h in corpus.hymns) {
      for (final v in h.versions) {
        if (v.source.number == widget.number) return v;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Cantique ${widget.number}')),
      body: FutureBuilder<HymnVersion?>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final v = snap.data;
          if (v == null) return const Center(child: Text('Cantique introuvable.'));
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(v.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(v.language.displayLabel, style: const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 24),
              ...v.content.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b.label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.gold)),
                    const SizedBox(height: 6),
                    ...b.lines.map((line) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(line, style: const TextStyle(fontSize: 16, height: 1.5)),
                    )),
                  ],
                ),
              )),
            ],
          );
        },
      ),
    );
  }
}
