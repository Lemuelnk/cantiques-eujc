import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/categories.dart';
import '../data/hymn_repository.dart';
import '../theme/app_theme.dart';

class RechercheScreen extends StatefulWidget {
  const RechercheScreen({super.key});

  @override
  State<RechercheScreen> createState() => _RechercheScreenState();
}

class _RechercheScreenState extends State<RechercheScreen> {
  final _repo = const HymnRepository();
  final _controller = TextEditingController();
  Future<List<_SearchResult>>? _future;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _future = _loadAll();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<List<_SearchResult>> _loadAll() async {
    final results = <_SearchResult>[];
    for (final cat in allCategories) {
      try {
        final corpus = await _repo.loadCategory(cat.id);
        for (final hymn in corpus.hymns) {
          final v = hymn.primaryVersion;
          if (v == null) continue;
          final firstLine = v.content.isNotEmpty && v.content.first.lines.isNotEmpty
              ? v.content.first.lines.first
              : '';
          results.add(_SearchResult(
            categoryId: cat.id,
            categoryLabel: cat.label,
            number: v.source.number ?? '',
            title: v.title,
            snippet: firstLine,
          ));
        }
      } catch (_) {
        // Catégorie manquante ou JSON cassé : on saute
      }
    }
    return results;
  }

  List<_SearchResult> _filter(List<_SearchResult> all) {
    if (_query.trim().isEmpty) return all;
    final q = _normalize(_query);
    return all.where((r) {
      return _normalize(r.title).contains(q) ||
          _normalize(r.snippet).contains(q) ||
          _normalize(r.categoryLabel).contains(q);
    }).toList();
  }

  String _normalize(String s) {
    const accents = {
      'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a',
      'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
      'ò': 'o', 'ó': 'o', 'ô': 'o', 'ö': 'o',
      'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c', 'ñ': 'n',
    };
    var out = s.toLowerCase();
    accents.forEach((k, v) => out = out.replaceAll(k, v));
    return out;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recherche')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              autofocus: false,
              decoration: InputDecoration(
                hintText: 'Rechercher un cantique, un mot...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _query.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _controller.clear();
                          setState(() => _query = '');
                        },
                      ),
                filled: true,
                fillColor: Theme.of(context).cardTheme.color,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<_SearchResult>>(
              future: _future,
              builder: (context, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snap.hasError) {
                  return Center(child: Text('Erreur : ${snap.error}'));
                }
                final filtered = _filter(snap.data ?? const []);
                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      _query.isEmpty
                          ? 'Aucun cantique disponible.'
                          : 'Aucun resultat pour "$_query".',
                    ),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 6),
                  itemBuilder: (context, i) {
                    final r = filtered[i];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.cream,
                          child: Text(
                            r.number.isEmpty ? '?' : r.number,
                            style: const TextStyle(
                              color: AppColors.forest700,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        title: Text(r.title),
                        subtitle: Text(
                          '${r.categoryLabel}${r.snippet.isNotEmpty ? " - ${r.snippet}" : ""}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push(
                          '/cantique/${r.categoryId}/${r.number}',
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchResult {
  const _SearchResult({
    required this.categoryId,
    required this.categoryLabel,
    required this.number,
    required this.title,
    required this.snippet,
  });
  final String categoryId;
  final String categoryLabel;
  final String number;
  final String title;
  final String snippet;
}
