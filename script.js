// --- NATIVE DESKTOP MENU BAR LOGIC ---
let menuActive = false;

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
        // Ignore if clicking inside the dropdown itself
        if (e.target.closest('.dropdown')) return; 
        
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        
        if (!wasOpen) {
            item.classList.add('open');
            menuActive = true;
        } else {
            menuActive = false;
        }
    });

    item.addEventListener('mouseenter', () => {
        if (menuActive && !item.classList.contains('open')) {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
            item.classList.add('open');
        }
    });
});

// Close menu immediately if clicking completely outside the menu area
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.menu-item')) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        menuActive = false;
    }
});

// Close menu AFTER action fires if clicking a functional dropdown item
document.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-item:not(.nested-dropdown-parent)')) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('open'));
        menuActive = false;
    }
});
// -------------------------------------

// --- RIGHT CLICK CONTEXT MENU LOGIC ---
const contextMenu = document.getElementById('vlc-context-menu');
const mainDisplayArea = document.getElementById('playlist-drop-zone');

// Listen for right-click strictly on the video/display area
mainDisplayArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    
    // Calculate initial position at cursor
    let x = e.clientX;
    let y = e.clientY;
    
    // Render temporarily off-screen to calculate boundaries
    contextMenu.style.display = 'block';
    const rect = contextMenu.getBoundingClientRect();
    
    // Adjust if the menu will spill off the right or bottom of the screen
    if (x + rect.width > window.innerWidth) {
        x = window.innerWidth - rect.width;
    }
    if (y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height;
    }
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('show');
    
    // Dynamic flipped positioning for nested Aspect Ratio menu if near the edge
    const nestedMenus = contextMenu.querySelectorAll('.context-nested');
    nestedMenus.forEach(nested => {
        nested.classList.remove('flip-left');
        // If there's no room on the right (~120px wide menu), flip it to the left side
        if (x + rect.width + 120 > window.innerWidth) {
            nested.classList.add('flip-left');
        }
    });
});

// Hide context menu when clicking completely outside it
document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
    }
});

// Hide context menu AFTER an actionable item inside it is clicked
contextMenu.addEventListener('click', (e) => {
    if (e.target.closest('.context-item:not(.context-nested-parent)')) {
        contextMenu.classList.remove('show');
        contextMenu.style.display = 'none';
    }
});
// --------------------------------------

// SYSTEM LOGGING
function logSystem(msg, type = 'info') {
    const statusEl = document.getElementById('sys-log');
    if (statusEl && statusEl.innerText !== msg) {
        statusEl.innerText = msg;
    }
    console.log(`[${type.toUpperCase()}] ${msg}`);
    clearTimeout(window.logTimeout);
    window.logTimeout = setTimeout(() => {
        if (statusEl) {
            statusEl.innerText = "VLC media player";
        }
    }, 5000);
}

window.onerror = function(message, source, lineno, colno, error) {
    logSystem(`Error: ${message}`, 'error');
};

// UI DIALOG HANDLERS
function openDialog(id) { 
    document.getElementById(id).style.display = 'flex'; 
}

function closeDialog(id) { 
    document.getElementById(id).style.display = 'none'; 
}

function toggleAdvancedControls() { 
    document.getElementById('adv-controls').classList.toggle('show'); 
}

let playlistVisible = false;
function togglePlaylist() {
    playlistVisible = !playlistVisible;
    document.getElementById('playlist-view').style.display = playlistVisible ? 'flex' : 'none';
    document.getElementById('playlist-btn-toggle').classList.toggle('active-state');
}

let statusBarVisible = false;
window.toggleStatusBar = function() {
    statusBarVisible = !statusBarVisible;
    document.getElementById('status-bar').style.display = statusBarVisible ? 'flex' : 'none';
};

// EFFECTS DIALOG TAB SWITCHER
window.switchFilterTab = function(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
};

// EFFICIENT DRAGGABLE MODAL LOGIC 
let activeDialog = null;
let fsDragActive = false;
let offsetX = 0, offsetY = 0;
let fsOffsetX = 0, fsOffsetY = 0;

const fsBar = document.getElementById('fs-control-bar');
const dropZone = document.getElementById('playlist-drop-zone');

document.querySelectorAll('.dialog-header').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return; // Ignore close button clicks
        activeDialog = header.parentElement;
        
        const rect = activeDialog.getBoundingClientRect();
        activeDialog.style.transform = 'none';
        activeDialog.style.left = rect.left + 'px';
        activeDialog.style.top = rect.top + 'px';

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });
});

// Make Fullscreen bar draggable
if (fsBar) {
    fsBar.addEventListener('mousedown', (e) => {
        // Prevent dragging if clicking a button or slider
        if (e.target.closest('button, svg, .vol-slider-wrap, .fs-progress-bar-container')) return;
        fsDragActive = true;
        
        const rect = fsBar.getBoundingClientRect();
        fsBar.style.transform = 'none';
        fsBar.style.bottom = 'auto'; // Disable CSS bottom pinning when dragging starts
        fsBar.style.left = rect.left + 'px';
        fsBar.style.top = rect.top + 'px';
        
        fsOffsetX = e.clientX - rect.left;
        fsOffsetY = e.clientY - rect.top;
    });
}

// SINGLE EFFICIENT MOUSEMOVE LISTENER
document.addEventListener('mousemove', (e) => {
    if (activeDialog) {
        activeDialog.style.left = (e.clientX - offsetX) + 'px';
        activeDialog.style.top = (e.clientY - offsetY) + 'px';
    }
    
    if (fsDragActive && fsBar) {
        fsBar.style.left = (e.clientX - fsOffsetX) + 'px';
        fsBar.style.top = (e.clientY - fsOffsetY) + 'px';
    }
    
    if (isSpatialEnabled && panner) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const z = (e.clientY / window.innerHeight) * 2 - 1;
        panner.setPosition(x * 5, 0, z * 5 + 1);
    }
    
    // Trigger fullscreen bar visibility timeout reset
    if (document.fullscreenElement) {
        showFsBar();
    }
});

