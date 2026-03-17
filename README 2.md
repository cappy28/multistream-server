# 🎬 Serveur Multi-Stream

Stream sur Twitch + YouTube en même temps depuis ton téléphone.

## Comment ça marche

```
Téléphone (Streamlabs)
        ↓ RTMP
  Ce serveur (Railway)
      ↙        ↘
  Twitch      YouTube
```

## Déployer sur Railway

1. Mets ce code sur GitHub
2. Va sur railway.app
3. "New Project" → "Deploy from GitHub"
4. Ajoute ces variables dans "Variables" :

```
TWITCH_KEY  = ta_clé_twitch
YOUTUBE_KEY = ta_clé_youtube
```

5. Dans "Settings" → expose le port **1935**

## Configurer Streamlabs Mobile

- **Serveur RTMP** : `rtmp://TON_URL.railway.app/live`
- **Clé de stream** : `stream`

## C'est tout ! 🎉
