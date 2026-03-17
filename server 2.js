/**
 * SERVEUR MULTI-STREAM
 * ====================
 * Ton téléphone envoie le stream ici (RTMP)
 * Ce serveur le redirige vers Twitch + YouTube en même temps
 *
 * Flow :
 * Téléphone → ce serveur :1935 → Twitch
 *                               → YouTube
 */

const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');

// ── Tes clés de stream ─────────────────────────────────────────
const TWITCH_KEY  = process.env.TWITCH_KEY  || 'METS_TA_CLE_TWITCH_ICI';
const YOUTUBE_KEY = process.env.YOUTUBE_KEY || 'METS_TA_CLE_YOUTUBE_ICI';

// ── URLs des plateformes ───────────────────────────────────────
const TWITCH_URL  = `rtmp://live.twitch.tv/app/${TWITCH_KEY}`;
const YOUTUBE_URL = `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_KEY}`;

// ── Configuration du serveur RTMP ──────────────────────────────
const config = {
  rtmp: {
    port: 1935,        // Port standard RTMP
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,        // Dashboard web basique
    allow_origin: '*',
  },
};

const nms = new NodeMediaServer(config);

// ── Quand quelqu'un commence à streamer ────────────────────────
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('');
  console.log('🔴 STREAM DÉMARRÉ !');
  console.log(`📡 Reçu sur : ${StreamPath}`);
  console.log('');
  console.log('▶️  Envoi vers Twitch...');
  console.log('▶️  Envoi vers YouTube...');

  // FFmpeg redirige le flux vers les 2 plateformes
  forwardToAll(StreamPath);
});

// ── Quand le stream s'arrête ───────────────────────────────────
nms.on('donePublish', (id, StreamPath, args) => {
  console.log('');
  console.log('⬛ Stream terminé.');
  stopForwarding();
});

// ── FFmpeg : redirige vers Twitch + YouTube ────────────────────
let ffmpegProcess = null;

function forwardToAll(streamPath) {
  const inputUrl = `rtmp://127.0.0.1:1935${streamPath}`;

  const args = [
    '-i', inputUrl,

    // → Twitch
    '-c', 'copy',
    '-f', 'flv',
    TWITCH_URL,

    // → YouTube
    '-c', 'copy',
    '-f', 'flv',
    YOUTUBE_URL,
  ];

  ffmpegProcess = spawn('ffmpeg', args);

  ffmpegProcess.stderr.on('data', (data) => {
    // Décommente la ligne suivante pour voir les logs FFmpeg
    // console.log('[FFmpeg]', data.toString());
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`[FFmpeg] Processus terminé (code ${code})`);
  });

  ffmpegProcess.on('error', (err) => {
    console.error('❌ Erreur FFmpeg:', err.message);
    console.error('   → Assure-toi que FFmpeg est installé sur le serveur');
  });
}

function stopForwarding() {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGTERM');
    ffmpegProcess = null;
  }
}

// ── Démarrage ──────────────────────────────────────────────────
nms.run();

console.log('');
console.log('🎬 Serveur Multi-Stream démarré');
console.log('================================');
console.log('📡 Port RTMP  : 1935');
console.log('🌐 Dashboard  : http://localhost:8000');
console.log('');
console.log('📱 Dans Streamlabs, utilise cette URL :');
console.log('   rtmp://TON_URL_RAILWAY/live');
console.log('   Clé : stream');
console.log('');