document.addEventListener('mouseup', () => { 
    activeDialog = null; 
    fsDragActive = false;
});

// GLOBAL STATE
const MAX_PLAYLIST_SIZE = 12;
let playlist = [];
let currentTrackIndex = -1;
let audioCtx, panner, audioSource;
let volumeGainNode = null;
let eqFilters = [];
let isSpatialEnabled = false;
let audioInitialized = false;
let subtitleTracks = [];
let ytActive = false;

const mainPlayer = document.getElementById('main-player');
const ytPlayer = document.getElementById('yt-player');
const albumArt = document.getElementById('album-art');
const idleLogo = document.getElementById('idle-logo');
const playlistList = document.getElementById('playlist-list');
const progressBar = document.getElementById('progress-fill');
const fsProgressBar = document.getElementById('fs-progress-fill');
const themePicker = document.getElementById('theme-picker');
const subTrackParent = document.getElementById('sub-track-parent');
const subTrackList = document.getElementById('sub-track-list');

// --- DYNAMIC MATHEMATICAL ASPECT RATIO ENGINE ---
window.currentAspectRatio = 'default';

window.setAspectRatio = function(ratio) {
    window.currentAspectRatio = ratio;
    
    // Update UI menu ticks
    const items = document.querySelectorAll('#aspect-ratio-list .dropdown-item, #vlc-context-menu .context-nested .context-item');
    if (items) {
        items.forEach(item => item.classList.remove('active-state'));
        const clickedItems = Array.from(items).filter(item => item.innerText.trim().toLowerCase() === ratio.toLowerCase());
        clickedItems.forEach(item => item.classList.add('active-state'));
    }
    
    if (ratio === 'default') {
        logSystem("Aspect Ratio: Default");
    } else {
        logSystem(`Aspect Ratio: ${ratio}`);
    }
    
    window.applyAspectRatio();
};

window.toggleAspectRatio = function() {
    const ratios = ['default', '16:9', '16:10', '4:3', '1:1', '2.35:1'];
    let nextIdx = (ratios.indexOf(window.currentAspectRatio) + 1) % ratios.length;
    window.setAspectRatio(ratios[nextIdx]);
};

window.applyAspectRatio = function() {
    const container = document.getElementById('playlist-drop-zone');
    const player = document.getElementById('main-player');
    const yt = document.getElementById('yt-player');
    const art = document.getElementById('album-art');
    
    if (!container) return;
    
    if (window.currentAspectRatio === 'default' || window.currentAspectRatio === 'Default') {
        // Reset to native browser scaling
        if (player) {
            player.style.width = '100%';
            player.style.height = '100%';
            player.style.objectFit = 'contain';
        }
        if (yt) {
            yt.style.width = '100%';
            yt.style.height = '100%';
        }
        if (art) {
            art.style.width = 'auto';
            art.style.height = '100%';
            art.style.maxWidth = '100%';
            art.style.objectFit = 'contain';
        }
        return;
    }
    
    // Force stretch video via calculated pixels to bypass CSS intrinsic constraints
    let ratioParts = window.currentAspectRatio.split(':');
    let targetRatio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
    
    let cWidth = container.clientWidth;
    let cHeight = container.clientHeight;
    let cRatio = cWidth / cHeight;
    
    let finalWidth, finalHeight;
    
    if (targetRatio > cRatio) {
        // Video needs to be wider than container ratio (Letterbox top/bottom)
        finalWidth = cWidth;
        finalHeight = cWidth / targetRatio;
    } else {
        // Video needs to be taller than container ratio (Pillarbox sides)
        finalHeight = cHeight;
        finalWidth = cHeight * targetRatio;
    }
    
    // Apply explicit calculated pixels and use 'fill' to stretch media perfectly into that box
    if (player) {
        player.style.width = finalWidth + 'px';
        player.style.height = finalHeight + 'px';
        player.style.objectFit = 'fill';
    }
    if (yt) {
        yt.style.width = finalWidth + 'px';
        yt.style.height = finalHeight + 'px';
    }
    if (art) {
        art.style.width = finalWidth + 'px';
        art.style.height = finalHeight + 'px';
        art.style.objectFit = 'fill';
        art.style.maxWidth = 'none';
    }
};

// Auto-recalculate aspect ratio when browser window is resized
window.addEventListener('resize', () => {
    if (window.currentAspectRatio !== 'default') {
        window.applyAspectRatio();
    }
});
// ------------------------------------------------

// STATE PERSISTENCE & VIDEO EFFECTS ENGINE
let appState = JSON.parse(localStorage.getItem('vlc_web_state')) || {
    theme: '#ff8800',
    eqGains: Array(10).fill(0),
    spatialEnabled: false
};

// ALWAYS Reset Video FX on page load so user isn't stuck with distorted video
appState.videoFilters = { 
    brightness: 100, 
    contrast: 100, 
    saturation: 100, 
    hue: 0, 
    sepia: 0 
};

if (!appState.eqGains || appState.eqGains.length < 10) {
    appState.eqGains = Array(10).fill(0);
}

document.documentElement.style.setProperty('--vlc-accent', appState.theme);
if(themePicker) {
    themePicker.value = appState.theme;
}

function saveConfig() {
    try { 
        localStorage.setItem('vlc_web_state', JSON.stringify(appState)); 
    } catch(e) {}
}

window.updateVideoFilters = function() {
    appState.videoFilters = {
        brightness: parseFloat(document.getElementById('vfx-brightness').value),
        contrast: parseFloat(document.getElementById('vfx-contrast').value),
        saturation: parseFloat(document.getElementById('vfx-saturation').value),
        hue: parseFloat(document.getElementById('vfx-hue').value),
        sepia: parseFloat(document.getElementById('vfx-sepia').value)
    };
    saveConfig();
    window.applyVideoFilters();
};

window.applyVideoFilters = function() {
    const f = appState.videoFilters;
    const filterString = `brightness(${f.brightness / 100}) contrast(${f.contrast / 100}) saturate(${f.saturation / 100}) hue-rotate(${f.hue}deg) sepia(${f.sepia / 100})`;
    
    if (mainPlayer) mainPlayer.style.filter = filterString;
    if (ytPlayer) ytPlayer.style.filter = filterString;
    if (albumArt) albumArt.style.filter = filterString;
};

