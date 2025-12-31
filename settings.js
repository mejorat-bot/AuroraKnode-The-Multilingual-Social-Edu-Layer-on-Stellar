(function () {
    const config = window.AURA_CONFIG;
    let currentLang = localStorage.getItem('aura_lang') || 'es';
    let currentTheme = localStorage.getItem('aura_theme') || 'aura-dark';

    // Apply theme on load
    document.documentElement.setAttribute('data-theme', currentTheme);

    function translateDOM() {
        const langData = config.i18n[currentLang];
        if (!langData) return;

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            for (const [key, value] of Object.entries(langData)) {
                if (text === key) {
                    node.nodeValue = value;
                }
            }
        }

        // Translate placeholders
        document.querySelectorAll('input[placeholder]').forEach(input => {
            const ph = input.getAttribute('placeholder');
            if (langData[ph]) {
                input.setAttribute('placeholder', langData[ph]);
            }
        });
    }

    function injectSettingsMenu() {
        // Find sidebar - usually the first nav or a div with sidebar classes
        const sidebar = document.querySelector('nav') || document.querySelector('aside') || document.querySelector('.w-64');
        if (!sidebar) return;

        if (document.getElementById('aura-settings-item')) return;

        const settingsItem = document.createElement('div');
        settingsItem.id = 'aura-settings-item';
        settingsItem.className = 'mt-auto p-4 border-t border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group';

        const label = config.i18n[currentLang]["Configuración"] || "Configuración";

        settingsItem.innerHTML = `
            <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span class="text-sm font-medium text-slate-300 group-hover:text-white" data-i18n="Configuración">${label}</span>
            </div>
            <div id="settings-submenu" class="hidden mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-slate-500" data-i18n="Cambiar Idioma">${config.i18n[currentLang]["Cambiar Idioma"]}</label>
                    <select id="lang-select" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-indigo-500">
                        <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                        <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="nah" ${currentLang === 'nah' ? 'selected' : ''}>Náhuatl</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-slate-500" data-i18n="Cambiar Tema">${config.i18n[currentLang]["Cambiar Tema"]}</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="window.setAuraTheme('aura-dark')" class="p-2 rounded border border-slate-700 bg-slate-900 hover:border-indigo-500 text-[9px]">Aura Dark</button>
                        <button onclick="window.setAuraTheme('light-aurora')" class="p-2 rounded border border-slate-700 bg-white text-slate-900 hover:border-indigo-500 text-[9px]">Light</button>
                        <button onclick="window.setAuraTheme('solar-flare')" class="p-2 rounded border border-slate-700 bg-orange-900 hover:border-yellow-500 text-[9px]">Solar</button>
                        <button onclick="window.setAuraTheme('midnight-tech')" class="p-2 rounded border border-slate-700 bg-black text-cyan-400 hover:border-cyan-500 text-[9px]">Midnight</button>
                    </div>
                </div>
            </div>
        `;

        settingsItem.onclick = (e) => {
            const submenu = document.getElementById('settings-submenu');
            if (e.target.tagName !== 'SELECT' && !e.target.closest('button')) {
                submenu.classList.toggle('hidden');
            }
        };

        sidebar.appendChild(settingsItem);

        // Lang change event
        document.getElementById('lang-select').onchange = (e) => {
            currentLang = e.target.value;
            localStorage.setItem('aura_lang', currentLang);
            translateDOM();
            // Refresh settings labels
            location.reload(); // Quickest way to re-render React with new i18n
        };
    }

    window.setAuraTheme = function (theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('aura_theme', theme);
    };

    // Watch for DOM changes to keep translating React content
    const observer = new MutationObserver(() => {
        translateDOM();
        injectSettingsMenu();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call
    window.addEventListener('load', () => {
        translateDOM();
        injectSettingsMenu();
    });
})();
