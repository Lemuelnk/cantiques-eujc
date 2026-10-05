class Category {
  const Category({
    required this.id,
    required this.label,
    required this.domain,
    this.icon,
  });

  final String id;
  final String label;
  final String domain;
  final String? icon;
}

const allCategories = <Category>[
  Category(id: 'lesson-0-lucifer', label: 'Lucifer', domain: 'lessons'),
  Category(id: 'lesson-1-creation', label: 'Creation', domain: 'lessons'),
  Category(id: 'lesson-2-eden', label: 'Eden', domain: 'lessons'),
  Category(id: 'lesson-3-premier-peche', label: 'Premier peche', domain: 'lessons'),
  Category(id: 'lesson-4-fils-adam', label: 'Fils d Adam', domain: 'lessons'),
  Category(id: 'lesson-5-noe', label: 'Noe', domain: 'lessons'),
  Category(id: 'lesson-6-abraham', label: 'Abraham', domain: 'lessons'),
  Category(id: 'lesson-7-lot', label: 'Lot', domain: 'lessons'),
  Category(id: 'lesson-8-fils-isaac', label: 'Fils d Isaac', domain: 'lessons'),
  Category(id: 'lesson-9-jacob', label: 'Jacob', domain: 'lessons'),
  Category(id: 'lesson-10-egypte', label: 'Egypte', domain: 'lessons'),
  Category(id: 'lesson-11-moise', label: 'Moise', domain: 'lessons'),
  Category(id: 'lesson-12-plaies', label: 'Plaies', domain: 'lessons'),
  Category(id: 'lesson-13-mer-rouge', label: 'Mer Rouge', domain: 'lessons'),
  Category(id: 'lesson-20-samson', label: 'Samson', domain: 'lessons'),
  Category(id: 'lesson-21-david-saul', label: 'David et Saul', domain: 'lessons'),
  Category(id: 'lesson-22-salomon', label: 'Salomon', domain: 'lessons'),
  Category(id: 'lesson-23-temple', label: 'Temple', domain: 'lessons'),
  Category(id: 'lesson-24-elie-elisee', label: 'Elie et Elisee', domain: 'lessons'),
  Category(id: 'lesson-25-daniel', label: 'Daniel', domain: 'lessons'),
  Category(id: 'lesson-26-job', label: 'Job', domain: 'lessons'),
  Category(id: 'dimanche-louange', label: 'Louange', domain: 'dimanche'),
  Category(id: 'dimanche-affliges', label: 'Affliges', domain: 'dimanche'),
  Category(id: 'dimanche-croyants', label: 'Croyants', domain: 'dimanche'),
  Category(id: 'dimanche-visiteurs', label: 'Visiteurs', domain: 'dimanche'),
  Category(id: 'dimanche-rois', label: 'Rois', domain: 'dimanche'),
  Category(id: 'dimanche-egares', label: 'Egares', domain: 'dimanche'),
  Category(id: 'dimanche-divers', label: 'Divers', domain: 'dimanche'),
  Category(id: 'priere-invocation', label: 'Invocation', domain: 'priere'),
  Category(id: 'priere-general', label: 'Priere generale', domain: 'priere'),
  Category(id: 'priere-misericorde', label: 'Misericorde', domain: 'priere'),
  Category(id: 'priere-bataille', label: 'Bataille', domain: 'priere'),
];
