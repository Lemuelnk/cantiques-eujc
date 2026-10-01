import 'dart:convert';

class CanonicalCorpus {
  const CanonicalCorpus({required this.taxonomy, required this.hymns});

  final Taxonomy taxonomy;
  final List<Hymn> hymns;

  factory CanonicalCorpus.fromJson(Map<String, dynamic> json) {
    return CanonicalCorpus(
      taxonomy: Taxonomy.fromJson(json['taxonomy'] as Map<String, dynamic>),
      hymns: (json['hymns'] as List<dynamic>? ?? const [])
          .map((item) => Hymn.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class Hymn {
  const Hymn({
    required this.id,
    required this.title,
    required this.status,
    required this.versions,
  });

  final String id;
  final String title;
  final String status;
  final List<HymnVersion> versions;

  factory Hymn.fromJson(Map<String, dynamic> json) {
    return Hymn(
      id: json['id'] as String,
      title: json['title'] as String,
      status: json['status'] as String? ?? 'unknown',
      versions: (json['versions'] as List<dynamic>? ?? const [])
          .map((item) => HymnVersion.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  HymnVersion? get primaryVersion => versions.isEmpty ? null : versions.first;
}

class HymnVersion {
  const HymnVersion({
    required this.id,
    required this.language,
    required this.title,
    required this.source,
    required this.taxonomy,
    required this.content,
    required this.audioPresent,
  });

  final String id;
  final LanguageInfo language;
  final String title;
  final SourceReference source;
  final Taxonomy taxonomy;
  final List<ContentBlock> content;
  final bool audioPresent;

  factory HymnVersion.fromJson(Map<String, dynamic> json) {
    return HymnVersion(
      id: json['id'] as String,
      language: LanguageInfo.fromJson(json['language'] as Map<String, dynamic>),
      title: json['title'] as String,
      source: SourceReference.fromJson(json['source'] as Map<String, dynamic>),
      taxonomy: Taxonomy.fromJson(json['taxonomy'] as Map<String, dynamic>),
      content: (json['content'] as List<dynamic>? ?? const [])
          .map((item) => ContentBlock.fromJson(item as Map<String, dynamic>))
          .toList(),
      audioPresent:
          (json['media'] as Map<String, dynamic>?)?['audio_present'] as bool? ??
          false,
    );
  }
}

class LanguageInfo {
  const LanguageInfo({this.code, this.label, required this.status});

  final String? code;
  final String? label;
  final String status;

  factory LanguageInfo.fromJson(Map<String, dynamic> json) {
    return LanguageInfo(
      code: json['code'] as String?,
      label: json['label'] as String?,
      status: json['status'] as String? ?? 'unknown',
    );
  }

  String get displayLabel {
    if (status == 'unknown' || status == 'uncertain') {
      return 'Langue à confirmer';
    }
    return label ?? 'Langue non identifiée';
  }
}

class SourceReference {
  const SourceReference({
    required this.file,
    required this.position,
    this.number,
    this.reference,
  });

  final String file;
  final int position;
  final String? number;
  final String? reference;

  factory SourceReference.fromJson(Map<String, dynamic> json) {
    return SourceReference(
      file: json['file'] as String,
      position: (json['position'] as num).toInt(),
      number: json['number'] as String?,
      reference: json['reference'] as String?,
    );
  }
}

class Taxonomy {
  const Taxonomy({
    required this.domain,
    required this.categoryId,
    required this.categoryLabel,
    required this.lessonId,
    required this.lessonLabel,
  });

  final String domain;
  final String categoryId;
  final String categoryLabel;
  final String? lessonId;
  final String? lessonLabel;

  factory Taxonomy.fromJson(Map<String, dynamic> json) {
    return Taxonomy(
      domain: json['domain'] as String? ?? 'lessons',
      categoryId: json['category_id'] as String? ?? '',
      categoryLabel: json['category_label'] as String? ?? '',
      lessonId: json['lesson_id'] as String?,
      lessonLabel: json['lesson_label'] as String?,
    );
  }
}

class ContentBlock {
  const ContentBlock({required this.type, required this.lines});

  final String type;
  final List<String> lines;

  factory ContentBlock.fromJson(Map<String, dynamic> json) {
    return ContentBlock(
      type: json['type'] as String,
      lines: (json['lines'] as List<dynamic>? ?? const []).cast<String>(),
    );
  }

  String get label {
    switch (type) {
      case 'refrain':
        return 'Refrain';
      case 'comment':
        return 'Commentaire source';
      case 'verse':
        return 'Couplet';
      default:
        return 'Paroles';
    }
  }
}

Map<String, dynamic> decodeObject(String source) =>
    jsonDecode(source) as Map<String, dynamic>;
