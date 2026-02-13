// --- State ---
let resumeData = {
    name: "John Doe",
    title: "StartUp Founder",
    email: "john@startup.io",
    phone: "+1 (555) 000-1234",
    summary: "Visionary entrepreneur with a track record of building scalable web applications. Passionate about AI-driven solutions and user-centric design.",
    experience: [
        {
            company: "TechNova",
            role: "Senior Developer",
            start: "2022",
            end: "Present",
            desc: "Led a team of 5 engineers to refactor the core platform, improving latency by 30%."
        }
    ],
    education: [
        {
            school: "University of Tech",
            degree: "Computer Science",
            year: "2021"
        }
    ],
    skills: ["JavaScript", "React", "Node.js", "System Design", "Leadership"],
    template: "professional",
    color: "#4f46e5"
};

let activeAiField = null;
let currentZoom = 100;

// --- Elements ---
const inputs = document.querySelectorAll('input[data-field], textarea[data-field]');
const experienceContainer = document.getElementById('experience-forms');
const educationContainer = document.getElementById('education-forms');
const skillsInput = document.getElementById('skills-input');
const skillsContainer = document.getElementById('skills-input-container');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data/State
    if (localStorage.getItem('resumeData')) {
        try {
            // resumeData = JSON.parse(localStorage.getItem('resumeData'));
            // For demo robustness we'll stick to default on reload, or logic to persist could go here.
        } catch (e) { }
    }

    populateForms();
    renderPreview();
    updateColor(resumeData.color);
    updateProgress();
    initPanelResizer();
    initParticles();
    initSilkScroll();
    initRippleEffects();
    initMagneticHover();
    initSpringButtons();
    initMobileUI();

    // 2. Static Inputs
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.dataset.field;
            resumeData[field] = e.target.value;
            renderPreview();
            updateProgress();
        });
    });

    // 3. Dynamic Lists
    document.getElementById('add-experience').addEventListener('click', () => addExperienceItem());
    document.getElementById('add-education').addEventListener('click', () => addEducationItem());

    // 4. Drag & Drop (SortableJS)
    new Sortable(experienceContainer, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            // Reorder Data based on DOM
            const newOrder = [];
            experienceContainer.querySelectorAll('.experience-item').forEach(item => {
                const index = item.dataset.index;
                // Note: This logic assumes simple reordering. 
                // A robust way: rebuild array from input values in the DOM order.
                // Or simplified: Just re-read the DOM inputs into the state.
                // Let's re-read DOM to State to be safe.
                newOrder.push(scrapeExperienceItem(item));
            });
            resumeData.experience = newOrder;
            // Re-render forms to ensure indices match logic if needed (optional)
            // populateForms(); 
            renderPreview();
        }
    });

    new Sortable(educationContainer, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            const newOrder = [];
            educationContainer.querySelectorAll('.education-item').forEach(item => {
                newOrder.push(scrapeEducationItem(item));
            });
            resumeData.education = newOrder;
            renderPreview();
        }
    });

    // 5. Toolbar Actions
    document.getElementById('download-pdf').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('template-select').addEventListener('change', (e) => {
        resumeData.template = e.target.value;
        const preview = document.getElementById('resume-preview');
        preview.classList.add('template-switching');
        setTimeout(() => {
            renderPreview();
            preview.classList.remove('template-switching');
        }, 250);
        showToast(`Template: ${e.target.value}`, 'info');
    });

    const colorPicker = document.getElementById('color-picker');
    colorPicker.value = resumeData.color;
    colorPicker.addEventListener('input', (e) => {
        resumeData.color = e.target.value;
        updateColor(e.target.value);
    });

    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('import-json').addEventListener('change', importJSON);

    // 6. AI & Settings
    document.querySelectorAll('.ai-generate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openAiModal('summary', null));
    });

    // Settings listeners removed as requested

    document.getElementById('ai-run-btn').addEventListener('click', runAiGeneration);

    // 7. Skills
    skillsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            resumeData.skills.push(e.target.value.trim());
            e.target.value = '';
            renderSkillsTags();
            renderPreview();
            updateProgress();
            showToast(`Skill "${resumeData.skills[resumeData.skills.length - 1]}" added!`, 'success');
        }
    });
    renderSkillsTags();

    // 8. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.classList.add('active');
        themeToggle.querySelector('i').className = 'fa-solid fa-moon text-indigo-300';
    }
    themeToggle.addEventListener('click', () => {
        if (document.querySelector('.mode-transition-overlay')) return;
        const goingDark = !document.body.classList.contains('dark-mode');

        // Build overlay with sweep, icon, and particles
        const overlay = document.createElement('div');
        overlay.className = 'mode-transition-overlay';

        const sweep = document.createElement('div');
        sweep.className = `sweep ${goingDark ? 'to-dark' : 'to-light'}`;
        overlay.appendChild(sweep);

        const icon = document.createElement('div');
        icon.className = `mode-icon ${goingDark ? 'icon-dark' : 'icon-light'}`;
        icon.innerHTML = goingDark
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>';
        overlay.appendChild(icon);

        // Create particle burst
        const burstColors = goingDark
            ? ['#818cf8', '#6366f1', '#a78bfa', '#4f46e5', '#c7d2fe']
            : ['#fbbf24', '#f59e0b', '#fde68a', '#f97316', '#fef3c7'];
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            const angle = (i / 12) * Math.PI * 2;
            const dist = 60 + Math.random() * 40;
            particle.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
            particle.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
            particle.style.background = burstColors[i % burstColors.length];
            particle.style.animationDelay = `${0.1 + Math.random() * 0.15}s`;
            particle.style.width = `${3 + Math.random() * 4}px`;
            particle.style.height = particle.style.width;
            overlay.appendChild(particle);
        }

        document.body.appendChild(overlay);

        // Phase 1: Sweep in + icon appear
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        });

        // Phase 2: Swap theme behind the sweep
        setTimeout(() => {
            document.body.classList.toggle('dark-mode');
            themeToggle.classList.toggle('active');
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.querySelector('i').className = isDark
                ? 'fa-solid fa-moon text-indigo-300'
                : 'fa-solid fa-sun text-amber-500';
            localStorage.setItem('darkMode', isDark);
        }, 400);

        // Phase 3: Sweep out to reveal new theme
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.classList.add('sweep-out');
        }, 650);

        // Cleanup
        setTimeout(() => {
            overlay.remove();
        }, 1200);
    });
});