window.syncVideoFiltersUI = function() {
    const f = appState.videoFilters;
    if(document.getElementById('vfx-brightness')) {
        document.getElementById('vfx-brightness').value = f.brightness !== undefined ? f.brightness : 100;
        document.getElementById('vfx-contrast').value = f.contrast !== undefined ? f.contrast : 100;
        document.getElementById('vfx-saturation').value = f.saturation !== undefined ? f.saturation : 100;
        document.getElementById('vfx-hue').value = f.hue !== undefined ? f.hue : 0;
        document.getElementById('vfx-sepia').value = f.sepia !== undefined ? f.sepia : 0;
    }
};

window.resetVideoFilters = function() {
    appState.videoFilters = { brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 };
    window.syncVideoFiltersUI();
    window.applyVideoFilters();
    logSystem("Video effects reset to default.");
};

// Initialize UI with saved state on load
window.syncVideoFiltersUI();
window.applyVideoFilters();

let fxPresetIdx = 0;
window.cycleArtFilter = function() {
    fxPresetIdx = (fxPresetIdx + 1) % 5;
    
    let b=100, c=100, s=100, h=0, sep=0;
    
    if (fxPresetIdx === 1) { 
        s = 0;
        logSystem("Video FX: Grayscale");
    } else if (fxPresetIdx === 2) { 
        c = 180;
        logSystem("Video FX: High Contrast");
    } else if (fxPresetIdx === 3) { 
        sep = 100;
        logSystem("Video FX: Sepia");
    } else if (fxPresetIdx === 4) { 
        h = 180;
        s = 200;
        logSystem("Video FX: Trippy");
    } else {
        logSystem("Video FX: Normal");
    }
    
    appState.videoFilters = { brightness: b, contrast: c, saturation: s, hue: h, sepia: sep };
    window.syncVideoFiltersUI();
    window.applyVideoFilters();
};

// Initialize Audio EQ UI immediately so it exists before audio plays
function buildEQUI() {
    const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    const container = document.getElementById('eq-sliders');
    if(!container) return;
    
    container.innerHTML = '';
    freqs.forEach((freq, i) => {
        const label = freq >= 1000 ? (freq/1000)+'k' : freq;
        const div = document.createElement('div');
        div.className = 'eq-band';
        const val = appState.eqGains[i] || 0;
        div.innerHTML = `
            <input type="range" class="vert-slider" orient="vertical" min="-12" max="12" value="${val}" oninput="window.updateEQ(${i}, this.value)">
            <label>${label}</label>
        `;
        container.appendChild(div);
    });
}
buildEQUI();

// CTRL+V YOUTUBE / NETWORK STREAM SUPPORT
document.addEventListener('paste', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const pasteText = (e.clipboardData || window.clipboardData).getData('text');
    if (pasteText && pasteText.startsWith('http')) {
        e.preventDefault();
        handleNetworkStream(pasteText);
    }
});

window.promptNetworkStream = function() {
    openDialog('stream-dialog');
    setTimeout(() => { 
        const input = document.getElementById('stream-url-input');
        if(input) {
            input.focus();
            input.select();
        }
    }, 50);
}

window.submitNetworkStream = function() {
    const url = document.getElementById('stream-url-input').value.trim();
    if (url && url.startsWith('http')) {
        handleNetworkStream(url);
        closeDialog('stream-dialog');
        document.getElementById('stream-url-input').value = '';
    } else {
        logSystem("Invalid network URL provided.", "error");
    }
}

document.getElementById('stream-url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        window.submitNetworkStream();
    }
});

function handleNetworkStream(url) {
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    
    if (ytMatch && ytMatch[1]) {
        playlist.push({ file: { name: 'YouTube Stream' }, url: url, isYouTube: true, ytId: ytMatch[1], duration: 'Live', folder: 'Network' });
        logSystem("Added YouTube Stream.");
    } else {
        playlist.push({ file: { name: url.split('/').pop() || 'Network Stream' }, url: url, duration: '--:--', folder: 'Network' });
        logSystem("Added Network Stream.");
    }
    renderPlaylist();
    if (currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
}

// CAPTURE DEVICE (CAMERA/CAPTURE CARD) SUPPORT
window.openCaptureDevice = async function() {
    try {
        // Requesting both video and audio captures webcams and external capture cards
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        playlist.push({ 
            file: { name: 'Live Capture Device' }, 
            url: '', 
            isStream: true, 
            stream: stream, 
            duration: 'Live', 
            folder: 'Devices' 
        });
        
        logSystem("Capture Device added.");
        renderPlaylist();
        if (currentTrackIndex === -1 || mainPlayer.paused) loadTrack(playlist.length - 1);
    } catch (err) {
        logSystem("Capture Device access denied or unavailable.", "error");
    }
};

// FILE HANDLING & BLOCKING UNSUPPORTED FORMATS
function processFiles(fileList) {
    try {
        const files = Array.from(fileList);
        const blockedExts = ['.mkv', '.avi', '.wmv', '.flv', '.rm', '.vob', '.mts', '.m2ts'];
        const allowedAudioVideo = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac', '.m4a'];
        let addedCount = 0;
        let rejectedCount = 0;

        files.forEach(file => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (blockedExts.includes(ext)) {
                rejectedCount++;
                return; 
            }
            
            if (file.type.startsWith('audio/') || file.type.startsWith('video/') || allowedAudioVideo.includes(ext)) {
                if (playlist.length < MAX_PLAYLIST_SIZE) {
                    playlist.push({ file: file, url: URL.createObjectURL(file), duration: '--:--', folder: 'Local Media' });
                    addedCount++;
                }
            }
        });

        if (rejectedCount > 0) {
            logSystem(`${rejectedCount} file(s) rejected. Format not supported by web browsers.`, "error");
            showOSD("Unsupported format");
        }

        if (addedCount > 0) {
            renderPlaylist();
            logSystem(`Added ${addedCount} file(s) to playlist.`);
            if (currentTrackIndex === -1) loadTrack(0);
        } else if (rejectedCount === 0) {
            logSystem("No valid media files found.", "error");
        }
    } catch (err) {
        logSystem("Error: " + err.message, "error");
    }
}

