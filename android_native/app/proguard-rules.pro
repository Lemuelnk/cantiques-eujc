# Règles ProGuard - Cantiques EUJC

# kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class **$$serializer { *; }
-keepclasseswithmembers class com.lnk.cantiques.data.** {
    kotlinx.serialization.KSerializer serializer(...);
}
