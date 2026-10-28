import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<Map<String, String>> _favorites = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys().where((k) => k.startsWith('fav_')).toList();
    
    List<Map<String, String>> favs = [];
    for (String key in keys) {
      if (prefs.getBool(key) == true) {
        // Le format de la clé est : fav_<categoryId>_<number>
        final parts = key.replaceFirst('fav_', '').split('_');
        if (parts.length == 2) {
          favs.add({'categoryId': parts[0], 'number': parts[1]});
        }
      }
    }
    
    setState(() {
      _favorites = favs;
      _isLoading = false;
    });
  }

  Future<void> _removeFavorite(String categoryId, String number) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('fav_${categoryId}_${number}');
    _loadFavorites(); // Recharge la liste après suppression
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Retiré des favoris'), duration: Duration(seconds: 1), behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mes Favoris')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _favorites.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.favorite_border, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('Aucun cantique favori pour le moment.', style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _favorites.length,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemBuilder: (context, index) {
                    final fav = _favorites[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: ListTile(
                        leading: const CircleAvatar(child: Icon(Icons.music_note, color: Colors.white), backgroundColor: Colors.green),
                        title: Text('Cantique n° ${fav['number']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('Catégorie : ${fav['categoryId']}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                          onPressed: () => _removeFavorite(fav['categoryId']!, fav['number']!),
                          tooltip: 'Retirer des favoris',
                        ),
                        onTap: () {
                          // Navigation vers l'écran du cantique
                          context.go('/cantique/${fav['categoryId']}/${fav['number']}');
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
