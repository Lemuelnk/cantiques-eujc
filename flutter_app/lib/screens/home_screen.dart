import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cantiques EUJC')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Bienvenue',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text('Recueil numerique des cantiques EUJC'),
          const SizedBox(height: 24),
          _Tile(
            title: 'Tous les cantiques',
            subtitle: 'Parcourir par categorie',
            icon: Icons.library_music,
            onTap: () => context.push('/categories'),
          ),
          _Tile(
            title: 'Recherche',
            subtitle: 'Chercher un cantique par mot cle',
            icon: Icons.search,
            onTap: () => context.push('/recherche'),
          ),
          const SizedBox(height: 12),
          _Tile(
            title: 'Lecons bibliques',
            subtitle: '21 lecons canoniques',
            icon: Icons.menu_book,
            onTap: () => context.push('/lessons'),
          ),
          const SizedBox(height: 12),
          _Tile(
            title: 'Cantiques du dimanche',
            subtitle: '7 categories de celebration',
            icon: Icons.wb_sunny,
            onTap: () => context.push('/dimanche'),
          ),
          const SizedBox(height: 12),
          _Tile(
            title: 'Prieres',
            subtitle: '4 categories de priere',
            icon: Icons.spa,
            onTap: () => context.push('/priere'),
          ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.forest700,
          child: Icon(icon, color: AppColors.textInverse),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
