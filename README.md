# SupMap – Interface Front-End

Ce dépôt contient l’interface utilisateur de SupMap, une application de navigation collaborative. Cette interface consomme les services API proposés par l’architecture microservices du backend.

## 🖥️ Démarrage du projet

1. Cloner ce dépot :

```bash
git clone https://github.com/Valerie015/front-mobile.git
cd front-mobile
```

Dans le répertoire du projet, exécutez les commandes suivantes :

### Installation des dépendances

```bash
npm install
```

Cette commande installe l’ensemble des dépendances nécessaires au bon fonctionnement de l’application.

### Lancement de l'application en mode développement

   ```bash
    npx expo start
   ```
### Changer le .env 
Pour savoir votre VOTRE-ADRESSE-IP regarder juste en dessous du Qrcode la premiere ligne:
    Metro waiting on exp://VOTRE-ADRESSE-IP:8081

 ```bash
    API_URL=http://VOTRE-ADRESSE-IP
   ```

## 🔗 Dépendances principales

* **React-native** : Bibliothèque principale pour la création de l’interface

## 🔐 Intégration avec les microservices

Ce front-end communique avec les microservices suivants :

* Authentification (Auth Service)
* Utilisateurs (User Service)
* Itinéraires (Route Service)
* Incidents (Incident Service)