document.getElementById('media-input').addEventListener('change', (e) => {
    if(e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
    }
});

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        dropZone.classList.add('dragover'); 
    });
    dropZone.addEventListener('dragleave', (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        dropZone.classList.remove('dragover'); 
    });        
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        dropZone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    });
}

// SUBTITLE FUNCTIONALITY
function srtToVtt(srtText) {
    let vtt = "WEBVTT\n\n";
    vtt += srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vtt;
}

function loadExternalSubtitle(file) {
    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            const vttText = srtToVtt(e.target.result);
            const vttBlob = new Blob([vttText], { type: 'text/vtt' });
            const vttUrl = URL.createObjectURL(vttBlob);
            
            const oldTracks = mainPlayer.querySelectorAll('track');
            oldTracks.forEach(t => t.remove());
            
            const newTrack = document.createElement('track');
            newTrack.kind = 'subtitles';
            newTrack.srclang = 'en';
            newTrack.label = file.name;
            newTrack.src = vttUrl;
            newTrack.default = true;
            
            mainPlayer.appendChild(newTrack);
            
            setTimeout(() => {
                updateSubtitleTrackMenu();
                if (mainPlayer.textTracks.length > 0) {
                    mainPlayer.textTracks[mainPlayer.textTracks.length - 1].mode = 'showing';
                    updateSubtitleTrackMenu(); 
                }
            }, 150);

            logSystem(`Loaded external subtitles: ${file.name}`);
        };
        reader.onerror = () => logSystem("Failed to read subtitle file.", "error");
        reader.readAsText(file);
    } catch (err) {
        logSystem("Subtitle processing error: " + err.message, "error");
    }
}

document.getElementById('sub-input').addEventListener('change', (e) => {
    if(e.target.files[0]) {
        loadExternalSubtitle(e.target.files[0]);
        e.target.value = ''; 
    }
});

function updateSubtitleTrackMenu() {
    subtitleTracks = Array.from(mainPlayer.textTracks);
    const parentHasDisabledClass = subTrackParent.classList.contains('disabled');

    let activeIdx = -1;
    subtitleTracks.forEach((t, i) => { if(t.mode === 'showing') activeIdx = i; });

    subTrackList.innerHTML = `<div class="dropdown-item ${activeIdx === -1 ? 'active-state' : ''}" onclick="setSubtitleTrack(-1)">Disable</div>`;

    if (subtitleTracks.length > 0) {
        if (parentHasDisabledClass) subTrackParent.classList.remove('disabled');

        subtitleTracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = `dropdown-item ${index === activeIdx ? 'active-state' : ''}`;
            item.innerText = `${track.label || 'Track ' + (index + 1)} [${track.language || 'und'}]`;
            item.onclick = () => setSubtitleTrack(index);
            subTrackList.appendChild(item);
        });
    } else {
        if (!parentHasDisabledClass) subTrackParent.classList.add('disabled');
    }
}

window.setSubtitleTrack = function(index) {
    subtitleTracks.forEach(t => t.mode = 'hidden');
    
    if (index === -1) {
        logSystem("Subtitles disabled.");
    } else if (subtitleTracks[index]) {
        subtitleTracks[index].mode = 'showing';
        logSystem(`Switched subtitle track to: ${subtitleTracks[index].label || 'Track ' + (index + 1)}`);
    }
    updateSubtitleTrackMenu(); 
};

// PIP & FULLSCREEN FUNCTIONALITY
window.togglePiP = async function() {
    if (ytActive) { 
        logSystem("PiP not supported for YouTube streams.", "error"); 
        return; 
    }
    if (mainPlayer.style.display === 'none' || mainPlayer.readyState === 0) return;
    try {
        if (mainPlayer !== document.pictureInPictureElement) {
            await mainPlayer.requestPictureInPicture();
        } else {
            await document.exitPictureInPicture();
        }
    } catch(e) { 
        logSystem("PiP Error: " + e.message, "error"); 
    }
};

window.toggleFullscreen = function() {
    if (idleLogo.style.display !== 'none') return;
    try {
        if (!document.fullscreenElement) {
            document.getElementById('playlist-drop-zone').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    } catch(e) { 
        logSystem("Fullscreen Error: " + e.message, "error"); 
    }
};

let hideFsTimeout;
function showFsBar() {
    if (!document.fullscreenElement) return;
    
    if (fsBar) fsBar.style.opacity = '1'; 
    if (dropZone) dropZone.style.cursor = 'default';
    
    clearTimeout(hideFsTimeout);
    hideFsTimeout = setTimeout(() => {
        if (fsBar && (fsBar.matches(':hover') || fsDragActive)) { 
            showFsBar(); 
            return; 
        }
        if (fsBar) fsBar.style.opacity = '0'; 
        if (dropZone) dropZone.style.cursor = 'none';
    }, 4000);
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        if (fsBar) {
            fsBar.style.display = 'flex';
            // Reset position securely on fresh entry to Fullscreen
            fsBar.style.transform = 'translateX(-50%)';
            fsBar.style.bottom = '25px';
            fsBar.style.left = '50%';
            fsBar.style.top = 'auto';
        }
        showFsBar();
        // Recalculate Aspect Ratio when screen bounds change
        setTimeout(window.applyAspectRatio, 100);
    } else {
        if (fsBar) fsBar.style.display = 'none'; 
        if (dropZone) dropZone.style.cursor = 'default';
        // Recalculate Aspect Ratio when returning to window
        setTimeout(window.applyAspectRatio, 100);
    }
});

if (dropZone) {
    dropZone.addEventListener('dblclick', (e) => {
        if (e.target.closest('#fs-control-bar') || e.target.closest('.controls-wrapper') || e.target.closest('#playlist-view')) return;
        window.toggleFullscreen();
    });
}