// --- State Helpers ---
function updateColor(color) {
    document.documentElement.style.setProperty('--primary', color);
}

function updateArrayItem(type, index, field, value) {
    resumeData[type][index][field] = value;
    renderPreview();
    updateProgress();
}

// --- Progress Tracking ---
function updateProgress() {
    const fields = ['name', 'title', 'email', 'phone', 'summary'];
    let filled = 0;
    let total = fields.length + 2; // +2 for experience & skills having items

    fields.forEach(f => { if (resumeData[f] && resumeData[f].trim()) filled++; });
    if (resumeData.experience.length > 0 && resumeData.experience[0].company) filled++;
    if (resumeData.skills.length > 0) filled++;

    const pct = Math.round((filled / total) * 100);
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('completion-text');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '% complete';
    // Mobile progress
    const barMobile = document.getElementById('progress-bar-mobile');
    const textMobile = document.getElementById('completion-text-mobile');
    if (barMobile) barMobile.style.width = pct + '%';
    if (textMobile) textMobile.textContent = pct + '% complete';
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease both';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// --- Section Toggle ---
window.toggleSection = function(header) {
    const section = header.closest('.editor-section');
    const icon = header.querySelector('.section-collapse-icon');
    section.classList.toggle('section-collapsed');
    // Bounce the icon
    icon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
}

// --- Zoom Preview ---
window.zoomPreview = function(delta) {
    if (delta === 0) { currentZoom = 100; }
    else { currentZoom = Math.max(50, Math.min(150, currentZoom + delta)); }
    const preview = document.getElementById('resume-preview');
    preview.style.transform = `scale(${currentZoom / 100})`;
    document.getElementById('zoom-label').textContent = currentZoom + '%';
}

// --- Floating Particles (smoother) ---
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['var(--primary)', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];
    for (let i = 0; i < 14; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 5 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (Math.random() * 25 + 20) + 's';
        p.style.animationDelay = (Math.random() * 20) + 's';
        container.appendChild(p);
    }
}

// --- Silk Scroll Reveal (blur-to-sharp + stagger) ---
function initSilkScroll() {
    const editor = document.getElementById('editor-panel');
    if (!editor) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger siblings that become visible around the same time
                const delay = entry.target.dataset.silkDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);
            }
        });
    }, { root: editor, threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // Watch for dynamically added form cards
    const mutObs = new MutationObserver(() => {
        const unrevealed = editor.querySelectorAll('.form-card:not(.revealed):not(.silk-reveal)');
        unrevealed.forEach((el, i) => {
            el.classList.add('silk-reveal');
            el.dataset.silkDelay = i * 60; // stagger
            observer.observe(el);
        });
    });
    mutObs.observe(editor, { childList: true, subtree: true });

    // Also observe editor sections themselves
    editor.querySelectorAll('.editor-section').forEach((section, i) => {
        section.classList.add('silk-reveal');
        section.dataset.silkDelay = i * 80;
        observer.observe(section);
    });
}

