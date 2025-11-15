import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let storage, db;

try {
    const firebaseConfig = {
        apiKey: window.FIREBASE_API_KEY,
        authDomain: window.FIREBASE_AUTH_DOMAIN,
        projectId: window.FIREBASE_PROJECT_ID,
        storageBucket: window.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID,
        appId: window.FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully for Videos');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

const uploadForm = document.getElementById('uploadVideoForm');
const videosGrid = document.getElementById('videosGrid');
const emptyState = document.getElementById('emptyState');
const progressDiv = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!storage || !db) {
        alert('Firebase no está configurado correctamente. Por favor contacta al administrador.');
        return;
    }

    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const category = document.getElementById('videoCategory').value;
    const videoFile = document.getElementById('videoFile').files[0];
    const thumbnailFile = document.getElementById('videoThumbnail').files[0];

    if (!videoFile) {
        alert('Por favor selecciona un archivo de video');
        return;
    }

    if (videoFile.size > 100 * 1024 * 1024) {
        alert('El archivo es muy grande. El tamaño máximo recomendado es 100MB');
    }

    try {
        progressDiv.style.display = 'block';
        progressText.textContent = 'Subiendo video...';

        const timestamp = Date.now();
        const videoFileName = `videos/${timestamp}_${videoFile.name}`;
        const videoRef = ref(storage, videoFileName);
        
        const uploadTask = uploadBytesResumable(videoRef, videoFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                progressBar.textContent = Math.round(progress) + '%';
            },
            (error) => {
                console.error('Error subiendo video:', error);
                alert('Error al subir el video: ' + error.message);
                progressDiv.style.display = 'none';
            },
            async () => {
                const videoURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                let thumbnailURL = null;
                if (thumbnailFile) {
                    progressText.textContent = 'Subiendo miniatura...';
                    const thumbnailFileName = `thumbnails/${timestamp}_${thumbnailFile.name}`;
                    const thumbnailRef = ref(storage, thumbnailFileName);
                    const thumbnailSnapshot = await uploadBytesResumable(thumbnailRef, thumbnailFile);
                    thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref);
                }

                progressText.textContent = 'Guardando información...';
                
                await addDoc(collection(db, 'videos'), {
                    title,
                    description,
                    category,
                    videoURL,
                    thumbnailURL,
                    timestamp: serverTimestamp(),
                    uploadDate: new Date().toISOString(),
                    views: 0
                });

                progressDiv.style.display = 'none';
                uploadForm.reset();
                alert('¡Video subido exitosamente!');
                loadVideos();
            }
        );
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el video: ' + error.message);
        progressDiv.style.display = 'none';
    }
});

async function loadVideos() {
    if (!db) return;

    try {
        const videosSnapshot = await getDocs(collection(db, 'videos'));
        const videos = [];
        
        videosSnapshot.forEach((doc) => {
            videos.push({ id: doc.id, ...doc.data() });
        });

        videos.sort((a, b) => {
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0);
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateB - dateA;
        });

        if (videos.length === 0) {
            videosGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            videosGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            videosGrid.innerHTML = videos.map(video => createVideoCard(video)).join('');
            
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', () => downloadVideo(btn.dataset.url, btn.dataset.title));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteVideo(btn.dataset.id));
            });
        }
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

function createVideoCard(video) {
    const thumbnail = video.thumbnailURL || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23000" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%2300d4ff" font-size="60" font-family="Arial"%3E▶%3C/text%3E%3C/svg%3E';
    
    const categoryLabels = {
        'sets': 'Sets en Vivo',
        'tutorials': 'Tutoriales',
        'behind': 'Detrás de Escena',
        'shows': 'Shows y Eventos',
        'otros': 'Otros'
    };

    return `
        <div class="video-card" style="background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(0, 212, 255, 0.1)); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 15px; overflow: hidden; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-10px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="video-thumbnail" style="position: relative; padding-top: 56.25%; background: #000;">
                <img src="${thumbnail}" alt="${video.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(0, 212, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="fas fa-play" style="color: #000; font-size: 24px; margin-left: 4px;"></i>
                </div>
                <div style="position: absolute; top: 10px; right: 10px;">
                    <span style="background: var(--gradient-neon); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${categoryLabels[video.category] || video.category}</span>
                </div>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: var(--accent-color); margin-bottom: 8px; font-size: 18px;">${video.title}</h3>
                ${video.description ? `<p style="color: var(--text-gray); margin-bottom: 16px; font-size: 14px; line-height: 1.5;">${video.description}</p>` : ''}
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="download-btn btn btn-primary" data-url="${video.videoURL}" data-title="${video.title}" style="flex: 1; padding: 10px;">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                    <button class="delete-btn" data-id="${video.id}" style="padding: 10px 15px; background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.5); border-radius: 8px; color: var(--primary-color); cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <video controls style="width: 100%; border-radius: 8px; background: #000;">
                    <source src="${video.videoURL}" type="video/mp4">
                </video>
            </div>
        </div>
    `;
}

function downloadVideo(url, title) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function deleteVideo(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) return;
    
    try {
        await deleteDoc(doc(db, 'videos', id));
        alert('Video eliminado exitosamente');
        loadVideos();
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Error al eliminar el video');
    }
}

if (db) {
    loadVideos();
}
