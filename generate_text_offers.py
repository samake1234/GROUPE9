#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur d'Offres d'Emploi - Format Texte
Génère les offres d'emploi en format texte simple
"""

from ai_job_generator import JobOfferAIGenerator
import json

def format_offer_text(offer):
    """Formate une offre pour l'affichage texte"""
    text = f"""
{'='*80}
📋 {offer['title'].upper()}
{'='*80}

🏢 ENTREPRISE: {offer['company']}
📍 LOCALISATION: {offer['location']}
💼 TYPE DE CONTRAT: {offer['contract_type']}
⭐ NIVEAU: {offer['experience_level']}
💰 SALAIRE: {offer['salary_min']:,}€ - {offer['salary_max']:,}€

📝 DESCRIPTION:
{offer['description']}

🎯 COMPÉTENCES REQUISES:
{', '.join(offer['required_skills'])}

💡 COMPÉTENCES SOUHAITÉES:
{', '.join(offer['nice_to_have_skills'][:3])}

📌 RESPONSABILITÉS:
{chr(10).join([f"  • {resp}" for resp in offer['responsibilities'][:4]])}

🎁 AVANTAGES:
{chr(10).join([f"  ✓ {benefit}" for benefit in offer['benefits'][:4]])}

📅 DATE DE PUBLICATION: {offer['posted_date']}
⏰ DEADLINE: {offer['application_deadline']}
👥 TAILLE DE L'ÉQUIPE: {offer['team_size']} personnes
🏠 TÉLÉTRAVAIL: {offer['remote_percentage']}%

"""
    return text


def main():
    """Programme principal"""
    gen = JobOfferAIGenerator()
    
    print("\n" + "🤖 GÉNÉRATEUR D'OFFRES D'EMPLOI - FORMAT TEXTE".center(80, "="))
    print("\nOptions:")
    print("1. Générer 1 offre aléatoire")
    print("2. Générer 5 offres")
    print("3. Générer 10 offres")
    print("4. Générer par catégorie (dev, design, data, management, qa)")
    print("5. Générer offre personnalisée")
    print("6. DEMO: 3 offres variées")
    print("0. Quitter")
    
    choice = input("\nVotre choix (0-6): ").strip()
    
    if choice == "1":
        offer = gen.generate_offer()
        print(format_offer_text(offer))
        
    elif choice == "2":
        offers = gen.generate_batch(5)
        for i, offer in enumerate(offers, 1):
            print(f"\n{'#'*80}")
            print(f"OFFRE {i}/5")
            print(format_offer_text(offer))
            
    elif choice == "3":
        offers = gen.generate_batch(10)
        for i, offer in enumerate(offers, 1):
            print(f"\n{'#'*80}")
            print(f"OFFRE {i}/10")
            print(format_offer_text(offer))
            
    elif choice == "4":
        print("\nCatégories disponibles:")
        print("  1. development")
        print("  2. design")
        print("  3. data")
        print("  4. management")
        print("  5. qa")
        
        cat_choice = input("\nQuelle catégorie? (1-5): ").strip()
        categories = {
            "1": "development",
            "2": "design",
            "3": "data",
            "4": "management",
            "5": "qa"
        }
        
        if cat_choice in categories:
            cat = categories[cat_choice]
            count = int(input("Nombre d'offres? (1-20): ").strip() or "3")
            offers = gen.generate_batch(count, role_type=cat)
            
            for i, offer in enumerate(offers, 1):
                print(f"\n{'#'*80}")
                print(f"OFFRE {i}/{count} - {cat.upper()}")
                print(format_offer_text(offer))
        else:
            print("❌ Choix invalide!")
            
    elif choice == "5":
        print("\n⚙️ OFFRE PERSONNALISÉE")
        skills = input("Compétences requises (séparées par virgule): ").strip()
        level = input("Niveau (Débutant, Confirmé, Senior, Expert): ").strip() or "Senior"
        location = input("Localisation (ou appuyer Entrée pour aléatoire): ").strip()
        
        required_skills = [s.strip() for s in skills.split(",")] if skills else ["Python"]
        
        offer = gen.generate_by_requirements(
            required_skills=required_skills,
            experience_level=level,
            location=location if location else None
        )
        print(format_offer_text(offer))
        
    elif choice == "6":
        print("\n🎬 DEMO: 3 OFFRES VARIÉES")
        
        # Dev Senior à Paris
        offer1 = gen.generate_by_requirements(
            required_skills=["Python", "FastAPI", "PostgreSQL"],
            experience_level="Senior",
            location="Paris"
        )
        print("\n" + "="*80)
        print("EXEMPLE 1: Développeur Senior à Paris")
        print(format_offer_text(offer1))
        
        # Designer à Lyon
        offer2 = gen.generate_batch(1, role_type="design")[0]
        print("\n" + "="*80)
        print("EXEMPLE 2: Designer")
        print(format_offer_text(offer2))
        
        # Data Scientist
        offer3 = gen.generate_batch(1, role_type="data")[0]
        print("\n" + "="*80)
        print("EXEMPLE 3: Data Scientist")
        print(format_offer_text(offer3))
        
    elif choice == "0":
        print("\n👋 Au revoir!")
        return
    else:
        print("❌ Choix invalide!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Arrêt par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