// --- Ripple Effect on Buttons (smoother) ---
function initRippleEffects() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add, .btn-primary, .toolbar-btn');
        if (!btn) return;
        btn.classList.add('ripple-container');
        const ripple = document.createElement('span');
        ripple.className = 'ripple-wave';
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
}

// --- Magnetic Hover (elements attracted to cursor) ---
function initMagneticHover() {
    const magneticElements = document.querySelectorAll(
        '.btn-primary, .btn-add, .toolbar-btn, .color-picker-wrapper, .theme-toggle, .section-icon, .zoom-btn'
    );

    magneticElements.forEach(el => {
        el.classList.add('magnetic-hover');

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            // Strength depends on element size (smaller = more magnetic)
            const strength = Math.min(rect.width, rect.height) < 40 ? 0.35 : 0.2;
            const moveX = deltaX * strength;
            const moveY = deltaY * strength;

            el.classList.add('attracted');
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;

            // Move child content slightly more for depth
            const child = el.querySelector('i, span, .theme-toggle-knob');
            if (child) {
                child.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                child.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            el.classList.remove('attracted');
            el.style.transform = '';
            const child = el.querySelector('i, span, .theme-toggle-knob');
            if (child) {
                child.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
                child.style.transform = '';
            }
        });
    });

    // Editor sections: gentle tilt on hover (softer than before)
    document.querySelectorAll('.editor-section').forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -2;
            const rotateY = (x - 0.5) * 2;
            section.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            section.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        section.addEventListener('mouseleave', () => {
            section.style.transform = '';
            section.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    });
}

// --- Spring Physics for Button Interactions ---
function initSpringButtons() {
    // Add elastic press feedback via CSS class to avoid fighting inline transforms
    const style = document.createElement('style');
    style.textContent = `
        .spring-pressed { transform: scale(0.92) !important; transition: transform 0.08s ease !important; }
        .spring-release { transition: transform 0.5s var(--spring-bounce) !important; }
    `;
    document.head.appendChild(style);

    const buttons = document.querySelectorAll('.btn-add, .btn-primary, .toolbar-btn, .zoom-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.classList.remove('spring-release');
            btn.classList.add('spring-pressed');
        });
        const release = () => {
            btn.classList.remove('spring-pressed');
            btn.classList.add('spring-release');
            setTimeout(() => btn.classList.remove('spring-release'), 500);
        };
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', () => {
            if (btn.classList.contains('spring-pressed')) release();
        });
    });
}

// --- Mobile UI ---
function initMobileUI() {
    const isMobile = () => window.innerWidth < 768;

    // Tab Switcher
    const tabEditor = document.getElementById('tab-editor');
    const tabPreview = document.getElementById('tab-preview');
    const editorPanel = document.getElementById('editor-panel');
    const previewSection = document.getElementById('preview-section');

    function switchTab(tab) {
        if (tab === 'editor') {
            editorPanel.classList.add('mobile-panel-active');
            editorPanel.classList.remove('mobile-panel-hidden', 'hidden');
            previewSection.classList.add('mobile-panel-hidden');
            previewSection.classList.remove('mobile-panel-active');
            previewSection.classList.add('hidden');
            previewSection.style.display = '';
            tabEditor.classList.add('active');
            tabPreview.classList.remove('active');
        } else {
            previewSection.classList.add('mobile-panel-active');
            previewSection.classList.remove('mobile-panel-hidden', 'hidden');
            previewSection.style.display = 'flex';
            editorPanel.classList.add('mobile-panel-hidden', 'hidden');
            editorPanel.classList.remove('mobile-panel-active');
            tabPreview.classList.add('active');
            tabEditor.classList.remove('active');
            renderPreview();
        }
    }

    if (tabEditor) tabEditor.addEventListener('click', () => switchTab('editor'));
    if (tabPreview) tabPreview.addEventListener('click', () => switchTab('preview'));

    // Initialize mobile state
    if (isMobile()) {
        switchTab('editor');
    }

    // On resize, reset panel visibility
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            editorPanel.classList.remove('mobile-panel-hidden');
            editorPanel.classList.add('mobile-panel-active');
            previewSection.classList.remove('mobile-panel-hidden');
            previewSection.style.display = '';
        }
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close on backdrop click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Sync mobile template select with desktop
    const templateMobile = document.getElementById('template-select-mobile');
    const templateDesktop = document.getElementById('template-select');
    if (templateMobile && templateDesktop) {
        templateMobile.value = templateDesktop.value;
        templateMobile.addEventListener('change', (e) => {
            templateDesktop.value = e.target.value;
            templateDesktop.dispatchEvent(new Event('change'));
        });
    }

    // Sync mobile color picker with desktop
    const colorMobile = document.getElementById('color-picker-mobile');
    const colorDesktop = document.getElementById('color-picker');
    if (colorMobile && colorDesktop) {
        colorMobile.value = colorDesktop.value;
        colorMobile.addEventListener('input', (e) => {
            colorDesktop.value = e.target.value;
            resumeData.color = e.target.value;
            updateColor(e.target.value);
        });
    }

    // Mobile PDF button
    const pdfMobile = document.getElementById('download-pdf-mobile');
    if (pdfMobile) {
        pdfMobile.addEventListener('click', () => window.print());
    }

    // Mobile export/import
    const exportMobile = document.getElementById('export-json-mobile');
    if (exportMobile) exportMobile.addEventListener('click', exportJSON);
    const importMobile = document.getElementById('import-json-mobile');
    if (importMobile) importMobile.addEventListener('change', importJSON);

    // Mobile dark mode toggle (sync with desktop)
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const themeToggleDesktop = document.getElementById('theme-toggle');
    if (themeToggleMobile) {
        // Sync initial state
        if (document.body.classList.contains('dark-mode')) {
            themeToggleMobile.classList.add('active');
            themeToggleMobile.querySelector('i').className = 'fa-solid fa-moon text-indigo-300';
        }
        themeToggleMobile.addEventListener('click', () => {
            // Trigger the desktop toggle click which handles the full transition
            themeToggleDesktop.click();
            // Sync mobile toggle UI after transition
            setTimeout(() => {
                const isDark = document.body.classList.contains('dark-mode');
                themeToggleMobile.classList.toggle('active', isDark);
                themeToggleMobile.querySelector('i').className = isDark
                    ? 'fa-solid fa-moon text-indigo-300'
                    : 'fa-solid fa-sun text-amber-500';
            }, 500);
        });
    }
}