// PLAYLIST REMOVAL LOGIC
window.removeTrack = function(index, e) {
    if (e) {
        e.stopPropagation(); // Prevents the click from playing the track
    }
    
    playlist.splice(index, 1);
    
    if (playlist.length === 0) {
        window.stopTrack();
        currentTrackIndex = -1;
    } else if (index === currentTrackIndex) {
        // If we deleted the currently playing track, stop it
        window.stopTrack();
        currentTrackIndex = -1;
    } else if (index < currentTrackIndex) {
        // Shift active index so the currently playing track stays selected
        currentTrackIndex--;
    }
    
    renderPlaylist();
    logSystem("Track removed from playlist.");
};

// PLAYER LOGIC
function renderPlaylist() {
    playlistList.innerHTML = '';
    document.getElementById('playlist-count').innerText = `${playlist.length}/${MAX_PLAYLIST_SIZE}`;
    
    playlist.forEach((track, i) => {
        const item = document.createElement('div');
        item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="track-info">${i+1}. ${track.file.name}</div>
            <div class="track-duration">${track.duration}</div>
            <div class="track-album">${track.folder}</div>
            <div class="remove-track-btn" title="Remove from playlist" onclick="window.removeTrack(${i}, event)"><i class="ph-bold ph-x"></i></div>
        `;
        
        // Only trigger track loading if they didn't click the "X"
        item.onclick = (e) => { 
            if (!e.target.closest('.remove-track-btn')) {
                loadTrack(i); 
                if(playlistVisible) togglePlaylist(); 
            }
        };
        playlistList.appendChild(item);
    });
}

function loadTrack(index) {
    try {
        if (index < 0 || index >= playlist.length) return;
        currentTrackIndex = index;
        const track = playlist[index];
        
        logSystem(`Playing: ${track.file.name}`);
        idleLogo.style.display = 'none';

        if (track.isYouTube) {
            ytActive = true;
            mainPlayer.pause();
            mainPlayer.style.display = 'none';
            albumArt.style.display = 'none';
            ytPlayer.style.display = 'block';
            ytPlayer.src = `https://www.youtube.com/embed/${track.ytId}?autoplay=1&enablejsapi=1&controls=1`;
            
            window.applyVideoFilters();
            window.applyAspectRatio();
            renderPlaylist();
            updatePlayIcon(true);
            return;
        }
        
        if (track.isStream) {
            ytActive = false;
            ytPlayer.style.display = 'none';
            ytPlayer.src = '';
            
            mainPlayer.pause();
            const oldTracks = mainPlayer.querySelectorAll('track');
            oldTracks.forEach(t => t.remove());

            mainPlayer.removeAttribute('src');
            mainPlayer.srcObject = track.stream; // Feed live camera/device stream
            mainPlayer.load();
            
            mainPlayer.style.display = 'block';
            albumArt.style.display = 'none';
            
            window.applyVideoFilters(); // Apply visual FX to stream
            window.applyAspectRatio();
            renderPlaylist();
            playMedia();
            return;
        }

        // Standard Video/Audio Processing
        ytActive = false;
        ytPlayer.style.display = 'none';
        ytPlayer.src = '';
        const isVideo = track.file.name ? track.file.name.toLowerCase().match(/\.(mp4|webm|ogg|m4v|mov)$/) : track.file.type && track.file.type.startsWith('video');

        mainPlayer.pause();
        mainPlayer.removeAttribute('src');
        mainPlayer.srcObject = null; // Clean up old streams
        mainPlayer.load();

        const oldTracks = mainPlayer.querySelectorAll('track');
        oldTracks.forEach(t => t.remove());

        mainPlayer.src = track.url;
        mainPlayer.load();

        if (isVideo || track.url.includes('.mp4')) {
            mainPlayer.style.display = 'block';
            albumArt.style.display = 'none';
        } else {
            mainPlayer.style.display = 'none';
            albumArt.style.display = 'block';
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
        }

        window.applyVideoFilters(); // Ensure visual FX are applied to new file
        window.applyAspectRatio();
        renderPlaylist();
        playMedia();
    } catch (err) {
        logSystem("Failed to load track: " + err.message, "error");
    }
}

async function playMedia() {
    if (ytActive) {
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        updatePlayIcon(true);
        return;
    }
    try {
        await mainPlayer.play();
        updatePlayIcon(true);
        
        if (currentVolPercent > 100 || appState.spatialEnabled || appState.eqGains.some(g=>g!==0)) {
            if (!audioInitialized) {
                initAudioChain();
            } else if (audioCtx && audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
        }
    } catch (err) {
        logSystem("Playback prevented. Click play to start.");
        updatePlayIcon(false);
    }
}

window.togglePlay = function() {
    if(playlist.length === 0) {
        document.getElementById('media-input').click();
        return;
    }
    
    if (ytActive) {
        const isPlaying = document.querySelector('#play-pause-btn i').classList.contains('ph-pause');
        if (isPlaying) {
            ytPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            updatePlayIcon(false);
        } else {
            ytPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            updatePlayIcon(true);
        }
        return;
    }

    if (mainPlayer.paused) {
        playMedia();
    } else {
        mainPlayer.pause();
        updatePlayIcon(false);
    }
}

window.stopTrack = function() {
    if (ytActive) {
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        ytPlayer.style.display = 'none';
        ytPlayer.src = '';
        ytActive = false;
    } else {
        mainPlayer.pause();
        mainPlayer.currentTime = 0;
    }
    updatePlayIcon(false);
    idleLogo.style.display = 'flex';
    mainPlayer.style.display = 'none';
    albumArt.style.display = 'none';
    document.getElementById('current-time').innerText = "--:--";
    if (fsProgressBar) document.getElementById('fs-current-time').innerText = "--:--";
    progressBar.style.width = '0%';
    if (fsProgressBar) fsProgressBar.style.width = '0%';
    updateSubtitleTrackMenu();
}

// --- NEW SHUFFLE AND LOOP LOGIC ---
let isLooping = false;
let isShuffle = false;

window.toggleLoop = function() {
    isLooping = !isLooping;
    const btn = document.getElementById('loop-btn');
    if(isLooping) btn.classList.add('active-state');
    else btn.classList.remove('active-state');
    showOSD(isLooping ? "Loop: On" : "Loop: Off");
};

window.toggleShuffle = function() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-btn');
    if(isShuffle) btn.classList.add('active-state');
    else btn.classList.remove('active-state');
    showOSD(isShuffle ? "Shuffle: On" : "Shuffle: Off");
};

