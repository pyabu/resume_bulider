// --- State ---
const resumeData = {
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
    template: "professional"
};

let activeAiField = null; // { type: 'summary' | 'experience', index: 0 }

// --- Elements ---
const inputs = document.querySelectorAll('input[data-field], textarea[data-field]');
const experienceContainer = document.getElementById('experience-forms');
const educationContainer = document.getElementById('education-forms');
const skillsInput = document.getElementById('skills-input');
const skillsContainer = document.getElementById('skills-input-container');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Populate Initial Forms
    populateForms();

    // Render Initial Preview
    renderPreview();

    // Listeners for Static Fields
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.dataset.field;
            resumeData[field] = e.target.value;
            renderPreview();
        });
    });

    // Add Dynamic Buttons
    document.getElementById('add-experience').addEventListener('click', () => addExperienceItem());
    document.getElementById('add-education').addEventListener('click', () => addEducationItem());

    // Print
    document.getElementById('download-pdf').addEventListener('click', () => {
        window.print();
    });

    // AI Buttons (Static)
    document.querySelectorAll('.ai-generate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            openAiModal('summary', null);
        });
    });

    // Settings
    document.getElementById('open-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('hidden');
        document.getElementById('api-key-input').value = localStorage.getItem('openai_key') || '';
    });

    document.getElementById('save-settings').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value;
        localStorage.setItem('openai_key', key);
        closeModal('settings-modal');
        alert("Settings Saved!");
    });

    document.getElementById('ai-run-btn').addEventListener('click', runAiGeneration);

    // Template Selector
    const templateSelect = document.getElementById('template-select');
    templateSelect.addEventListener('change', (e) => {
        resumeData.template = e.target.value;
        renderPreview();
    });

    // Skills Input
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

// --- Modal Logic ---
window.closeModal = function (id) {
    document.getElementById(id).classList.add('hidden');
}

window.openAiModal = function (type, index) {
    activeAiField = { type, index };
    document.getElementById('ai-modal').classList.remove('hidden');
    document.getElementById('ai-keywords').value = ''; // Reset keywords
}

// --- Form Population ---
function populateForms() {
    document.querySelector('input[data-field="name"]').value = resumeData.name || '';
    document.querySelector('input[data-field="title"]').value = resumeData.title || '';
    document.querySelector('input[data-field="email"]').value = resumeData.email || '';
    document.querySelector('input[data-field="phone"]').value = resumeData.phone || '';
    document.querySelector('textarea[data-field="summary"]').value = resumeData.summary || '';

    // Clear & Re-add List Forms
    experienceContainer.innerHTML = '';
    resumeData.experience.forEach(item => addExperienceItem(item));

    educationContainer.innerHTML = '';
    resumeData.education.forEach(item => addEducationItem(item));
}