// --- Panel Resizer ---
function initPanelResizer() {
    const resizer = document.getElementById('panel-resizer');
    const editor = document.getElementById('editor-panel');
    if (!resizer || !editor) return;
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const main = editor.parentElement;
        const mainRect = main.getBoundingClientRect();
        const pct = ((e.clientX - mainRect.left) / mainRect.width) * 100;
        const clamped = Math.max(25, Math.min(60, pct));
        editor.style.width = clamped + '%';
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

function scrapeExperienceItem(div) {
    return {
        company: div.querySelector('input[placeholder="Company"]').value,
        role: div.querySelector('input[placeholder="Role"]').value,
        start: div.querySelector('input[placeholder="Start Date"]').value,
        end: div.querySelector('input[placeholder="End Date"]').value,
        desc: div.querySelector('textarea').value
    };
}

function scrapeEducationItem(div) {
    return {
        school: div.querySelector('input[placeholder="School"]').value,
        degree: div.querySelector('input[placeholder="Degree"]').value,
        year: div.querySelector('input[placeholder="Year"]').value
    };
}

// --- Data Management ---
function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "resume_" + resumeData.name.replace(/\s+/g, '_') + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('Resume backup exported!', 'success');
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            resumeData = JSON.parse(event.target.result);
            populateForms();
            renderPreview();
            renderSkillsTags();
            updateColor(resumeData.color || '#4f46e5');
            document.getElementById('color-picker').value = resumeData.color || '#4f46e5';
            document.getElementById('template-select').value = resumeData.template || 'professional';
            showToast('Resume loaded successfully!', 'success');
        } catch (err) {
            showToast('Error parsing JSON: ' + err, 'error');
        }
    };
    reader.readAsText(file);
}

// --- Form Population ---
function populateForms() {
    document.querySelector('input[data-field="name"]').value = resumeData.name || '';
    document.querySelector('input[data-field="title"]').value = resumeData.title || '';
    document.querySelector('input[data-field="email"]').value = resumeData.email || '';
    document.querySelector('input[data-field="phone"]').value = resumeData.phone || '';
    document.querySelector('textarea[data-field="summary"]').value = resumeData.summary || '';

    // List Forms
    experienceContainer.innerHTML = '';
    resumeData.experience.forEach((item, i) => addExperienceItem(item, i));

    educationContainer.innerHTML = '';
    resumeData.education.forEach((item, i) => addEducationItem(item, i));
}

