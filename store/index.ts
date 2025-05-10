import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { persistStore, persistReducer } from "redux-persist"
import { api } from "./api" // ton fichier api avec RTK Query
import authReducer from "./slices/auth-slice"
import appReducer from "./slices/app-slice"
import { securePersistStorage } from "./secureStorage"

// Configure persist
const persistConfig = {
    key: "root",
    storage: securePersistStorage,
    whitelist: ["auth"],       // Persiste uniquement le state.auth
    blacklist: [api.reducerPath], // Ne pas persister le cache RTK Query
};

// Combine les reducers (api, auth et app)
const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer, // Assure-toi que le path est bien configuré
    auth: authReducer, // Reducer pour l'authentification
    app: appReducer, // Reducer pour d'autres états généraux de l'application
})

// Applique la persistance
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Crée le store
export const store = configureStore({
    reducer: persistedReducer, // Utilise le reducer persisté
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/FLUSH", "persist/PAUSE", "persist/PURGE", "persit/REGISTER"], // Ignorer les actions persistées
            },
        }).concat(api.middleware), // Assure-toi d'ajouter middleware RTK Query
})

// Setup listeners pour RTK Query (nécessaire pour la gestion du cache)
setupListeners(store.dispatch)

// Crée le persistor pour Redux Persist
export const persistor = persistStore(store)

// Export des types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
