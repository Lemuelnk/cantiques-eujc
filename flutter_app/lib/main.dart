import 'package:flutter/material.dart';

import 'data/hymn_repository.dart';
import 'models.dart';

void main() => runApp(const CantiquesApp());

class CantiquesApp extends StatelessWidget {
  const CantiquesApp({super.key});

  @override
  Widget build(BuildContext context) {
    const deepGreen = Color(0xFF001A17);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Cantiques EUJC',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: deepGreen),
        scaffoldBackgroundColor: const Color(0xFFF8FAF8),
        appBarTheme: const AppBarTheme(
          backgroundColor: deepGreen,
          foregroundColor: Colors.white,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'Cantiques EUJC',
        style: TextStyle(fontWeight: FontWeight.w700),
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.settings_outlined),
          tooltip: 'Paramètres',
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
      children: [
        Text(
          'CANTIQUES EUJC',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            letterSpacing: 1.5,
            color: const Color(0xFFB28632),
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Bonjour 👋',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: const Color(0xFF123A34),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Que souhaitez-vous\nchanter aujourd’hui ?',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(height: 1.25),
        ),
        const SizedBox(height: 28),
        TextField(
          readOnly: true,
          onTap: () => _openLesson(context),
          decoration: InputDecoration(
            hintText: 'Rechercher un cantique…',
            prefixIcon: const Icon(Icons.search),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        const SizedBox(height: 28),
        Text(
          'Accès rapides',
          style: Theme.of(context).textTheme.titleMedium
              ?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        _QuickCard(
          icon: Icons.menu_book_outlined,
          title: 'Leçons',
          subtitle: 'du Chemin',
          color: const Color(0xFF176B5D),
          onTap: () => _openLesson(context),
        ),
        const SizedBox(height: 12),
        _QuickCard(
          icon: Icons.calendar_month_outlined,
          title: 'Cantiques',
          subtitle: 'du Dimanche',
          color: const Color(0xFFB28632),
          onTap: () {},
        ),
        const SizedBox(height: 12),
        _QuickCard(
          icon: Icons.local_fire_department_outlined,
          title: 'Cantiques de prière',
          subtitle: '',
          color: const Color(0xFF315F68),
          onTap: () {},
        ),
        const SizedBox(height: 28),
        Text(
          'Corpus disponible',
          style: Theme.of(context).textTheme.titleMedium
              ?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        const Text(
          'La phase 1 contient la Leçon 1 — Création et ses cantiques canoniques.',
        ),
      ],
    ),
    bottomNavigationBar: const _BottomBar(),
  );

  void _openLesson(BuildContext context) =>
      Navigator.of(context)
          .push(MaterialPageRoute(builder: (_) => const LessonScreen()));
}

class LessonScreen extends StatefulWidget {
  const LessonScreen({super.key});
  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  final _repository = const HymnRepository();
  late Future<CanonicalCorpus> _corpus;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _corpus = _repository.loadLessonOne();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Leçon 1 — Création')),
    body: FutureBuilder<CanonicalCorpus>(
      future: _corpus,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Text(
              'Impossible de charger les cantiques\n${snapshot.error}',
              textAlign: TextAlign.center,
            ),
          );
        }
        final hymns = snapshot.data!.hymns
            .where(
              (hymn) => '${hymn.title} ${hymn.primaryVersion?.title ?? ''}'
                  .toLowerCase()
                  .contains(_query.toLowerCase()),
            )
            .toList();
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: TextField(
                onChanged: (value) => setState(() => _query = value),
                decoration: InputDecoration(
                  hintText: 'Rechercher dans la leçon…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _query.isEmpty
                      ? null
                      : IconButton(
                          onPressed: () => setState(() => _query = ''),
                          icon: const Icon(Icons.clear),
                        ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${hymns.length} cantique${hymns.length > 1 ? 's' : ''}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF176B5D),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                itemCount: hymns.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, index) => _HymnTile(
                  hymn: hymns[index],
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => HymnDetailScreen(hymn: hymns[index]),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    ),
  );
}

class HymnDetailScreen extends StatelessWidget {
  const HymnDetailScreen({required this.hymn, super.key});
  final Hymn hymn;

  @override
  Widget build(BuildContext context) {
    final version = hymn.primaryVersion;
    if (version == null) {
      return const Scaffold(body: Center(child: Text('Cantique introuvable.')));
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(
          version.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
        children: [
          Text(
            version.source.number == null
                ? 'Sans numéro source'
                : 'N° ${version.source.number}',
            style: const TextStyle(
              color: Color(0xFFB28632),
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            version.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: const Color(0xFF123A34),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${version.language.displayLabel} · Position source ${version.source.position}',
            style: TextStyle(color: Colors.grey.shade700),
          ),
          const SizedBox(height: 24),
          ...version.content.asMap().entries.map(
            (entry) => _ContentBlockCard(index: entry.key, block: entry.value),
          ),
        ],
      ),
    );
  }
}

class _HymnTile extends StatelessWidget {
  const _HymnTile({required this.hymn, required this.onTap});
  final Hymn hymn;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final version = hymn.primaryVersion!;
    return Card(
      color: Colors.white,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFE9F1EE),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  version.source.number ?? '${version.source.position}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF176B5D),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      version.title,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${version.language.displayLabel} · ${version.content.length} blocs',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class _ContentBlockCard extends StatelessWidget {
  const _ContentBlockCard({required this.index, required this.block});
  final int index;
  final ContentBlock block;

  @override
  Widget build(BuildContext context) {
    final isRefrain = block.type == 'refrain';
    return Card(
      color: isRefrain ? const Color(0xFFFFF5DF) : Colors.white,
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              block.type == 'verse'
                  ? '${block.label} ${index + 1}'
                  : block.label,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: isRefrain
                    ? const Color(0xFF9A701E)
                    : const Color(0xFF176B5D),
              ),
            ),
            const SizedBox(height: 10),
            ...block.lines.map(
              (line) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  line,
                  style: const TextStyle(fontSize: 16, height: 1.45),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickCard extends StatelessWidget {
  const _QuickCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    color: color,
    child: InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 28),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                  if (subtitle.isNotEmpty)
                    Text(
                      subtitle,
                      style: const TextStyle(color: Colors.white70),
                    ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white),
          ],
        ),
      ),
    ),
  );
}

class _BottomBar extends StatelessWidget {
  const _BottomBar();
  @override
  Widget build(BuildContext context) => NavigationBar(
    selectedIndex: 0,
    destinations: [
      NavigationDestination(
        icon: Icon(Icons.home_outlined),
        selectedIcon: Icon(Icons.home),
        label: 'Accueil',
      ),
      NavigationDestination(
        icon: Icon(Icons.library_books_outlined),
        label: 'Bibliothèque',
      ),
      NavigationDestination(icon: Icon(Icons.more_horiz), label: 'Plus'),
    ],
  );
}