window.nextTrack = function() {
    if(playlist.length === 0) return;
    let next;
    
    if(isShuffle) {
        next = Math.floor(Math.random() * playlist.length);
        // Prevent playing the exact same track if there are multiple files
        if(next === currentTrackIndex && playlist.length > 1) {
            next = (next + 1) % playlist.length;
        }
    } else {
        next = currentTrackIndex + 1;
        if (next >= playlist.length) {
            if (isLooping) {
                next = 0;
            } else {
                window.stopTrack();
                return;
            }
        }
    }
    loadTrack(next);
}

window.prevTrack = function() {
    if(playlist.length === 0) return;
    let prev = currentTrackIndex - 1;
    if (prev < 0) {
        if (isLooping) {
            prev = playlist.length - 1;
        } else {
            prev = 0; 
        }
    }
    loadTrack(prev);
}
// ------------------------------------

// --- PLAYBACK SPEED LOGIC ---
window.setPlaybackSpeed = function(speed) {
    if (ytActive) {
        logSystem("Playback speed cannot be controlled on standard YouTube embeds.", "error");
        return;
    }
    if (mainPlayer) {
        mainPlayer.playbackRate = speed;
        showOSD(`Speed: ${speed.toFixed(2)}x`);
        logSystem(`Playback speed set to ${speed}x`);
    }
};

window.increaseSpeed = function() {
    if (mainPlayer) window.setPlaybackSpeed(Math.min(mainPlayer.playbackRate + 0.25, 4.0));
};

window.decreaseSpeed = function() {
    if (mainPlayer) window.setPlaybackSpeed(Math.max(mainPlayer.playbackRate - 0.25, 0.25));
};
// ----------------------------

