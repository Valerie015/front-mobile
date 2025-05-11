# SupMap – Interface Front-End

Ce dépôt contient l’interface utilisateur de SupMap, une application de navigation collaborative. Cette interface consomme les services API proposés par l’architecture microservices du backend.

## 🖥️ Démarrage du projet

1. Cloner ce dépot :

```bash
git clone
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

## 🔗 Dépendances principales

* **React-native** : Bibliothèque principale pour la création de l’interface

## 🔐 Intégration avec les microservices

Ce front-end communique avec les microservices suivants :

* Authentification (Auth Service)
* Utilisateurs (User Service)
* Itinéraires (Route Service)
* Incidents (Incident Service)

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