// --- Dynamic Forms ---
function addExperienceItem(data = null) {
    const isNew = !data;
    if (isNew) {
        data = { company: '', role: '', start: '', end: '', desc: '' };
        resumeData.experience.push(data);
    }

    const index = resumeData.experience.indexOf(data);
    const div = document.createElement('div');
    div.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-primary/50 transition-colors';
    div.innerHTML = `
        <button class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" onclick="removeExperience(${index})">
            <i class="fa-solid fa-trash"></i>
        </button>
        <div class="grid grid-cols-2 gap-3 mb-3">
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

function addEducationItem(data = null) {
    const isNew = !data;
    if (isNew) {
        data = { school: '', degree: '', year: '' };
        resumeData.education.push(data);
    }

    const index = resumeData.education.indexOf(data);
    const div = document.createElement('div');
    div.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-primary/50 transition-colors';
    div.innerHTML = `
         <button class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" onclick="removeEducation(${index})">
            <i class="fa-solid fa-trash"></i>
        </button>
        <div class="grid grid-cols-1 gap-3 mb-3">
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

// --- List Management ---
window.updateArrayItem = function (type, index, field, value) {
    resumeData[type][index][field] = value;
    renderPreview();
};

window.removeExperience = function (index) {
    resumeData.experience.splice(index, 1);
    populateForms(); // Re-render forms to fix indices
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
    // Keep the input, remove old tags
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

// --- Preview Renderer ---
function renderPreview() {
    const preview = document.getElementById('resume-preview');
    const template = resumeData.template || 'professional';

    // Clear and set base classes
    preview.className = `bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[15mm] text-gray-800 relative template-${template}`;

    if (template === 'professional') {
        renderProfessional(preview);
    } else if (template === 'modern') {
        renderModern(preview);
    } else if (template === 'minimalist') {
        renderMinimalist(preview);
    }
}

// --- Template 1: Professional (Original) ---
function renderProfessional(container) {
    container.innerHTML = `
        <header class="border-b-2 border-primary pb-8 mb-8 flex justify-between items-start">
            <div>
                <h1 class="text-4xl font-bold uppercase tracking-wider text-gray-900 mb-2">${resumeData.name || 'YOUR NAME'}</h1>
                <p class="text-xl text-primary font-medium tracking-wide">${resumeData.title || 'WORK TITLE'}</p>
            </div>
            <div class="text-right text-sm space-y-1 text-gray-600">
                <p><i class="fa-solid fa-envelope mr-2 text-primary"></i>${resumeData.email || 'email@example.com'}</p>
                <p><i class="fa-solid fa-phone mr-2 text-primary"></i>${resumeData.phone || '+1 234 567 890'}</p>
            </div>
        </header>

        <div class="flex gap-8 flex-1">
            <div class="w-2/3 space-y-8">
                <section>
                        <h3 class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-1">Profile</h3>
                        <p class="text-gray-700 leading-relaxed text-sm">${resumeData.summary || 'Summary goes here...'}</p>
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

// --- Template 2: Modern (Dark Side) ---
function renderModern(container) {
    container.classList.remove('p-[15mm]'); // Remove default padding
    container.classList.add('flex', 'p-0'); // Full height flex

    container.innerHTML = `
        <!-- Left Sidebar (Dark) -->
        <div class="w-1/3 bg-slate-800 text-white p-8 flex flex-col modern-sidebar min-h-[297mm]">
            <div class="mb-8">
                <!-- Placeholder Avatar -->
                <div class="w-32 h-32 bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                     ${resumeData.name.charAt(0)}
                </div>
                <h1 class="text-2xl font-bold text-center mb-2 leading-tight">${resumeData.name}</h1>
                <p class="text-center text-blue-300 text-sm uppercase tracking-wider">${resumeData.title}</p>
            </div>

            <div class="space-y-8 text-sm">
                <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Contact</h3>
                    <div class="space-y-3">
                         <div class="flex items-center gap-3">
                            <i class="fa-solid fa-envelope text-blue-400 w-4"></i>
                            <span class="font-light">${resumeData.email}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-phone text-blue-400 w-4"></i>
                            <span class="font-light">${resumeData.phone}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Skills</h3>
                    <div class="flex flex-wrap gap-2">
                         ${resumeData.skills.map(s => `<span class="bg-slate-700 px-2 py-1 rounded text-xs">${s}</span>`).join('')}
                    </div>
                </section>

                 <section>
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-2">Education</h3>
                    <div class="space-y-4">
                        ${resumeData.education.map(edu => `
                            <div>
                                <h4 class="font-bold text-white">${edu.school}</h4>
                                <p class="text-slate-400">${edu.degree}</p>
                                <p class="text-slate-500 text-xs">${edu.year}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>

        <!-- Right Content (Light) -->
        <div class="w-2/3 p-10 bg-white">
            <section class="mb-10">
                <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span class="w-8 h-1 bg-blue-500 block"></span> Profile
                </h3>
                <p class="text-slate-600 leading-relaxed text-sm text-justify">
                    ${resumeData.summary}
                </p>
            </section>

            <section>
                 <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <span class="w-8 h-1 bg-blue-500 block"></span> Experience
                </h3>
                <div class="space-y-8 border-l-2 border-slate-100 pl-6 ml-1">
                     ${resumeData.experience.map(exp => `
                        <div class="relative">
                            <div class="absolute -left-[31px] top-1 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                            <div class="flex justify-between items-baseline mb-1">
                                <h4 class="font-bold text-lg text-slate-800">${exp.role}</h4>
                                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">${exp.start} - ${exp.end}</span>
                            </div>
                             <p class="text-sm font-medium text-slate-500 mb-2">${exp.company}</p>
                            <p class="text-sm text-slate-600 leading-relaxed">${exp.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}

// --- Template 3: Minimalist (Center) ---
function renderMinimalist(container) {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center mb-12">
            <h1 class="text-5xl mb-4 text-gray-900 tracking-tight">${resumeData.name}</h1>
            <p class="text-sm uppercase tracking-[0.2em] text-gray-500 mb-6">${resumeData.title}</p>
            <div class="flex justify-center gap-6 text-sm text-gray-600 italic">
                <span>${resumeData.email}</span>
                <span>&bull;</span>
                <span>${resumeData.phone}</span>
            </div>
        </div>

        <div class="max-w-3xl mx-auto space-y-10 px-8">
            <section class="text-center">
                <p class="text-gray-700 leading-7 italic text-lg opacity-80">
                    "${resumeData.summary}"
                </p>
            </section>

            <hr class="w-16 mx-auto border-gray-300">

            <section>
                <h3 class="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Work Experience</h3>
                <div class="space-y-8">
                     ${resumeData.experience.map(exp => `
                        <div class="grid grid-cols-12 gap-4 text-left">
                            <div class="col-span-3 text-right">
                                <span class="text-xs font-bold text-gray-500 block">${exp.start} — ${exp.end}</span>
                            </div>
                            <div class="col-span-9 border-l border-gray-200 pl-6">
                                <h4 class="font-bold text-gray-900 text-lg mb-1">${exp.role}</h4>
                                <p class="text-sm text-gray-500 italic mb-2">${exp.company}</p>
                                <p class="text-sm text-gray-700 leading-relaxed">${exp.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

             <section>
                <h3 class="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 mt-12">Education & Skills</h3>
                 <div class="grid grid-cols-2 gap-8 text-center">
                    <div>
                         ${resumeData.education.map(edu => `
                            <div class="mb-4">
                                <h4 class="font-bold text-gray-800">${edu.school}</h4>
                                <p class="text-sm text-gray-600 italic">${edu.degree}, ${edu.year}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div>
                        <p class="text-sm text-gray-700 leading-loose">
                            ${resumeData.skills.join(' &bull; ')}
                        </p>
                    </div>
                 </div>
            </section>
        </div>
    `;
}


// --- ENHANCED AI LOGIC ---

async function runAiGeneration() {
    if (!activeAiField) return;

    const tone = document.getElementById('ai-tone').value;
    const keywords = document.getElementById('ai-keywords').value;
    const apiKey = localStorage.getItem('openai_key');
    const loadingBtn = document.getElementById('ai-run-btn');

    // UI Loading
    const originalBtnText = loadingBtn.innerHTML;
    loadingBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    loadingBtn.disabled = true;

    let generatedText = "";

    try {
        if (apiKey && apiKey.startsWith('sk-')) {
            // CALL REAL API
            const prompt = constructPrompt(activeAiField.type, tone, keywords);
            generatedText = await fetchOpenAI(apiKey, prompt);
        } else {
            // MOCK GENERATION
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1500));
            generatedText = generateSmartMock(activeAiField.type, tone, keywords);
        }

        // Update Field
        updateFieldWithAI(generatedText);

        // Close Modal
        closeModal('ai-modal');

    } catch (error) {
        alert("AI Error: " + error.message);
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

// --- REAL API CALL ---
async function fetchOpenAI(key, prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 150
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
}

function constructPrompt(type, tone, keywords) {
    const jobTitle = resumeData.title || "Professional";
    let context = "";

    if (type === 'summary') {
        context = `Write a professional resume summary for a ${jobTitle}.`;
    } else {
        context = `Write a bulleted job description for a ${jobTitle} role.`;
    }

    return `${context} Tone: ${tone}. Keywords to include: ${keywords}. Keep it concise and impactful.`;
}

// --- SMART MOCK ENGINE (No API Key) ---
const mockPhrases = {
    professional: [
        "Results-oriented professional with a proven track record of success in [Field]. Skilled in [Skills] and dedicated to driving organizational growth.",
        "Experienced [Title] with expertise in [Skills]. Demonstrated ability to manage complex projects and deliver results on time and under budget.",
    ],
    energetic: [
        "Passionate and creative [Title] who loves building innovative solutions! Thrives in fast-paced environments and brings energy to every project.",
        "Highly motivated [Title] ready to make an impact. I bring a unique blend of [Skills] and a can-do attitude to tackle any challenge.",
    ],
    executive: [
        "Visionary leader with [Number]+ years of experience driving strategic initiatives and operational excellence. Expertise in high-level decision making and team leadership.",
        "Senior [Title] responsible for overseeing global operations and spearheading digital transformation. committed to maximizing stakeholder value."
    ],
    achievements: [
        "Increased efficiency by 20% through process optimization.",
        "Led a cross-functional team of 10+ members.",
        "Successfully launched 3 major products to market.",
        "Awarded 'Employee of the Year' for outstanding performance."
    ]
};

function generateSmartMock(type, tone, keywords) {
    const title = resumeData.title || "Professional";

    // Select base template based on tone
    const templates = mockPhrases[tone] || mockPhrases.professional;
    let text = templates[Math.floor(Math.random() * templates.length)];

    // Inject dynamic data
    text = text.replace('[Title]', title);
    text = text.replace('[Field]', 'Technology'); // Generic fallback
    text = text.replace('[Skills]', 'strategic planning and execution');
    text = text.replace('[Number]', '10');

    // Append Keywords/Achievements if provided
    if (keywords) {
        text += ` Key highlights include: ${keywords}.`;
    } else {
        // Add a random achievement
        const achievement = mockPhrases.achievements[Math.floor(Math.random() * mockPhrases.achievements.length)];
        text += ` Also, ${achievement.toLowerCase()}`;
    }

    return text;
}