// --- SNAPSHOT FEATURE ---
window.takeSnapshot = function() {
    if (ytActive) {
        logSystem("Cannot take a snapshot of a YouTube iframe.", "error");
        return;
    }
    if (!mainPlayer.videoWidth) {
        logSystem("No video playing to snapshot.", "error");
        return; 
    }
    
    // Create a hidden canvas to draw the exact video frame
    const canvas = document.createElement('canvas');
    canvas.width = mainPlayer.videoWidth;
    canvas.height = mainPlayer.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Apply current user-selected visual FX to the screenshot context
    let f = appState.videoFilters;
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hue}deg) sepia(${f.sepia}%)`;
    ctx.drawImage(mainPlayer, 0, 0, canvas.width, canvas.height);
    
    // Convert to PNG and force browser download
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `vlcsnap-${new Date().toISOString().slice(0,10)}-${Date.now()}.png`;
    a.click();
    
    logSystem("Snapshot saved to your downloads folder.");
    showOSD("Snapshot Taken");
};
// ------------------------

// --- VIDEO SEEKING ENGINE (Hotkeys Arrow Left / Arrow Right) ---
window.seekVideo = function(offset) {
    if (ytActive) {
        logSystem("Seeking is currently limited on basic YouTube embeds.", "error");
        return;
    }
    
    if (mainPlayer.readyState === 0 || !mainPlayer.duration) return; // No video loaded
    
    let newTime = mainPlayer.currentTime + offset;
    
    // Clamp the time to the beginning or end of the video
    if (newTime < 0) newTime = 0;
    if (newTime > mainPlayer.duration) newTime = mainPlayer.duration;
    
    mainPlayer.currentTime = newTime;
    
    // Fire the OSD notification matching VLC behavior
    let direction = offset > 0 ? "Forward" : "Backward";
    showOSD(`${direction} ${Math.abs(offset)}s`);
};
// -------------------------------------------------------------

function updatePlayIcon(isPlaying) {
    const cls = isPlaying ? 'ph-fill ph-pause' : 'ph-fill ph-play';
    document.querySelector('#play-pause-btn i').className = cls;
    if(document.getElementById('fs-play-icon')) {
        document.getElementById('fs-play-icon').className = cls;
    }
}

mainPlayer.ontimeupdate = () => {
    if(mainPlayer.duration) {
        const pct = (mainPlayer.currentTime / mainPlayer.duration) * 100;
        progressBar.style.width = pct + '%';
        if (fsProgressBar) fsProgressBar.style.width = pct + '%';
        
        const timeStr = formatTime(mainPlayer.currentTime);
        document.getElementById('current-time').innerText = timeStr;
        if (document.getElementById('fs-current-time')) {
            document.getElementById('fs-current-time').innerText = timeStr;
        }
        
        const durStr = formatTime(mainPlayer.duration);
        if (document.getElementById('fs-combined-time')) {
            document.getElementById('fs-combined-time').innerText = `${timeStr} / ${durStr}`;
        }
    }
};

mainPlayer.onloadedmetadata = () => {
    const dur = formatTime(mainPlayer.duration);
    document.getElementById('duration').innerText = dur;
    if (document.getElementById('fs-duration')) {
        document.getElementById('fs-duration').innerText = dur;
    }
    
    if (currentTrackIndex !== -1 && playlist[currentTrackIndex] && playlist[currentTrackIndex].duration === '--:--') {
        playlist[currentTrackIndex].duration = dur;
        renderPlaylist();
    }

    setTimeout(updateSubtitleTrackMenu, 150); 
};

// ROBUST ERROR FALLBACK
mainPlayer.onerror = (e) => {
    let err = mainPlayer.error;
    if (!err || err.code === 0) return; 
    
    let msg = "Media Error";
    switch (err.code) {
        case 1: msg = "Playback aborted."; break;
        case 2: msg = "Network error."; break;
        case 3: msg = "Media decoding failed. (Unsupported codec)"; break;
        case 4: msg = "Format not natively supported by your web browser."; break;
    }
    
    logSystem(msg, "error");
    showOSD("Format Error");
    stopTrack(); 
};

mainPlayer.onended = window.nextTrack;     

const seekLogic = (e) => {
    if (ytActive) return; 
    if(mainPlayer.duration) {
        const w = e.currentTarget.clientWidth;
        mainPlayer.currentTime = (e.offsetX / w) * mainPlayer.duration;
    }
};

document.getElementById('progress-container').addEventListener('click', seekLogic);
if (document.getElementById('fs-progress-container')) {
    document.getElementById('fs-progress-container').addEventListener('click', seekLogic);
}

// --- NEW SEEK BAR TIME HOVER TOOLTIP ---
const seekTooltip = document.getElementById('seek-tooltip');

const updateSeekTooltip = (e) => {
    if (!mainPlayer.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = pos / rect.width;
    
    seekTooltip.innerText = formatTime(pct * mainPlayer.duration);
    seekTooltip.style.left = e.clientX + 'px';
    seekTooltip.style.top = rect.top + 'px'; // Visually offset upward via CSS transform
    seekTooltip.style.display = 'block';
};

const hideSeekTooltip = () => { 
    seekTooltip.style.display = 'none'; 
};

document.getElementById('progress-container').addEventListener('mousemove', updateSeekTooltip);
document.getElementById('progress-container').addEventListener('mouseleave', hideSeekTooltip);

if (document.getElementById('fs-progress-container')) {
    document.getElementById('fs-progress-container').addEventListener('mousemove', updateSeekTooltip);
    document.getElementById('fs-progress-container').addEventListener('mouseleave', hideSeekTooltip);
}
// ----------------------------------------

function formatTime(s) {
    if(!s || isNaN(s)) return "--:--";
    const m = Math.floor(s/60);
    const sc = Math.floor(s%60);
    return `${m<10?'0':''}${m}:${sc<10?'0':''}${sc}`;
}

// VOLUME & OSD LOGIC
let currentVolPercent = 100;
let savedVolPercent = 100;
let osdTimeout;

function showOSD(text) {
    const osd = document.getElementById('osd-overlay');
    if (osd.innerText !== text) osd.innerText = text;
    osd.classList.add('show');
    clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => {
        osd.classList.remove('show');
    }, 1500);
}

function setVolume(volPercent, updateSliderInput = true) {
    currentVolPercent = Math.max(0, Math.min(200, Math.round(volPercent)));

    if (currentVolPercent > 100 && !audioInitialized && mainPlayer.readyState > 0 && !mainPlayer.paused && !ytActive) {
        initAudioChain();
    }

    let physicalVal = currentVolPercent <= 100 
        ? (currentVolPercent / 100) * 75 
        : 75 + ((currentVolPercent - 100) / 100) * 25;
    
    if (updateSliderInput) {
        let mainSlider = document.getElementById('vol-slider');
        let fsSlider = document.getElementById('fs-vol-slider');
        if(mainSlider) mainSlider.value = physicalVal;
        if(fsSlider) fsSlider.value = physicalVal;
    }
    
    let mainClipRect = document.getElementById('vol-fill-clip-rect');
    let fsClipRect = document.getElementById('fs-vol-fill-clip-rect');
    
    if (mainClipRect) mainClipRect.setAttribute('width', physicalVal);
    if (fsClipRect) fsClipRect.setAttribute('width', physicalVal); 

    let lbl = document.getElementById('vol-percent-label');
    let fsLbl = document.getElementById('fs-vol-percent-label');
    if(lbl) lbl.innerText = `${currentVolPercent}%`;
    if(fsLbl) fsLbl.innerText = `${currentVolPercent}%`;

    ['wave1','wave2','wave3','fs-wave1','fs-wave2','fs-wave3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            const threshold = (i % 3 === 0) ? 0 : (i % 3 === 1) ? 40 : 80;
            el.style.display = currentVolPercent > threshold ? 'block' : 'none';
        }
    });

    if (ytActive && ytPlayer.contentWindow) {
        try { 
            ytPlayer.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${Math.min(currentVolPercent, 100)}]}`, '*'); 
        } catch(e){}
    } else {
        mainPlayer.volume = Math.min(currentVolPercent / 100, 1.0);
    }

    if (audioInitialized && volumeGainNode) {
        volumeGainNode.gain.value = currentVolPercent > 100 ? (currentVolPercent / 100) : 1.0;
    }

    showOSD(`Volume: ${currentVolPercent}%`);
}

window.handleSliderChange = function(sliderVal) {
    let physical = parseFloat(sliderVal);
    let vol = physical <= 75 
        ? (physical / 75) * 100 
        : 100 + ((physical - 75) / 25) * 100;
    
    setVolume(vol, false);
    
    // Sync secondary sliders manually to avoid feedback loop
    let mS = document.getElementById('vol-slider');
    let fS = document.getElementById('fs-vol-slider');
    if(mS && mS.value != physical) mS.value = physical;
    if(fS && fS.value != physical) fS.value = physical;
};

window.toggleMute = function() {
    if (currentVolPercent > 0) {
        savedVolPercent = currentVolPercent;
        setVolume(0, true);
    } else {
        setVolume(savedVolPercent === 0 ? 100 : savedVolPercent, true);
    }
};

if (dropZone) {
    dropZone.addEventListener('wheel', (e) => {
        e.preventDefault();
        let newVol = currentVolPercent + (e.deltaY < 0 ? 5 : -5);
        setVolume(newVol, true);
    }, { passive: false });
}

// AUDIO CONTEXT 
function initAudioChain() {
    if(audioInitialized) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();              
        audioSource = audioCtx.createMediaElementSource(mainPlayer);               

        volumeGainNode = audioCtx.createGain();
        audioSource.connect(volumeGainNode);
        let prevNode = volumeGainNode;

        volumeGainNode.gain.value = currentVolPercent > 100 ? (currentVolPercent / 100) : 1.0;

        const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        eqFilters = [];
       
        freqs.forEach((freq, i) => {
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1.5;
            filter.gain.value = appState.eqGains[i] || 0;                  
            prevNode.connect(filter);
            prevNode = filter;
            eqFilters.push(filter);
        });

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        prevNode.connect(analyser);

        panner = audioCtx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'linear';
       
        if(appState.spatialEnabled) {
            analyser.connect(panner);
            panner.connect(audioCtx.destination);
            isSpatialEnabled = true;
        } else {
            analyser.connect(audioCtx.destination);
        }

        audioInitialized = true;
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {
        logSystem("Audio Init Failed: " + e.message, "error");
    }
}

