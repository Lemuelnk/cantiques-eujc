import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/hymn_repository.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class CantiqueScreen extends StatefulWidget {
  const CantiqueScreen({super.key, required this.categoryId, required this.number});
  final String categoryId;
  final String number;

  @override
  State<CantiqueScreen> createState() => _CantiqueScreenState();
}

class _CantiqueScreenState extends State<CantiqueScreen> {
  final _repo = const HymnRepository();
  late Future<HymnVersion?> _future;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _future = _findVersion();
    _loadFavoriteStatus();
  }

  Future<HymnVersion?> _findVersion() async {
    try {
      final corpus = await _repo.loadCategory(widget.categoryId);
      for (final h in corpus.hymns) {
        for (final v in h.versions) {
          // Comparaison robuste (trim pour éviter les espaces parasites)
          if (v.source.number?.trim() == widget.number.trim()) return v;
        }
      }
    } catch (e) {
      debugPrint('Erreur chargement cantique: \$e');
    }
    return null;
  }

  Future<void> _loadFavoriteStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isFavorite = prefs.getBool('fav_\${widget.categoryId}_\${widget.number}') ?? false;
    });
  }

  Future<void> _toggleFavorite() async {
    final prefs = await SharedPreferences.getInstance();
    final key = 'fav_\${widget.categoryId}_\${widget.number}';
    setState(() => _isFavorite = !_isFavorite);
    await prefs.setBool(key, _isFavorite);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'), duration: const Duration(seconds: 1), behavior: SnackBarBehavior.floating),
      );
    }
  }

  void _shareCantique(HymnVersion v) {
    final lyrics = v.content.map((b) => '\${b.label}:\n\${b.lines.join('\n')}').join('\n\n');
    final text = '\${v.title}\n\n\$lyrics\n\n— Cantiques EUJC';
    Share.share(text, subject: v.title);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Cantique \${widget.number}'),
        actions: [
          IconButton(
            icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
            color: _isFavorite ? Colors.red : null,
            onPressed: _toggleFavorite,
            tooltip: 'Favoris',
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () async {
              final v = await _future;
              if (v != null && mounted) _shareCantique(v);
            },
            tooltip: 'Partager',
          ),
        ],
      ),
      body: FutureBuilder<HymnVersion?>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          
          final v = snap.data;
          if (v == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.music_off, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Cantique introuvable.', style: TextStyle(fontSize: 18)),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Retour')),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(v.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(v.language.displayLabel, style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
              const SizedBox(height: 24),
              ...v.content.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b.label.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.gold, letterSpacing: 1.2, fontSize: 14)),
                    const SizedBox(height: 8),
                    ...b.lines.map((line) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(line, style: const TextStyle(fontSize: 18, height: 1.6)),
                    )),
                  ],
                ),
              )),
              const SizedBox(height: 40), // Espace de respiration en bas
            ],
          );
        },
      ),
    );
  }
}
