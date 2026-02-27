# 💼 Guide Candidatures - JobMatch

## Vue d'ensemble

Le système de candidatures de JobMatch vous permet de :
- ✅ **Sauvegarder** des offres d'emploi
- 📊 **Suivre** le statut de vos candidatures
- 📋 **Consulter** l'historique complet
- 🗑️ **Supprimer** les candidatures

---

## 📝 Étapes pour candidater

### 1. **Depuis l'Analyseur d'Offres**

Après une analyse, en bas de la carte "Score Global" :
```
┌─────────────────────────┐
│ Score Global            │
│ 92% Compatibilité       │
│ ...                     │
│ [SAUVEGARDER] ← Clic ici│
└─────────────────────────┘
```

Le bouton "**Sauvegarder**" enregistre automatiquement l'offre analysée.

### 2. **Depuis la page "Mes Offres"**

Accédez à **"Mes Offres"** dans le menu principal → Consultez toutes vos candidatures.

---

## 🎯 Statuts des candidatures

Chaque candidature peut avoir 3 statuts :

| Statut | Icône | Signification |
|--------|-------|---------------|
| **Sauvegardée** | 📌 | L'offre vous intéresse, vous la gardez de côté |
| **Appliquée** | ✅ | Vous avez postulé à cette offre |
| **Rejetée** | ❌ | Vous n'êtes pas intéressé ou déjà rejeté |

### Comment changer le statut ?

1. Allez à **"Mes Offres"**
2. Trouvez la candidature dans le tableau
3. Cliquez sur le **dropdown de statut** (colonne 4)
4. Sélectionnez le nouveau statut
5. ✅ Mis à jour automatiquement !

---

## 📊 Consulter vos candidatures

### Sur le Dashboard

En bas du dashboard, vous verrez une section **"Offres Correspondantes"** qui affiche :
- Les 3 dernières offres sauvegardées
- Leur statut courant
- La date de sauvegarde

### Sur la page "Mes Offres"

Vue complète avec :
- 📋 Tableau de tous les candidatures
- 🔍 Filtrage par statut
- 📅 Tri par date
- ✏️ Modification du statut
- 🗑️ Suppression

---

## 🔧 APIs Disponibles

### 1. Sauvegarder une offre

```bash
POST /api/save-offer
Content-Type: application/json

{
  "title": "Senior Developer",
  "company": "Google",
  "location": "Mountain View",
  "salary": "$150K-$200K",
  "description": "Full job description...",
  "contract_type": "CDI"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Offre sauvegardée avec succès",
  "offer_id": 42
}
```

### 2. Récupérer les candidatures

```bash
GET /api/get-applications
```

**Réponse :**
```json
{
  "success": true,
  "applications": [
    {
      "id": 1,
      "title": "Senior Developer",
      "company": "Google",
      "location": "Mountain View",
      "salary": "$150K-$200K",
      "status": "applied",
      "date": "09 Fév 2026"
    }
  ],
  "count": 1
}
```

### 3. Mettre à jour le statut

```bash
POST /api/update-application-status
Content-Type: application/json

{
  "id": 1,
  "status": "applied"  // "saved" | "applied" | "rejected"
}
```

### 4. Supprimer une candidature

```bash
POST /api/delete-application
Content-Type: application/json

{
  "id": 1
}
```

---

## 💻 Utilisation JavaScript

### Charger les candidatures

```javascript
await loadApplications();
// Affiche automatiquement toutes les candidatures dans le tableau
```

### Sauvegarder une offre

```javascript
await saveJob({
  title: "Senior Developer",
  company: "Google",
  location: "Mountain View",
  salary: "$150K-$200K",
  description: "...",
  contract_type: "CDI"
});
```

### Mettre à jour le statut

```javascript
await updateApplicationStatus(applicationId, "applied");
```

### Supprimer une candidature

```javascript
await deleteApplication(applicationId);
// Demande confirmation avant de supprimer
```

---

## 📱 Workflow complet

### Scenario : Vous trouvez une offre intéressante

1. **Copier** le texte de l'offre d'emploi
2. **Aller** à → "Analyseur d'Offres"
3. **Coller** l'offre dans le champ
4. **Uploader** votre CV en PDF
5. **Analyser** pour voir la compatibilité
6. **Sauvegarder** l'offre (bouton en bas)
7. ✅ C'est automatiquement enregistré !

### Suivre ses candidatures

1. Allez à **"Mes Offres"**
2. Voyez **toutes vos offres sauvegardées**
3. Modifiez le statut au fur et à mesure :
   - 📌 Sauvegardée → vous avez postulé
   - ✅ Appliquée → vous l'avez fait
   - ❌ Rejetée → plus intéressé

---

## 🎓 Statistiques & Analytics

### Visualisation sur le Dashboard

Le dashboard agrège automatiquement :
- 📊 **Nombre total de candidatures** par statut
- 📈 **Taux d'application** (combien vous avez postulé)
- 🎯 **Taux de conversion** (offres acceptées vs rejetées)

---

## ❓ FAQ

### Q: Puis-je sauvegarder la même offre plusieurs fois ?
**R:** Non, une offre unique est créée une seule fois. Si vous la sauvegardez à nouveau, il faudra modifier l'offre existante.

### Q: Co Puis-je exporter mes candidatures ?
**R:** Oui, le tableau peut être téléchargé en CSV (fonction en cours de développement).

### Q: Que se passe-t-il si je supprime une offre ?
**R:** La candidature est supprimée de votre liste, mais l'offre reste en base de données (pour les statistiques).

### Q: Puis-je modifier les détails d'une offre sauvegardée ?
**R:** Actuellement non, mais c'est une fonctionnalité à venir.

---

## 🚀 Prochaines étapes

- [ ] Export CSV des candidatures
- [ ] Filtre par date, entreprise, statut
- [ ] Édition des offres sauvegardées
- [ ] Historique des modifications
- [ ] Notifications de nouvelles offres similaires

---

**Pour plus d'aide**, consultez la section "Support" du README principal. 📚