window.updateEQ = function(idx, val) {
    appState.eqGains[idx] = parseFloat(val);
    saveConfig();
    if(!audioInitialized && mainPlayer && !mainPlayer.paused && !ytActive) {
        initAudioChain();
    } else if (audioInitialized && eqFilters[idx]) {
        eqFilters[idx].gain.value = appState.eqGains[idx];
    }
};

window.toggleSpatialAudio = function() {
    if(!audioInitialized) initAudioChain();
    isSpatialEnabled = !isSpatialEnabled;
    appState.spatialEnabled = isSpatialEnabled;
    saveConfig();
    
    const lastEQNode = eqFilters[eqFilters.length - 1] || volumeGainNode;
    lastEQNode.disconnect();
    panner.disconnect();
    
    if(isSpatialEnabled) {
        lastEQNode.connect(panner);
        panner.connect(audioCtx.destination);
        logSystem("3D Spatial Audio Enabled");
    } else {
        lastEQNode.connect(audioCtx.destination);
        logSystem("3D Spatial Audio Disabled");
    }
};

// RECORDING ENGINE 
let mediaRec;
let chunks = [];
window.startRecording = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRec = new MediaRecorder(stream);
        chunks = [];
        
        mediaRec.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        
        mediaRec.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const div = document.createElement('div');
            div.innerHTML = `<a href="${url}" download="vlc_rec_${Date.now()}.webm" style="color:var(--vlc-accent);"><i class="ph ph-download"></i> vlc_rec_${Date.now()}.webm</a>`;
            document.getElementById('recordings-list').prepend(div);
            document.getElementById('no-rec-msg').style.display = 'none';
        };
        
        mediaRec.start();
        document.getElementById('rec-dot').style.display = 'block';
        document.getElementById('btn-start-rec').disabled = true;
        document.getElementById('btn-stop-rec').disabled = false;
        logSystem("Recording started.");
    } catch(e) { 
        logSystem("Microphone Access Denied.", "error"); 
    }
};

window.stopRecording = function() {
    if(mediaRec) {
        mediaRec.stop();
        document.getElementById('rec-dot').style.display = 'none';
        document.getElementById('btn-start-rec').disabled = false;
        document.getElementById('btn-stop-rec').disabled = true;
        logSystem("Recording saved. Check View -> Recorded Files.");
    }
};

// VOICE COMMANDS 
window.toggleVoice = function() {
    if(!('webkitSpeechRecognition' in window)) { 
        logSystem("Voice API not supported.", "error"); 
        return; 
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (e) => {
        const cmd = e.results[0][0].transcript.toLowerCase();
        logSystem(`Voice heard: "${cmd}"`);
        if(cmd.includes('play')) togglePlay();
        else if(cmd.includes('stop')) stopTrack();
        else if(cmd.includes('next')) nextTrack();
        else if(cmd.includes('back')) prevTrack();
    };
    
    recognition.onend = () => {
        document.getElementById('voice-status').style.display = 'none';
    };
    
    recognition.onerror = () => {
        logSystem("Voice Error.");
    };
    
    recognition.start();
    document.getElementById('adv-controls').classList.add('show');
    document.getElementById('voice-status').style.display = 'inline';
    logSystem("Listening for commands...");
};

// GLOBAL KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'KeyS' && !e.shiftKey && !e.ctrlKey) { stopTrack(); }
    else if (e.code === 'KeyS' && e.shiftKey && !e.ctrlKey) { e.preventDefault(); window.takeSnapshot(); }
    else if (e.code === 'KeyF') { toggleFullscreen(); }
    else if (e.code === 'KeyM') { toggleMute(); }
    else if (e.code === 'KeyP' && !e.ctrlKey) { prevTrack(); }
    else if (e.code === 'KeyN' && !e.ctrlKey) { nextTrack(); }
    else if (e.code === 'KeyA' && !e.ctrlKey) { e.preventDefault(); window.toggleAspectRatio(); }
    else if (e.code === 'KeyV' && !e.ctrlKey) { cycleSubtitles(); }
    else if (e.code === 'KeyC' && e.ctrlKey) { e.preventDefault(); window.openCaptureDevice(); }
    else if (e.code === 'F1') { e.preventDefault(); openDialog('about-dialog'); }
    else if (e.code === 'KeyO' && e.ctrlKey) { e.preventDefault(); document.getElementById('media-input').click(); }
    else if (e.code === 'KeyE' && e.ctrlKey) { e.preventDefault(); openDialog('eq-dialog'); }
    else if (e.code === 'KeyL' && e.ctrlKey) { e.preventDefault(); togglePlaylist(); }
    else if (e.code === 'KeyP' && e.ctrlKey) { e.preventDefault(); openDialog('theme-dialog'); }
    else if (e.code === 'KeyN' && e.ctrlKey) { e.preventDefault(); window.promptNetworkStream(); }
    else if (e.code === 'KeyV' && e.ctrlKey) { e.preventDefault(); window.promptNetworkStream(); }
    else if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(currentVolPercent + 10, true); }
    else if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(currentVolPercent - 10, true); }
    else if (e.code === 'ArrowRight') { e.preventDefault(); window.seekVideo(10); }
    else if (e.code === 'ArrowLeft') { e.preventDefault(); window.seekVideo(-10); }
    else if (e.code === 'BracketRight' && !e.ctrlKey) { e.preventDefault(); window.increaseSpeed(); }
    else if (e.code === 'BracketLeft' && !e.ctrlKey) { e.preventDefault(); window.decreaseSpeed(); }
});

// INIT VOLUME PRESET
setVolume(100);