document.addEventListener('DOMContentLoaded', () => {
    const gateOverlay = document.getElementById('gateOverlay');
    const backgroundAudio = document.getElementById('backgroundAudio');
    
    const enterSite = () => {
        gateOverlay.classList.add('hidden');
        
        backgroundAudio.volume = CONFIG.audio.volume;
        backgroundAudio.play().then(() => {
            console.log('Audio started successfully');
        }).catch(error => {
            console.log('Audio autoplay failed:', error);
            setTimeout(() => {
                backgroundAudio.muted = false;
                backgroundAudio.play();
            }, 100);
        });
        
        loadRobloxData();
    };
    
    if (gateOverlay) {
        gateOverlay.addEventListener('click', enterSite);
    }
    
    loadConfigValues();
});

function loadConfigValues() {
    const displayNameEl = document.getElementById('displayName');
    const usernameEl = document.getElementById('username');

    if (displayNameEl) displayNameEl.textContent = CONFIG.profile.displayName;

    if (usernameEl && Array.isArray(CONFIG.status) && CONFIG.status.length > 0) {
        typeWriterEffect(usernameEl, CONFIG.status, 80, 1200);
    } else if (usernameEl) {
        usernameEl.textContent = CONFIG.profile.username;
    }

    const profileLink = document.querySelector('.profile-link');
    if (profileLink && CONFIG.roblox && CONFIG.roblox.profileUrl) {
        profileLink.href = CONFIG.roblox.profileUrl;
    }

    const gateTitleEl = document.querySelector('.gate-title');
    const gateTextEl = document.querySelector('.gate-text');
    if (gateTitleEl) gateTitleEl.textContent = CONFIG.gate.title;
    if (gateTextEl) gateTextEl.textContent = CONFIG.gate.subtitle;

    const verifiedCheckmark = document.querySelector('.verified-checkmark');
    if (verifiedCheckmark) verifiedCheckmark.setAttribute('data-tooltip', CONFIG.tooltips.robloxVerified);

    applyThemeColors();
    setupCursorEffects();
    if (CONFIG.effects.drawMode) {
        const theme = CONFIG.theme || {};
        const primaryColor = theme.primaryColor || "#FFFFFF";
        setupDrawMode(primaryColor);
    }
}