function addExperienceItem(data = null, index = null) {
    const isNew = !data;
    if (isNew) {
        data = { company: '', role: '', start: '', end: '', desc: '' };
        resumeData.experience.push(data);
        index = resumeData.experience.length - 1;
    }

    const div = document.createElement('div');
    div.className = 'experience-item form-card form-card-enter p-5 relative group mb-4';
    div.dataset.index = index;
    div.innerHTML = `
        <div class="absolute top-3 right-3 flex gap-1.5">
            <button class="text-gray-400 hover:text-primary drag-handle cursor-move w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-all"><i class="fa-solid fa-grip-vertical text-xs"></i></button>
            <button class="delete-btn text-gray-400 hover:text-red-500 w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-all" onclick="removeExperience(${index})"><i class="fa-solid fa-trash text-xs"></i></button>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3 pr-16">
            <input type="text" placeholder="Company" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.company}" oninput="updateArrayItem('experience', ${index}, 'company', this.value)">
            <input type="text" placeholder="Role" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.role}" oninput="updateArrayItem('experience', ${index}, 'role', this.value)">
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Start Date" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.start}" oninput="updateArrayItem('experience', ${index}, 'start', this.value)">
            <input type="text" placeholder="End Date" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.end}" oninput="updateArrayItem('experience', ${index}, 'end', this.value)">
        </div>
        <div>
             <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                Description
                <button class="ai-btn-glow text-xs text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-md transition-all transform hover:scale-105 normal-case tracking-normal" onclick="openAiModal('experience', ${index})">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> AI Write
                </button>
            </label>
            <textarea placeholder="Describe your achievements..." class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none resize-none h-16"
                  oninput="updateArrayItem('experience', ${index}, 'desc', this.value)">${data.desc}</textarea>
        </div>
    `;
    experienceContainer.appendChild(div);
}

function addEducationItem(data = null, index = null) {
    const isNew = !data;
    if (isNew) {
        data = { school: '', degree: '', year: '' };
        resumeData.education.push(data);
        index = resumeData.education.length - 1;
    }

    const div = document.createElement('div');
    div.className = 'education-item form-card form-card-enter p-5 relative group mb-4';
    div.dataset.index = index;
    div.innerHTML = `
        <div class="absolute top-3 right-3 flex gap-1.5">
            <button class="text-gray-400 hover:text-primary drag-handle cursor-move w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-all"><i class="fa-solid fa-grip-vertical text-xs"></i></button>
            <button class="delete-btn text-gray-400 hover:text-red-500 w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-all" onclick="removeEducation(${index})"><i class="fa-solid fa-trash text-xs"></i></button>
        </div>
        <div class="grid grid-cols-1 gap-3 mb-3 pr-16">
             <input type="text" placeholder="School" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.school}" oninput="updateArrayItem('education', ${index}, 'school', this.value)">
        </div>
        <div class="grid grid-cols-2 gap-3">
             <input type="text" placeholder="Degree" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.degree}" oninput="updateArrayItem('education', ${index}, 'degree', this.value)">
             <input type="text" placeholder="Year" class="input-interactive w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" 
                   value="${data.year}" oninput="updateArrayItem('education', ${index}, 'year', this.value)">
        </div>
    `;
    educationContainer.appendChild(div);
}

window.removeExperience = function (index) {
    const items = experienceContainer.querySelectorAll('.experience-item');
    const target = items[index];
    if (target) {
        target.classList.add('form-card-exit');
        setTimeout(() => {
            resumeData.experience.splice(index, 1);
            populateForms();
            renderPreview();
            updateProgress();
        }, 350);
    } else {
        resumeData.experience.splice(index, 1);
        populateForms();
        renderPreview();
        updateProgress();
    }
};

window.removeEducation = function (index) {
    const items = educationContainer.querySelectorAll('.education-item');
    const target = items[index];
    if (target) {
        target.classList.add('form-card-exit');
        setTimeout(() => {
            resumeData.education.splice(index, 1);
            populateForms();
            renderPreview();
            updateProgress();
        }, 350);
    } else {
        resumeData.education.splice(index, 1);
        populateForms();
        renderPreview();
        updateProgress();
    }
};

window.removeSkill = function (index) {
    resumeData.skills.splice(index, 1);
    renderSkillsTags();
    renderPreview();
}

function renderSkillsTags() {
    const tags = skillsContainer.querySelectorAll('.skill-tag');
    tags.forEach(t => t.remove());

    resumeData.skills.forEach((skill, i) => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center gap-2 shadow-sm';
        tag.style.animationDelay = (i * 40) + 'ms';
        tag.innerHTML = `
            <i class="fa-solid fa-code text-primary text-[9px] opacity-60"></i>
            ${skill}
            <button class="text-gray-300 hover:text-red-500 transition-colors" onclick="removeSkill(${i})"><i class="fa-solid fa-xmark text-[10px]"></i></button>
        `;
        skillsContainer.insertBefore(tag, skillsInput);
    });
}

// --- Render Logic ---
function renderPreview() {
    const preview = document.getElementById('resume-preview');
    const template = resumeData.template || 'professional';

    preview.className = `bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[15mm] text-gray-800 relative template-${template}`;

    if (template === 'professional') renderProfessional(preview);
    else if (template === 'modern') renderModern(preview);
    else if (template === 'minimalist') renderMinimalist(preview);
    else if (template === 'creative') renderCreative(preview);
    else if (template === 'academic') renderAcademic(preview);
}

