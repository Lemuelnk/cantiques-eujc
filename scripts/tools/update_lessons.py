import os
import shutil

# Copie du fichier de leçon dans les assets Android
src_lesson = "app/data/lesson-1-creation.json"
dest_lesson = "android_native/app/src/main/assets/lesson-1-creation.json"
if os.path.exists(src_lesson):
    shutil.copy(src_lesson, dest_lesson)
    print("✅ lesson-1-creation.json copié dans les assets.")
else:
    print("⚠️ Fichier lesson-1-creation.json introuvable.")
