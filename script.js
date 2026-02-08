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

    // 2. Static Inputs
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.dataset.field;
            resumeData[field] = e.target.value;
            renderPreview();
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
        renderPreview();
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
        }
    });
    renderSkillsTags();
});

// --- State Helpers ---
function updateColor(color) {
    document.documentElement.style.setProperty('--primary', color);
}

function updateArrayItem(type, index, field, value) {
    resumeData[type][index][field] = value;
    renderPreview();
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
            alert("Resume Loaded Successfully!");
        } catch (err) {
            alert("Error parsing JSON: " + err);
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
    div.className = 'experience-item bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-primary/50 transition-colors mb-4';
    div.dataset.index = index;
    div.innerHTML = `
        <div class="absolute top-2 right-2 flex gap-2">
            <button class="text-gray-400 hover:text-primary drag-handle cursor-move"><i class="fa-solid fa-grip-vertical"></i></button>
            <button class="text-gray-400 hover:text-red-500" onclick="removeExperience(${index})"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3 pr-16">
            <input type="text" placeholder="Company" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.company}" oninput="updateArrayItem('experience', ${index}, 'company', this.value)">
            <input type="text" placeholder="Role" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.role}" oninput="updateArrayItem('experience', ${index}, 'role', this.value)">
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Start Date" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.start}" oninput="updateArrayItem('experience', ${index}, 'start', this.value)">
            <input type="text" placeholder="End Date" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.end}" oninput="updateArrayItem('experience', ${index}, 'end', this.value)">
        </div>
        <div>
             <label class="block text-xs font-medium text-gray-500 mb-1 flex justify-between">
                Description
                <button class="text-xs text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md transition-all transform hover:scale-105" onclick="openAiModal('experience', ${index})">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> AI Write
                </button>
            </label>
            <textarea placeholder="Did amazing things..." class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none resize-none h-16"
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
    div.className = 'education-item bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-primary/50 transition-colors mb-4';
    div.dataset.index = index;
    div.innerHTML = `
        <div class="absolute top-2 right-2 flex gap-2">
            <button class="text-gray-400 hover:text-primary drag-handle cursor-move"><i class="fa-solid fa-grip-vertical"></i></button>
            <button class="text-gray-400 hover:text-red-500" onclick="removeEducation(${index})"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="grid grid-cols-1 gap-3 mb-3 pr-16">
             <input type="text" placeholder="School" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.school}" oninput="updateArrayItem('education', ${index}, 'school', this.value)">
        </div>
        <div class="grid grid-cols-2 gap-3">
             <input type="text" placeholder="Degree" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.degree}" oninput="updateArrayItem('education', ${index}, 'degree', this.value)">
             <input type="text" placeholder="Year" class="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary outline-none" 
                   value="${data.year}" oninput="updateArrayItem('education', ${index}, 'year', this.value)">
        </div>
    `;
    educationContainer.appendChild(div);
}

window.removeExperience = function (index) {
    resumeData.experience.splice(index, 1);
    populateForms();
    renderPreview();
};

window.removeEducation = function (index) {
    resumeData.education.splice(index, 1);
    populateForms();
    renderPreview();
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
        tag.className = 'skill-tag bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700 flex items-center gap-2';
        tag.innerHTML = `
            ${skill}
            <button class="text-gray-400 hover:text-red-500" onclick="removeSkill(${i})"><i class="fa-solid fa-xmark"></i></button>
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

const INTEGRATED_API_KEY = "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";

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
        alert("AI Generation Failed. Switching to Smart Mock.\nError: " + error.message);
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INTEGRATED_API_KEY}`,
            'HTTP-Referer': window.location.href, // Required by OpenRouter for free tier rankings
            'X-Title': 'Resume Builder App'
        },
        body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Using a quality free model on OpenRouter
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