import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let storage, db;
let initialized = false;

async function initializePlaylistFirebase() {
    if (initialized) return;
    initialized = true;
    
    await window.firebaseReadyPromise;
    
    if (!window.firebaseApp) {
        console.error('Firebase app not initialized. Please check script.js');
        return;
    }
    
    storage = getStorage(window.firebaseApp);
    db = getFirestore(window.firebaseApp);
    
    console.log('✓ Firebase Storage and Firestore initialized for Playlist');
    
    window.registerAuthListener((user) => {
        updateUploadFormVisibility(user);
        if (db) {
            loadSongs();
        }
    });
    
    await window.authReadyPromise;
}

function updateUploadFormVisibility(user) {
    const uploadSection = document.getElementById('uploadSection');
    if (!uploadSection) return;
    
    if (user && user.email === 'nassadj9@gmail.com') {
        uploadSection.style.display = 'block';
    } else {
        uploadSection.style.display = 'none';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlaylistFirebase);
} else {
    initializePlaylistFirebase();
}

const uploadForm = document.getElementById('uploadSongForm');
const playlistGrid = document.getElementById('playlistGrid');
const emptyState = document.getElementById('emptyState');
const progressDiv = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!window.isAdmin) {
        alert('Solo el administrador puede subir canciones.');
        return;
    }
    
    if (!storage || !db) {
        alert('Firebase no está configurado correctamente. Por favor contacta al administrador.');
        return;
    }

    const title = document.getElementById('songTitle').value;
    const artist = document.getElementById('songArtist').value || 'DJ NASSA';
    const genre = document.getElementById('songGenre').value;
    const songFile = document.getElementById('songFile').files[0];
    const coverFile = document.getElementById('songCover').files[0];

    if (!songFile) {
        alert('Por favor selecciona un archivo de audio');
        return;
    }

    try {
        progressDiv.style.display = 'block';
        progressText.textContent = 'Subiendo canción...';

        const timestamp = Date.now();
        const songFileName = `songs/${timestamp}_${songFile.name}`;
        const songRef = ref(storage, songFileName);
        
        const uploadTask = uploadBytesResumable(songRef, songFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                progressBar.textContent = Math.round(progress) + '%';
            },
            (error) => {
                console.error('Error subiendo canción:', error);
                alert('Error al subir la canción: ' + error.message);
                progressDiv.style.display = 'none';
            },
            async () => {
                const songURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                let coverURL = null;
                if (coverFile) {
                    try {
                        progressText.textContent = 'Subiendo portada...';
                        const coverFileName = `covers/${timestamp}_${coverFile.name}`;
                        const coverRef = ref(storage, coverFileName);
                        
                        const { uploadBytes } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
                        const coverSnapshot = await uploadBytes(coverRef, coverFile);
                        coverURL = await getDownloadURL(coverSnapshot.ref);
                    } catch (coverError) {
                        console.error('Error subiendo portada:', coverError);
                    }
                }

                progressText.textContent = 'Guardando información...';
                
                await addDoc(collection(db, 'songs'), {
                    title,
                    artist,
                    genre,
                    songURL,
                    coverURL,
                    timestamp: serverTimestamp(),
                    uploadDate: new Date().toISOString()
                });

                progressDiv.style.display = 'none';
                uploadForm.reset();
                alert('¡Canción subida exitosamente!');
                loadSongs();
            }
        );
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir la canción: ' + error.message);
        progressDiv.style.display = 'none';
    }
});

async function loadSongs() {
    if (!db) return;

    try {
        const songsSnapshot = await getDocs(collection(db, 'songs'));
        const songs = [];
        
        songsSnapshot.forEach((doc) => {
            songs.push({ id: doc.id, ...doc.data() });
        });

        songs.sort((a, b) => {
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0);
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateB - dateA;
        });

        if (songs.length === 0) {
            playlistGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            playlistGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            playlistGrid.innerHTML = songs.map(song => createSongCard(song)).join('');
            
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', () => downloadSong(btn.dataset.url, btn.dataset.title));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteSong(btn.dataset.id));
            });
        }
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

function createSongCard(song) {
    const coverImage = song.coverURL || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23000" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%2300d4ff" font-size="60" font-family="Arial"%3E♪%3C/text%3E%3C/svg%3E';
    const isAdmin = window.isAdmin;
    
    return `
        <div class="song-card" style="background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(0, 212, 255, 0.1)); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 15px; overflow: hidden; transition: transform 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-10px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="song-cover" style="position: relative; padding-top: 100%; background: #000;">
                <img src="${coverImage}" alt="${song.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0, 0, 0, 0.9)); padding: 20px;">
                    <span style="background: var(--gradient-neon); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${song.genre}</span>
                </div>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: var(--accent-color); margin-bottom: 8px; font-size: 18px;">${song.title}</h3>
                <p style="color: var(--text-gray); margin-bottom: 16px;">${song.artist}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="download-btn btn btn-primary" data-url="${song.songURL}" data-title="${song.title}" style="flex: 1; padding: 10px;">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                    ${isAdmin ? `
                    <button class="delete-btn" data-id="${song.id}" style="padding: 10px 15px; background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.5); border-radius: 8px; color: var(--primary-color); cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
                <audio controls style="width: 100%; margin-top: 15px; border-radius: 8px;">
                    <source src="${song.songURL}" type="audio/mpeg">
                </audio>
            </div>
        </div>
    `;
}

function downloadSong(url, title) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function deleteSong(id) {
    if (!window.isAdmin) {
        alert('Solo el administrador puede eliminar canciones.');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;
    
    try {
        await deleteDoc(doc(db, 'songs', id));
        alert('Canción eliminada exitosamente');
        loadSongs();
    } catch (error) {
        console.error('Error deleting song:', error);
        alert('Error al eliminar la canción');
    }
}