function applyThemeColors() {
    const theme = CONFIG.theme || {};
    let primaryColor = theme.primaryColor || "#FFFFFF";
    const backgroundColor = theme.backgroundColor || "#080808";
    let accentColor = theme.accentColor;
    
    if (primaryColor.length === 8 && primaryColor.startsWith('#')) {
        primaryColor = primaryColor.substring(0, 7);
    }
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--background-color', backgroundColor);
    
    const rgbPrimary = hexToRgb(primaryColor);
    if (rgbPrimary) {
        if (!accentColor) {
            accentColor = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.1)`;
        }
        root.style.setProperty('--accent-color', accentColor);
        
        const alphaLevels = [
            { name: '--primary-color-alpha-003', alpha: 0.03 },
            { name: '--primary-color-alpha-005', alpha: 0.05 },
            { name: '--primary-color-alpha-1', alpha: 0.1 },
            { name: '--primary-color-alpha-12', alpha: 0.12 },
            { name: '--primary-color-alpha-15', alpha: 0.15 },
            { name: '--primary-color-alpha-2', alpha: 0.2 },
            { name: '--primary-color-alpha-22', alpha: 0.22 },
            { name: '--primary-color-alpha-25', alpha: 0.25 },
            { name: '--primary-color-alpha-3', alpha: 0.3 },
            { name: '--primary-color-alpha-32', alpha: 0.32 },
            { name: '--primary-color-alpha-4', alpha: 0.4 },
            { name: '--primary-color-alpha-5', alpha: 0.5 },
            { name: '--primary-color-alpha-6', alpha: 0.6 },
            { name: '--primary-color-alpha-65', alpha: 0.65 },
            { name: '--primary-color-alpha-7', alpha: 0.7 }
        ];
        
        alphaLevels.forEach(level => {
            const colorWithAlpha = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, ${level.alpha})`;
            root.style.setProperty(level.name, colorWithAlpha);
        });
        
        const lighterColor = `rgb(${Math.min(255, rgbPrimary.r + 30)}, ${Math.min(255, rgbPrimary.g + 30)}, ${Math.min(255, rgbPrimary.b + 30)})`;
        const darkerColor = `rgb(${Math.max(0, rgbPrimary.r - 30)}, ${Math.max(0, rgbPrimary.g - 30)}, ${Math.max(0, rgbPrimary.b - 30)})`;
        
        root.style.setProperty('--primary-color-light', lighterColor);
        root.style.setProperty('--primary-color-dark', darkerColor);
    }
    
    document.body.style.setProperty('color', primaryColor);
    
    console.log('Theme applied:', { primaryColor, backgroundColor, accentColor });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function typeWriterEffect(element, phrases, speed = 80, pause = 1200) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    let maxLen = Math.max(...phrases.map(p => p.length));
    let cursorVisible = true;
    let cursorInterval;
    function renderText(txt) {
        let pad = '';
        if (txt.length < maxLen) pad = '\u00A0'.repeat(maxLen - txt.length);
        element.innerHTML = txt + '<span class="type-cursor" style="display:inline-block;width:1ch">' + (cursorVisible ? '|' : '&nbsp;') + '</span>' + pad;
    }
    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (!isDeleting) {
            renderText(currentPhrase.substring(0, charIndex + 1));
            charIndex++;
            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(type, pause);
            } else {
                setTimeout(type, speed);
            }
        } else {
            renderText(currentPhrase.substring(0, charIndex - 1));
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, speed);
            } else {
                setTimeout(type, speed / 2);
            }
        }
    }
    type();
    if (cursorInterval) clearInterval(cursorInterval);
    cursorInterval = setInterval(() => {
        cursorVisible = !cursorVisible;
        let txt = element.textContent.replace(/\|$/, '');
        renderText(txt.replace(/\u00A0/g, ''));
    }, 500);
    const observer = new MutationObserver(() => {
        if (!document.body.contains(element)) {
            clearInterval(cursorInterval);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function setupCursorEffects() {
    try {
        const effects = CONFIG.effects || {};
        const theme = CONFIG.theme || {};
        const primaryColor = theme.primaryColor || "#FFFFFF";
        let cursorType = effects.cursorType || "dot";

        document.querySelectorAll('.custom-cursor, .cursor-trail-dot, .cursor-trail-line, .click-effect-frame, .draw-canvas').forEach(e => e.remove());

        if (effects.cursorTrail && cursorType === "line") {
            let lastX = null, lastY = null;
            let line = document.createElement('canvas');
            line.className = 'cursor-trail-line';
            line.width = window.innerWidth;
            line.height = window.innerHeight;
            line.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;';
            document.body.appendChild(line);
            let ctx = line.getContext('2d');
            function trailMove(e) {
                ctx.clearRect(0,0,line.width,line.height);
                if (lastX !== null && lastY !== null) {
                    ctx.strokeStyle = primaryColor;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(e.clientX, e.clientY);
                    ctx.stroke();
                }
                lastX = e.clientX;
                lastY = e.clientY;
            }
            document.addEventListener('mousemove', trailMove);
        }

        if (effects.clickEffect) {
            document.addEventListener('click', function clickFrame(e) {
                let frame = document.createElement('div');
                frame.className = 'click-effect-frame';
                frame.style.cssText = `position:fixed;left:${e.clientX-20}px;top:${e.clientY-20}px;width:40px;height:40px;border:2px solid ${primaryColor};border-radius:50%;z-index:9999;pointer-events:none;opacity:0.8;transform:scale(0.7);transition:opacity 0.3s, transform 0.3s;`;
                document.body.appendChild(frame);
                setTimeout(()=>{
                    frame.style.opacity = '0';
                    frame.style.transform = 'scale(1.5)';
                }, 10);
                setTimeout(()=>{ frame.remove(); }, 350);
            });
        }

        if (cursorType === "dot") {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `position:fixed;width:14px;height:14px;border-radius:50%;background:${primaryColor};pointer-events:none;z-index:9999;mix-blend-mode:exclusion;left:0;top:0;transform:translate(-50%,-50%);`;
            document.body.appendChild(cursor);
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        }
        if (cursorType === "sparkles") {
            document.addEventListener('mousemove', e => {
                for (let i = 0; i < 3; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.style.cssText = `position:fixed;left:${e.clientX + (Math.random()-0.5)*16}px;top:${e.clientY + (Math.random()-0.5)*16}px;width:6px;height:6px;border-radius:50%;background:#fffbe6;box-shadow:0 0 8px #fffbe6,0 0 2px #fff;opacity:${0.7+Math.random()*0.3};pointer-events:none;z-index:9999;transition:opacity 0.5s, transform 0.5s;`;
                    document.body.appendChild(sparkle);
                    setTimeout(()=>{
                        sparkle.style.opacity = '0';
                        sparkle.style.transform = `scale(${0.5+Math.random()*0.5}) translateY(-10px)`;
                    }, 10);
                    setTimeout(()=>{ sparkle.remove(); }, 500);
                }
            });
        }
        if (cursorType === "ring") {
            const ring = document.createElement('div');
            ring.className = 'custom-cursor';
            ring.style.cssText = `position:fixed;width:32px;height:32px;border:2px solid ${primaryColor};border-radius:50%;pointer-events:none;z-index:9999;mix-blend-mode:exclusion;left:0;top:0;transform:translate(-50%,-50%);transition:border-color 0.2s;`;
            document.body.appendChild(ring);
            document.addEventListener('mousemove', e => {
                ring.style.left = e.clientX + 'px';
                ring.style.top = e.clientY + 'px';
            });
        }
        if (cursorType === "rainbow") {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `position:fixed;width:16px;height:16px;border-radius:50%;background:hsl(0,100%,70%);pointer-events:none;z-index:9999;mix-blend-mode:exclusion;left:0;top:0;transform:translate(-50%,-50%);transition:background 0.2s;`;
            document.body.appendChild(cursor);
            let hue = 0;
            setInterval(()=>{
                hue = (hue + 4) % 360;
                cursor.style.background = `hsl(${hue},100%,70%)`;
            }, 20);
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        }
    } catch (error) {
        console.warn('Cursor effects failed to load:', error);
    }
}

function setupDrawMode(primaryColor = "#c2b8b8") {
    let canvas = document.createElement('canvas');
    canvas.className = 'draw-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:auto;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    let drawing = false;
    canvas.addEventListener('mousedown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.clientX, e.clientY); });
    canvas.addEventListener('mousemove', e => { if (drawing) { ctx.lineTo(e.clientX, e.clientY); ctx.stroke(); } });
    canvas.addEventListener('mouseup', () => { drawing = false; });
    canvas.addEventListener('mouseleave', () => { drawing = false; });
    canvas.addEventListener('touchstart', e => { drawing = true; const t = e.touches[0]; ctx.beginPath(); ctx.moveTo(t.clientX, t.clientY); });
    canvas.addEventListener('touchmove', e => { if (drawing) { const t = e.touches[0]; ctx.lineTo(t.clientX, t.clientY); ctx.stroke(); } });
    canvas.addEventListener('touchend', () => { drawing = false; });
        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 10000);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
}

async function fetchWithProxy(url) {
    const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors-anywhere.herokuapp.com/',
        'https://corsproxy.io/?',
        'https://proxy.cors.sh/'
    ];
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Direct fetch failed:', error);
    }
    
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        try {
            const proxyUrl = proxy + encodeURIComponent(url);
            console.log(`Trying proxy ${i + 1}: ${proxy}`);
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (proxy.includes('allorigins') && data.contents) {
                    try {
                        return JSON.parse(data.contents);
                    } catch (e) {
                        continue;
                    }
                }
                
                return data;
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('All requests failed');
}

async function loadRobloxData() {
    const userId = CONFIG.roblox.userId;
    
    try {
        document.getElementById('robloxStatus').textContent = CONFIG.robloxSection.loadingText;
        
        const userResponse = await fetchWithProxy(`https://users.roblox.com/v1/users/${userId}`);
        if (userResponse) {
            document.getElementById('robloxUsername').textContent = `${userResponse.name || ''}`;
        }
        
        try {
            const outfitResponse = await fetchWithProxy(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            if (outfitResponse?.data?.[0]?.imageUrl) {
                document.getElementById('outfitAvatar').src = outfitResponse.data[0].imageUrl;
            }
        } catch (error) {
            console.log('Outfit loading failed:', error);
        }
        
        document.getElementById('robloxStatus').textContent = CONFIG.robloxSection.dataLoadedText;
        setTimeout(() => {
            const statusElement = document.getElementById('robloxStatus');
            statusElement.classList.add('fade-out');
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.classList.remove('fade-out');
            }, 500);
        }, 2000);
        
    } catch (error) {
        document.getElementById('robloxStatus').textContent = CONFIG.robloxSection.failedToLoadText;
    }
}

function setupEasterEgg() {
    const easterEggBtn = document.getElementById('easterEggBtn');
    const mainContainer = document.getElementById('mainContainer');
    let isInteractive = false;
    let isDragging = false;
    let dragStart = { x: 033333333333333333333333333, y: 0 };
    let containerPos = { x: 0, y: 0 };
    let draggableInstances = [];



    mainContainer.addEventListener('mousedown', (e) => {
        if (!isInteractive) return;
        isDragging = true;
        dragStart.x = e.clientX - containerPos.x;
        dragStart.y = e.clientY - containerPos.y;
        mainContainer.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !isInteractive) return;
        containerPos.x = e.clientX - dragStart.x;
        containerPos.y = e.clientY - dragStart.y;
        mainContainer.style.transform = `translate(${containerPos.x}px, ${containerPos.y}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            mainContainer.style.transition = 'all 0.3s ease';
        }
    });

    mainContainer.addEventListener('touchstart', (e) => {
        if (!isInteractive) return;
        isDragging = true;
        const touch = e.touches[0];
        dragStart.x = touch.clientX - containerPos.x;
        dragStart.y = touch.clientY - containerPos.y;
        mainContainer.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || !isInteractive) return;
        const touch = e.touches[0];
        containerPos.x = touch.clientX - dragStart.x;
        containerPos.y = touch.clientY - dragStart.y;
        mainContainer.style.transform = `translate(${containerPos.x}px, ${containerPos.y}px)`;
        e.preventDefault();
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            mainContainer.style.transition = 'all 0.3s ease';
        }
    });

    mainContainer.addEventListener('dblclick', () => {
        if (!isInteractive) return;
        containerPos = { x: 0, y: 0 };
        mainContainer.style.transform = 'translate(0, 0)';
        showNotification(CONFIG.interactive.resetText);
    });

    function makeDraggable() {
        const draggableElements = [
            document.getElementById('profileAvatar'),
            document.getElementById('displayName'),
            document.getElementById('username'),
            document.getElementById('robloxStatus'),
            document.getElementById('outfitAvatar'),
            document.querySelector('.outfit-label'),
            document.querySelector('.roblox-title'),
            document.querySelector('.roblox-header'),
            document.querySelector('.roblox-outfit'),
            document.querySelector('.stats-grid'),
            document.querySelector('.verified-checkmark'),
            document.getElementById('robloxUsername'),
            document.querySelector('.gate-title'),
            document.querySelector('.gate-text'),
            document.querySelector('.profile-info'),
            document.querySelector('.name-badges-container'),
            document.querySelector('.badges'),
            ...document.querySelectorAll('.badge'),
            ...document.querySelectorAll('.stat-card'),
            ...document.querySelectorAll('.stat-label'),
            ...document.querySelectorAll('.stat-value'),
            document.querySelector('.roblox-section'),
            document.querySelector('.profile-link')
        ];

        const profileLink = document.querySelector('.profile-link');
        if (profileLink) {
            const originalHref = profileLink.href;
            const preventClick = (e) => {
                if (isInteractive) {
                    e.preventDefault();
                    return false;
                }
            };
            profileLink.addEventListener('click', preventClick);
            
            draggableInstances.push({
                element: profileLink,
                cleanup: () => {
                    profileLink.removeEventListener('click', preventClick);
                }
            });
        }

        draggableElements.forEach(element => {
            if (!element) return;
            
            let elementPos = { x: 0, y: 0 };
            let isDraggingElement = false;
            let elementDragStart = { x: 0, y: 0 };

            const handleMouseDown = (e) => {
                if (!isInteractive) return;
                e.preventDefault();
                e.stopPropagation();
                isDraggingElement = true;
                elementDragStart.x = e.clientX - elementPos.x;
                elementDragStart.y = e.clientY - elementPos.y;
                element.style.transition = 'none';
                element.style.position = 'relative';
                element.style.zIndex = '10000';
            };

            const handleMouseMove = (e) => {
                if (!isDraggingElement || !isInteractive) return;
                elementPos.x = e.clientX - elementDragStart.x;
                elementPos.y = e.clientY - elementDragStart.y;
                element.style.transform = `translate(${elementPos.x}px, ${elementPos.y}px)`;
            };

            const handleMouseUp = (e) => {
                if (isDraggingElement) {
                    isDraggingElement = false;
                    element.style.transition = 'all 0.3s ease';
                    element.style.zIndex = '';
                }
            };

            const handleDoubleClick = (e) => {
                if (!isInteractive) return;
                e.preventDefault();
                e.stopPropagation();
                elementPos = { x: 0, y: 0 };
                element.style.transform = 'translate(0, 0)';
                element.style.position = '';
                showNotification(CONFIG.interactive.elementResetText);
            };

            element.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            element.addEventListener('dblclick', handleDoubleClick);

            draggableInstances.push({
                element,
                cleanup: () => {
                    element.removeEventListener('mousedown', handleMouseDown);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    element.removeEventListener('dblclick', handleDoubleClick);
                }
            });
        });
    }

    function cleanupDraggable() {
        draggableInstances.forEach(instance => {
            instance.cleanup();
        });
        draggableInstances = [];
    }

    function resetPositions() {
        const allElements = [
            mainContainer,
            document.getElementById('profileAvatar'),
            document.getElementById('displayName'),
            document.getElementById('username'),
            document.getElementById('robloxStatus'),
            document.getElementById('outfitAvatar'),
            document.querySelector('.outfit-label'),
            document.querySelector('.roblox-title'),
            document.querySelector('.roblox-header'),
            document.querySelector('.roblox-outfit'),
            document.querySelector('.stats-grid'),
            document.querySelector('.verified-checkmark'),
            document.getElementById('robloxUsername'),
            document.querySelector('.gate-title'),
            document.querySelector('.gate-text'),
            document.querySelector('.profile-info'),
            document.querySelector('.name-badges-container'),
            document.querySelector('.badges'),
            ...document.querySelectorAll('.badge'),
            ...document.querySelectorAll('.stat-card'),
            ...document.querySelectorAll('.stat-label'),
            ...document.querySelectorAll('.stat-value'),
            document.querySelector('.roblox-section'),
            document.querySelector('.profile-link')
        ];

        allElements.forEach(element => {
            if (element) {
                element.style.transform = 'translate(0, 0)';
                element.style.position = '';
                element.style.zIndex = '';
                element.style.transition = '';
            }
        });

        containerPos = { x: 0, y: 0 };
    }
}

function showNotification(message) {
    const theme = CONFIG.theme || {};
    const primaryColor = theme.primaryColor || "#FFFFFF";
    const rgbPrimary = hexToRgb(primaryColor);
    const primaryAlpha2 = rgbPrimary ? `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.2)` : "rgba(194, 184, 184, 0.2)";
    const primaryAlpha3 = rgbPrimary ? `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.3)` : "rgba(194, 184, 184, 0.3)";
    
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        if (notif.parentNode) {
            notif.parentNode.removeChild(notif);
        }
    });

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${primaryAlpha2};
        backdrop-filter: blur(10px);
        border: 1px solid ${primaryAlpha3};
        border-radius: 12px;
        padding: 12px 16px;
        color: ${primaryColor};
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 250px;
        pointer-events: none;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 2500);
}