// 1. Professional
function renderProfessional(container) {
    container.innerHTML = `
        <header class="border-b-2 border-primary pb-8 mb-8 flex justify-between items-start">
            <div>
                <h1 class="text-4xl font-bold uppercase tracking-wider text-gray-900 mb-2">${resumeData.name}</h1>
                <p class="text-xl text-primary font-medium tracking-wide">${resumeData.title}</p>
            </div>
            <div class="text-right text-sm space-y-1 text-gray-600">
                <p><i class="fa-solid fa-envelope mr-2 text-primary"></i>${resumeData.email}</p>
                <p><i class="fa-solid fa-phone mr-2 text-primary"></i>${resumeData.phone}</p>
            </div>
        </header>
        <div class="flex gap-8 flex-1">
            <div class="w-2/3 space-y-8">
                <section>
                    <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-1">Profile</h3>
                    <p class="text-gray-700 leading-relaxed text-sm">${resumeData.summary}</p>
                </section>
                <section>
                    <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-1">Experience</h3>
                    <div class="space-y-5">
                        ${resumeData.experience.map(exp => `
                            <div>
                                <div class="flex justify-between items-baseline mb-1">
                                    <h4 class="font-bold text-gray-800">${exp.company}</h4>
                                    <span class="text-xs text-gray-500 font-medium">${exp.start} - ${exp.end}</span>
                                </div>
                                <p class="text-sm text-primary font-medium mb-1">${exp.role}</p>
                                <p class="text-sm text-gray-600 leading-relaxed">${exp.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
            <div class="w-1/3 space-y-8 bg-gray-50 p-4 -my-4 rounded-lg">
                <section>
                    <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-1">Skills</h3>
                    <div class="flex flex-wrap gap-2">
                        ${resumeData.skills.map(s => `<span class="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-700 font-medium">${s}</span>`).join('')}
                    </div>
                </section>
                <section>
                    <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-1">Education</h3>
                    <div class="space-y-4">
                        ${resumeData.education.map(edu => `
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">${edu.school}</h4>
                                <p class="text-xs text-gray-600">${edu.degree}</p>
                                <p class="text-xs text-gray-500">${edu.year}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}

// 2. Modern
function renderModern(container) {
    container.classList.remove('p-[15mm]');
    container.classList.add('flex', 'p-0');
    container.innerHTML = `
        <div class="w-1/3 bg-slate-800 text-white p-8 flex flex-col modern-sidebar min-h-[297mm]">
            <div class="mb-8">
                <div class="w-32 h-32 bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">${resumeData.name.charAt(0)}</div>
                <h1 class="text-2xl font-bold text-center mb-2 leading-tight">${resumeData.name}</h1>
                <p class="text-center accent-text text-sm uppercase tracking-wider">${resumeData.title}</p>
            </div>
            <div class="space-y-8 text-sm">
                <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Contact</h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3"><i class="fa-solid fa-envelope accent-text w-4"></i><span class="font-light">${resumeData.email}</span></div>
                        <div class="flex items-center gap-3"><i class="fa-solid fa-phone accent-text w-4"></i><span class="font-light">${resumeData.phone}</span></div>
                    </div>
                </section>
                <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Skills</h3>
                    <div class="flex flex-wrap gap-2">${resumeData.skills.map(s => `<span class="bg-slate-700 px-2 py-1 rounded text-xs">${s}</span>`).join('')}</div>
                </section>
                <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Education</h3>
                    <div class="space-y-4">
                        ${resumeData.education.map(edu => `<div><h4 class="font-bold text-white">${edu.school}</h4><p class="text-slate-400">${edu.degree}</p><p class="text-slate-500 text-xs">${edu.year}</p></div>`).join('')}
                    </div>
                </section>
            </div>
        </div>
        <div class="w-2/3 p-10 bg-white">
            <section class="mb-10">
                <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2"><span class="w-8 h-1 accent-bg block"></span> Profile</h3>
                <p class="text-slate-600 leading-relaxed text-sm text-justify">${resumeData.summary}</p>
            </section>
            <section>
                <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2"><span class="w-8 h-1 accent-bg block"></span> Experience</h3>
                <div class="space-y-8 border-l-2 border-slate-100 pl-6 ml-1">
                    ${resumeData.experience.map(exp => `<div class="relative"><div class="absolute -left-[31px] top-1 w-4 h-4 bg-white border-2 accent-border rounded-full"></div><div class="flex justify-between items-baseline mb-1"><h4 class="font-bold text-lg text-slate-800">${exp.role}</h4><span class="text-xs font-bold accent-text bg-gray-50 px-2 py-1 rounded">${exp.start} - ${exp.end}</span></div><p class="text-sm font-medium text-slate-500 mb-2">${exp.company}</p><p class="text-sm text-slate-600 leading-relaxed">${exp.desc}</p></div>`).join('')}
                </div>
            </section>
        </div>
    `;
}

// 3. Minimalist
function renderMinimalist(container) {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center mb-12">
            <h1 class="text-5xl mb-4 text-gray-900 tracking-tight">${resumeData.name}</h1>
            <p class="text-sm uppercase tracking-[0.2em] text-gray-500 mb-6">${resumeData.title}</p>
            <div class="flex justify-center gap-6 text-sm text-gray-600 italic"><span>${resumeData.email}</span><span>&bull;</span><span>${resumeData.phone}</span></div>
        </div>
        <div class="max-w-3xl mx-auto space-y-10 px-8">
            <section class="text-center"><p class="text-gray-700 leading-7 italic text-lg opacity-80">"${resumeData.summary}"</p></section>
            <hr class="w-16 mx-auto border-gray-300">
            <section>
                <h3 class="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Work Experience</h3>
                <div class="space-y-8">
                    ${resumeData.experience.map(exp => `<div class="grid grid-cols-12 gap-4 text-left"><div class="col-span-3 text-right"><span class="text-xs font-bold text-gray-500 block">${exp.start} — ${exp.end}</span></div><div class="col-span-9 border-l border-gray-200 pl-6"><h4 class="font-bold text-gray-900 text-lg mb-1">${exp.role}</h4><p class="text-sm text-gray-500 italic mb-2">${exp.company}</p><p class="text-sm text-gray-700 leading-relaxed">${exp.desc}</p></div></div>`).join('')}
                </div>
            </section>
            <section>
                <h3 class="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 mt-12">Education & Skills</h3>
                <div class="grid grid-cols-2 gap-8 text-center">
                    <div>${resumeData.education.map(edu => `<div class="mb-4"><h4 class="font-bold text-gray-800">${edu.school}</h4><p class="text-sm text-gray-600 italic">${edu.degree}, ${edu.year}</p></div>`).join('')}</div>
                    <div><p class="text-sm text-gray-700 leading-loose">${resumeData.skills.join(' &bull; ')}</p></div>
                </div>
            </section>
        </div>
    `;
}

// 4. Creative (New)
function renderCreative(container) {
    container.innerHTML = `
        <header class="text-white p-10 rounded-b-[3rem] mb-10 shadow-lg relative overflow-hidden" style="background: linear-gradient(135deg, var(--primary), #818cf8);">
            <div class="relative z-10 flex justify-between items-end">
                <div>
                    <h1 class="text-5xl font-bold mb-2">${resumeData.name}</h1>
                    <p class="text-xl opacity-90">${resumeData.title}</p>
                </div>
                <div class="text-right text-sm opacity-90">
                    <p>${resumeData.email}</p>
                    <p>${resumeData.phone}</p>
                </div>
            </div>
            <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
        </header>
        
        <div class="grid grid-cols-3 gap-8">
            <div class="col-span-1 space-y-8">
                <section class="bg-gray-50 p-6 rounded-2xl">
                    <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2"><i class="fa-solid fa-code"></i> Skills</h3>
                    <div class="flex flex-wrap gap-2">
                         ${resumeData.skills.map(s => `<span class="bg-white border-primary/20 border text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">${s}</span>`).join('')}
                    </div>
                </section>
                 <section class="bg-gray-50 p-6 rounded-2xl">
                    <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2"><i class="fa-solid fa-graduation-cap"></i> Education</h3>
                    <div class="space-y-4">
                        ${resumeData.education.map(edu => `
                            <div>
                                <h4 class="font-bold text-gray-800">${edu.school}</h4>
                                <p class="text-sm text-gray-600">${edu.degree}</p>
                                <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">${edu.year}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
            
            <div class="col-span-2 space-y-8">
                <section>
                    <h3 class="section-title text-2xl font-bold text-gray-800 mb-4 px-4 border-l-4 border-primary">About Me</h3>
                    <p class="text-gray-600 leading-relaxed bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        ${resumeData.summary}
                    </p>
                </section>
                
                 <section>
                    <h3 class="section-title text-2xl font-bold text-gray-800 mb-6 px-4 border-l-4 border-primary">Experience</h3>
                    <div class="space-y-6">
                        ${resumeData.experience.map(exp => `
                            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div class="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-primary transition-colors"></div>
                                <div class="pl-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="font-bold text-gray-900 text-lg">${exp.role}</h4>
                                            <p class="text-primary font-medium">${exp.company}</p>
                                        </div>
                                        <span class="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">${exp.start} - ${exp.end}</span>
                                    </div>
                                    <p class="text-gray-600 text-sm leading-relaxed">${exp.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}

// 5. Academic
function renderAcademic(container) {
    container.classList.add('template-academic');
    container.innerHTML = `
        <div class="text-center border-b-2 header-border pb-4 mb-6">
            <h1 class="text-3xl font-bold uppercase mb-2">${resumeData.name}</h1>
            <p>${resumeData.email} | ${resumeData.phone}</p>
        </div>
        
        <div class="space-y-6">
            <section>
                <h3 class="section-header">Education</h3>
                 ${resumeData.education.map(edu => `
                    <div class="flex justify-between mb-2">
                        <div>
                            <span class="font-bold">${edu.school}</span>, ${edu.degree}
                        </div>
                        <div class="text-right">
                             ${edu.year}
                        </div>
                    </div>
                `).join('')}
            </section>
            
            <section>
                <h3 class="section-header">Professional Experience</h3>
                ${resumeData.experience.map(exp => `
                    <div class="mb-4">
                        <div class="flex justify-between font-bold">
                            <span>${exp.company} — ${exp.role}</span>
                            <span>${exp.start} – ${exp.end}</span>
                        </div>
                        <p class="text-sm mt-1 text-justify">${exp.desc}</p>
                    </div>
                `).join('')}
            </section>
            
            <section>
                <h3 class="section-header">Skills</h3>
                <p class="text-sm">${resumeData.skills.join(', ')}</p>
            </section>

             <section>
                <h3 class="section-header">Summary</h3>
                <p class="text-sm text-justify">${resumeData.summary}</p>
            </section>
        </div>
    `;
}

// --- AI Logic (Preserved) ---
window.closeModal = function (id) { document.getElementById(id).classList.add('hidden'); }
window.openAiModal = function (type, index) {
    activeAiField = { type, index };
    document.getElementById('ai-modal').classList.remove('hidden');
    document.getElementById('ai-keywords').value = '';
}

// OpenRouter API Key
const OPENROUTER_API_KEY = "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";

async function getApiKey() {
    return OPENROUTER_API_KEY;
}

async function runAiGeneration() {
    if (!activeAiField) return;
    const tone = document.getElementById('ai-tone').value;
    const keywords = document.getElementById('ai-keywords').value;
    const loadingBtn = document.getElementById('ai-run-btn');

    const originalBtnText = loadingBtn.innerHTML;
    loadingBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    loadingBtn.disabled = true;

    try {
        let generatedText = "";
        // Always use the Real API now
        const prompt = constructPrompt(activeAiField.type, tone, keywords);
        generatedText = await fetchOpenRouter(prompt);

        updateFieldWithAI(generatedText);
        closeModal('ai-modal');
    } catch (error) {
        console.error("AI Error:", error);
        showToast('AI generation failed, using fallback.', 'error');
        // Fallback
        const mockText = generateSmartMock(activeAiField.type, tone, keywords);
        updateFieldWithAI(mockText);
        closeModal('ai-modal');
    } finally {
        loadingBtn.innerHTML = originalBtnText;
        loadingBtn.disabled = false;
    }
}

function updateFieldWithAI(text) {
    if (activeAiField.type === 'summary') {
        const textarea = document.querySelector('textarea[data-field="summary"]');
        textarea.value = text;
        resumeData.summary = text;
        renderPreview();
    } else if (activeAiField.type === 'experience') {
        const index = activeAiField.index;
        updateArrayItem('experience', index, 'desc', text);
        populateForms();
    }
}

async function fetchOpenRouter(prompt) {
    const apiKey = await getApiKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.href, // Required by OpenRouter for free tier rankings
            'X-Title': 'Resume Builder App'
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 300
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API Request Failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

function constructPrompt(type, tone, keywords) {
    const jobTitle = resumeData.title || "Professional";
    const context = type === 'summary' ? `Write a resume summary for a ${jobTitle}.` : `Write a job description for a ${jobTitle}.`;
    return `${context} Tone: ${tone}. Keywords: ${keywords}. Keep it concise.`;
}

// Smart Mock (Simplified for brevity, same logic as before)
const mockPhrases = {
    professional: ["Results-oriented professional in [Field].", "Experienced [Title] driving growth."],
    energetic: ["Passionate [Title] loving innovation!", "Building the future with [Skills]."],
    executive: ["Visionary leader driving strategy.", "Senior [Title] maximizing value."],
    academic: ["Dedicated researcher in [Field].", "Published author and [Title]."], // New tone
    achievements: ["Increased efficiency by 20%.", "Led team of 10+ people."]
};

function generateSmartMock(type, tone, keywords) {
    const title = resumeData.title || "Professional";
    const templates = mockPhrases[tone] || mockPhrases.professional;
    let text = templates[Math.floor(Math.random() * templates.length)];
    text = text.replace('[Title]', title).replace('[Field]', 'Technology').replace('[Skills]', 'Java, React');
    if (keywords) text += ` Highlights: ${keywords}.`;
    else text += ` Also, ${mockPhrases.achievements[0]}`;
    return text;
}