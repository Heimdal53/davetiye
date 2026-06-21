// Gülçin & Seyit Düğün Davetiyesi – App Controller

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG ---
    const ISTANBUL_DATE = new Date("Jun 28, 2026 13:00:00").getTime();
    const RIZE_DATE = new Date("Jul 8, 2026 19:00:00").getTime();
    const ADMIN_PASSWORD = "gulcin2026";

    // Choose which countdown to show (whichever is next)
    const now = Date.now();
    let targetDate = ISTANBUL_DATE;
    let targetLabel = "İstanbul Kına-Düğün";
    if (now > ISTANBUL_DATE) {
        targetDate = RIZE_DATE;
        targetLabel = "Rize Düğün Daveti";
    }
    const countdownTitle = document.getElementById('countdown-title');
    if (countdownTitle) countdownTitle.textContent = targetLabel;

    // --- 1. COUNTDOWN ---
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const diff = targetDate - Date.now();
        if (diff <= 0) {
            [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- 2. MUSIC ---
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let musicStarted = false;

    function toggleMusic() {
        if (audio.paused) {
            audio.play().then(() => {
                document.body.classList.add('music-playing');
                musicStarted = true;
            }).catch(() => {});
        } else {
            audio.pause();
            document.body.classList.remove('music-playing');
        }
    }
    if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

    // Auto-play on first interaction
    function autoPlayOnce() {
        if (!musicStarted) {
            audio.play().then(() => {
                document.body.classList.add('music-playing');
                musicStarted = true;
            }).catch(() => {});
        }
        document.removeEventListener('click', autoPlayOnce);
        document.removeEventListener('touchstart', autoPlayOnce);
    }
    document.addEventListener('click', autoPlayOnce);
    document.addEventListener('touchstart', autoPlayOnce);

    // --- 3. SCROLL REVEAL ---
    const scrollEls = document.querySelectorAll('.fade-in-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    scrollEls.forEach(el => observer.observe(el));

    // --- 4. GALLERY / LIGHTBOX ---
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxCap.textContent = img.alt || '';
            lightbox.classList.add('active');
        });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });

    // --- 5. GUEST COUNT BUTTONS ---
    const numBtns = document.querySelectorAll('.num-btn');
    const guestsInput = document.getElementById('rsvp-guests');
    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            numBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (guestsInput) guestsInput.value = btn.dataset.value;
        });
    });

    // --- 6. RSVP FORM ---
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success-message');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('rsvp-name').value.trim();
            if (!name) return;
            const istStatus = document.querySelector('input[name="rsvp-ist-status"]:checked')?.value || 'Belirtilmedi';
            const rizeStatus = document.querySelector('input[name="rsvp-rize-status"]:checked')?.value || 'Belirtilmedi';
            const guests = guestsInput?.value || '1';
            const note = document.getElementById('rsvp-note')?.value.trim() || '';

            const entry = {
                id: Date.now(),
                date: new Date().toLocaleDateString('tr-TR'),
                name, istStatus, rizeStatus, guests, note
            };
            const list = JSON.parse(localStorage.getItem('rsvp_entries') || '[]');
            list.push(entry);
            localStorage.setItem('rsvp_entries', JSON.stringify(list));

            rsvpForm.reset();
            numBtns.forEach(b => b.classList.remove('active'));
            numBtns[0]?.classList.add('active');
            if (guestsInput) guestsInput.value = '1';

            rsvpSuccess.classList.remove('hidden');
            setTimeout(() => rsvpSuccess.classList.add('hidden'), 4000);
        });
    }

    // --- 7. GUESTBOOK ---
    const guestForm = document.getElementById('guestbook-form');
    const wishesWall = document.getElementById('wishes-wall');

    function renderWishes() {
        const wishes = JSON.parse(localStorage.getItem('guestbook_entries') || '[]');
        if (!wishesWall) return;
        wishesWall.innerHTML = wishes.length === 0
            ? '<p style="text-align:center;color:var(--color-muted);font-size:0.8rem;">Henüz mesaj yok. İlk yazan siz olun!</p>'
            : wishes.map(w => `<div class="wish-card"><strong>${escHtml(w.name)}</strong><p>${escHtml(w.message)}</p></div>`).join('');
    }
    renderWishes();

    if (guestForm) {
        guestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('guest-name').value.trim();
            const message = document.getElementById('guest-message').value.trim();
            if (!name || !message) return;
            const entry = { id: Date.now(), date: new Date().toLocaleDateString('tr-TR'), name, message };
            const list = JSON.parse(localStorage.getItem('guestbook_entries') || '[]');
            list.push(entry);
            localStorage.setItem('guestbook_entries', JSON.stringify(list));
            guestForm.reset();
            renderWishes();
        });
    }

    // --- 8. CALENDAR ---
    document.querySelectorAll('.calendar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const title = btn.dataset.title;
            const desc = btn.dataset.desc || '';
            const location = btn.dataset.location || '';
            const start = btn.dataset.start.replace(/[-:]/g, '').replace('T', 'T');
            const end = btn.dataset.end.replace(/[-:]/g, '').replace('T', 'T');
            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(location)}`;
            window.open(url, '_blank');
        });
    });

    // --- 9. ADMIN PANEL ---
    const adminTrigger = document.getElementById('admin-trigger');
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.querySelector('.admin-close');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPassInput = document.getElementById('admin-password');
    const adminAuthSection = document.getElementById('admin-auth-section');
    const adminDashboard = document.getElementById('admin-dashboard-section');
    const adminAuthError = document.getElementById('admin-auth-error');

    function openAdmin() { adminModal?.classList.add('active'); }
    function closeAdmin() {
        adminModal?.classList.remove('active');
        adminAuthSection?.classList.remove('hidden');
        adminDashboard?.classList.add('hidden');
        adminAuthError?.classList.add('hidden');
        if (adminPassInput) adminPassInput.value = '';
    }
    if (adminTrigger) adminTrigger.addEventListener('click', openAdmin);
    if (adminClose) adminClose.addEventListener('click', closeAdmin);
    if (adminModal) adminModal.addEventListener('click', (e) => { if (e.target === adminModal) closeAdmin(); });

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            if (adminPassInput.value === ADMIN_PASSWORD) {
                adminAuthSection.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                adminAuthError.classList.add('hidden');
                renderAdminData();
            } else {
                adminAuthError.classList.remove('hidden');
            }
        });
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab)?.classList.add('active');
        });
    });

    function renderAdminData() {
        // RSVP
        const rsvpList = JSON.parse(localStorage.getItem('rsvp_entries') || '[]');
        const rsvpBody = document.getElementById('admin-rsvp-list');
        if (rsvpBody) {
            rsvpBody.innerHTML = rsvpList.length === 0
                ? '<tr><td colspan="7" style="text-align:center;color:var(--color-muted);">Kayıt yok</td></tr>'
                : rsvpList.map(r => `<tr>
                    <td>${escHtml(r.date)}</td><td>${escHtml(r.name)}</td>
                    <td>${escHtml(r.istStatus)}</td><td>${escHtml(r.rizeStatus)}</td>
                    <td>${escHtml(r.guests)}</td><td>${escHtml(r.note || '-')}</td>
                    <td><button class="del-btn" data-type="rsvp" data-id="${r.id}">✕</button></td>
                </tr>`).join('');
        }
        // Guestbook
        const gbList = JSON.parse(localStorage.getItem('guestbook_entries') || '[]');
        const gbBody = document.getElementById('admin-guestbook-list');
        if (gbBody) {
            gbBody.innerHTML = gbList.length === 0
                ? '<tr><td colspan="4" style="text-align:center;color:var(--color-muted);">Kayıt yok</td></tr>'
                : gbList.map(g => `<tr>
                    <td>${escHtml(g.date)}</td><td>${escHtml(g.name)}</td><td>${escHtml(g.message)}</td>
                    <td><button class="del-btn" data-type="guestbook" data-id="${g.id}">✕</button></td>
                </tr>`).join('');
        }
        // Delete handlers
        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const id = parseInt(btn.dataset.id);
                const key = type === 'rsvp' ? 'rsvp_entries' : 'guestbook_entries';
                let data = JSON.parse(localStorage.getItem(key) || '[]');
                data = data.filter(d => d.id !== id);
                localStorage.setItem(key, JSON.stringify(data));
                renderAdminData();
                if (type === 'guestbook') renderWishes();
            });
        });
    }

    // CSV Download
    const csvBtn = document.getElementById('download-rsvp-csv');
    if (csvBtn) {
        csvBtn.addEventListener('click', () => {
            const data = JSON.parse(localStorage.getItem('rsvp_entries') || '[]');
            if (data.length === 0) return alert('İndirilecek veri yok.');
            const bom = '\uFEFF';
            const header = 'Tarih;Ad Soyad;İstanbul;Rize;Kişi;Not\n';
            const rows = data.map(r => `${r.date};${r.name};${r.istStatus};${r.rizeStatus};${r.guests};${r.note || ''}`).join('\n');
            const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'lcv_listesi.csv'; a.click();
            URL.revokeObjectURL(url);
        });
    }

    // --- HELPERS ---
    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
