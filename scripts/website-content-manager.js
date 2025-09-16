/* Website Content Manager JS */

function initWebsiteContentManager() {
  const apiBase = '/.netlify/functions/api';

  // Elements
  const pageSelector = document.getElementById('page-selector');
  const buttonsManager = document.getElementById('buttons-manager');
  const buttonsList = document.getElementById('buttons-list');
  const buttonPreviewContainer = document.getElementById('button-preview-container');
  const addButtonBtn = document.getElementById('add-button-btn');
  const previewButtonsBtn = document.getElementById('preview-buttons-btn');

  const sectionEditor = document.getElementById('section-editor');
  const sectionTabs = document.getElementById('section-tabs');
  const sectionContent = document.getElementById('section-content');
  const saveSectionBtn = document.getElementById('save-section-btn');

  const mediaManager = document.getElementById('media-manager');
  const mediaGrid = document.getElementById('media-grid');
  const mediaTypeFilter = document.getElementById('media-type-filter');
  const mediaFolderFilter = document.getElementById('media-folder-filter');
  const mediaSearch = document.getElementById('media-search');
  const uploadMediaBtn = document.getElementById('upload-media-btn');

  const buttonModal = document.getElementById('button-modal');
  const closeButtonModal = document.getElementById('close-button-modal');
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');
  const buttonForm = document.getElementById('button-form');
  const buttonText = document.getElementById('button-text');
  const buttonLink = document.getElementById('button-link');
  const buttonStyle = document.getElementById('button-style');
  const buttonIcon = document.getElementById('button-icon');
  const buttonAction = document.getElementById('button-action');
  const buttonFormPreview = document.getElementById('button-form-preview');

  const toastContainer = document.getElementById('toast-container');
  const loadingOverlay = document.getElementById('loading-overlay');

  let selectedPage = 'homepage';
  let currentButtons = [];
  let currentSections = {};
  let editingButtonIndex = -1;
  let sectionOrder = [];

  // Utility functions
  function showLoading() { loadingOverlay.classList.remove('hidden'); }
  function hideLoading() { loadingOverlay.classList.add('hidden'); }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    toast.className = `toast p-3 rounded border ${colors[type] || colors.success}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function apiGet(endpoint, params = {}) {
    const query = new URLSearchParams({ endpoint, ...params }).toString();
    const session = JSON.parse(localStorage.getItem('sssbpuc_session') || '{}');
    
    return fetch(`${apiBase}?${query}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': session.sessionId || ''
      }
    }).then(res => res.json());
  }

  function apiPost(endpoint, data = {}) {
    const session = JSON.parse(localStorage.getItem('sssbpuc_session') || '{}');
    
    return fetch(`${apiBase}?endpoint=${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': session.sessionId || ''
      },
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(res => res.json());
  }

  // Initialize
  init();

  function init() {
    loadPages();
    setupEvents();
    selectPage('homepage');
  }

  function setupEvents() {
    addButtonBtn?.addEventListener('click', () => openButtonModal());
    closeButtonModal?.addEventListener('click', closeButtonModalHandler);
    cancelButton?.addEventListener('click', closeButtonModalHandler);
    previewButtonsBtn?.addEventListener('click', renderButtonPreview);

    buttonForm?.addEventListener('input', updateButtonFormPreview);
    buttonForm?.addEventListener('submit', saveButtonHandler);

    saveSectionBtn?.addEventListener('click', saveCurrentSection);

    uploadMediaBtn?.addEventListener('click', () => openUploadModal());

    // Drag & drop sorting for buttons
    if (buttonsList) {
      new Sortable(buttonsList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          const newOrder = Array.from(buttonsList.children).map((el) => parseInt(el.getAttribute('data-index')));
          reorderButtons(newOrder);
        }
      });
    }
  }

  // Load pages
  function loadPages() {
    showLoading();
    apiGet('get-page-list')
      .then((res) => {
        if (res.success) {
          renderPageSelector(res.pages);
        } else {
          showToast(res.error || 'Failed to load pages', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading pages', 'error');
      })
      .finally(hideLoading);
  }

  function renderPageSelector(pages) {
    pageSelector.innerHTML = '';
    pages.forEach((page) => {
      const button = document.createElement('button');
      button.className = 'p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors';
      button.innerHTML = `
        <i class="ri-file-text-line text-2xl text-primary mb-2"></i>
        <div class="text-sm font-medium">${page.name}</div>
      `;
      button.addEventListener('click', () => selectPage(page.id));
      pageSelector.appendChild(button);
    });
  }

  function selectPage(pageId) {
    selectedPage = pageId;
    loadButtons();
    loadSections();
    buttonsManager.style.display = 'block';
    sectionEditor.style.display = 'block';
    mediaManager.style.display = 'block';
  }

  // Dynamic Buttons
  function loadButtons() {
    showLoading();
    apiGet('get-buttons', { page: selectedPage })
      .then((res) => {
        if (res.success) {
          currentButtons = res.buttons || [];
          renderButtonsList();
          renderButtonPreview();
        } else {
          showToast(res.error || 'Failed to load buttons', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading buttons', 'error');
      })
      .finally(hideLoading);
  }

  function renderButtonsList() {
    buttonsList.innerHTML = '';

    if (!currentButtons.length) {
      const empty = document.createElement('div');
      empty.className = 'p-4 bg-gray-50 border border-dashed border-gray-300 rounded text-center text-gray-500';
      empty.textContent = 'No buttons configured. Click "Add Button" to create one.';
      buttonsList.appendChild(empty);
      return;
    }

    currentButtons.forEach((btn, index) => {
      const item = document.createElement('div');
      item.className = 'p-4 border border-gray-200 rounded flex items-center justify-between';
      item.setAttribute('data-index', index);
      item.innerHTML = `
        <div class="flex items-center space-x-3">
          <i class="ri-draggable"></i>
          <div>
            <div class="font-medium">${btn.text || 'Untitled Button'}</div>
            <div class="text-xs text-gray-500">${btn.link || '#'} • ${btn.style || 'default'} • ${btn.action || 'navigate'}</div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50" data-action="edit">Edit</button>
          <button class="px-2 py-1 text-sm border border-danger text-danger rounded hover:bg-red-50" data-action="delete">Delete</button>
        </div>
      `;

      item.querySelector('[data-action="edit"]').addEventListener('click', () => editButton(index));
      item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteButton(index));

      buttonsList.appendChild(item);
    });
  }

  function renderButtonPreview() {
    buttonPreviewContainer.innerHTML = '';

    if (!currentButtons.length) {
      const empty = document.createElement('div');
      empty.className = 'text-white/80';
      empty.textContent = 'No buttons configured';
      buttonPreviewContainer.appendChild(empty);
      return;
    }

    currentButtons.forEach((btn) => {
      const a = document.createElement('a');
      a.href = btn.link || '#';
      a.className = getButtonClasses(btn.style);
      a.innerHTML = `${btn.icon ? `<i class="${btn.icon} mr-2"></i>` : ''}${btn.text || 'Button'}`;
      buttonPreviewContainer.appendChild(a);
    });
  }

  function getButtonClasses(style) {
    const base = 'button-preview inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-all duration-300';
    switch (style) {
      case 'primary': return `${base} bg-secondary text-white shadow-lg hover:bg-secondary/90`;
      case 'secondary': return `${base} bg-white/20 text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white hover:text-primary`;
      case 'outline': return `${base} border-2 border-white text-white hover:bg-white hover:text-primary`;
      case 'phone': return `${base} bg-green-600 text-white shadow-lg hover:bg-green-700`;
      default: return `${base} bg-primary text-white hover:bg-primary/90`;
    }
  }

  function openButtonModal(button) {
    editingButtonIndex = typeof button === 'number' ? button : -1;
    const data = typeof button === 'number' ? currentButtons[button] : { text: '', link: '', style: 'primary', icon: 'ri-information-line', action: 'navigate' };

    buttonText.value = data.text || '';
    buttonLink.value = data.link || '';
    buttonStyle.value = data.style || 'primary';
    buttonIcon.value = data.icon || '';
    buttonAction.value = data.action || 'navigate';

    updateButtonFormPreview();
    buttonModal.classList.remove('hidden');
  }

  function closeButtonModalHandler() { buttonModal.classList.add('hidden'); }

  function updateButtonFormPreview() {
    const icon = buttonIcon.value ? `<i class="${buttonIcon.value} mr-2"></i>` : '';
    const classes = getButtonClasses(buttonStyle.value);
    buttonFormPreview.className = classes;
    buttonFormPreview.innerHTML = `${icon}${buttonText.value || 'Sample Button'}`;
  }

  function saveButtonHandler(e) {
    e.preventDefault();
    const newButton = {
      text: buttonText.value.trim(),
      link: buttonLink.value.trim(),
      style: buttonStyle.value,
      icon: buttonIcon.value.trim(),
      action: buttonAction.value
    };

    if (!newButton.text || !newButton.link) {
      showToast('Button text and link are required', 'warning');
      return;
    }

    if (editingButtonIndex >= 0) {
      currentButtons[editingButtonIndex] = newButton;
    } else {
      currentButtons.push(newButton);
    }

    saveButtons();
    buttonModal.classList.add('hidden');
  }

  function editButton(index) {
    openButtonModal(index);
  }

  function deleteButton(index) {
    if (!confirm('Delete this button?')) return;
    currentButtons.splice(index, 1);
    saveButtons();
  }

  function reorderButtons(order) {
    const reordered = order.map((idx) => currentButtons[idx]).filter(Boolean);
    currentButtons = reordered;
    saveButtons(false);
  }

  function saveButtons(withToast = true) {
    showLoading();
    apiPost('save-buttons', { page: selectedPage, buttons: currentButtons })
      .then((res) => {
        if (res.success) {
          // Signal frontend to force refresh content from API
          sessionStorage.setItem('forceContentRefresh', '1');
          if (withToast) showToast('Buttons saved');
          renderButtonsList();
          renderButtonPreview();
        } else {
          showToast(res.error || 'Failed to save buttons', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error saving buttons', 'error');
      })
      .finally(hideLoading);
  }

  // Sections
  function loadSections() {
    showLoading();
    apiGet('get-sections', { page: selectedPage })
      .then((res) => {
        if (res.success) {
          currentSections = res.sections || {};
          renderSectionTabs(Object.keys(currentSections));
          if (Object.keys(currentSections).length) {
            selectSection(Object.keys(currentSections)[0]);
          }
        } else {
          showToast(res.error || 'Failed to load sections', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading sections', 'error');
      })
      .finally(hideLoading);
  }

  function renderSectionTabs(sections) {
    sectionTabs.innerHTML = '';
    sections.forEach((section, i) => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;
      a.textContent = section.replace(/_/g, ' ');
      a.addEventListener('click', (e) => { e.preventDefault(); selectSection(section); });
      sectionTabs.appendChild(a);
    });
  }

  let currentSectionKey = null;

  function selectSection(sectionKey) {
    currentSectionKey = sectionKey;
    const data = currentSections[sectionKey];
    renderSectionEditor(sectionKey, data);
  }

  function renderSectionEditor(sectionKey, data) {
    sectionContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'section-editor p-6 rounded-lg';

    // Generate simple form elements based on JSON structure
    const form = document.createElement('div');
    form.className = 'space-y-4';

    function createField(key, value, path = key) {
      const wrapper = document.createElement('div');
      const label = document.createElement('label');
      label.className = 'block text-sm font-medium text-gray-700 mb-1';
      label.textContent = path;

      let input;
      if (typeof value === 'string') {
        if (value.length > 100 || /<.*?>/.test(value)) {
          input = document.createElement('textarea');
          input.className = 'w-full border border-gray-300 rounded-lg px-3 py-2 h-28';
          input.value = value;
        } else {
          input = document.createElement('input');
          input.type = 'text';
          input.className = 'w-full border border-gray-300 rounded-lg px-3 py-2';
          input.value = value;
        }
      } else if (typeof value === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.className = 'w-full border border-gray-300 rounded-lg px-3 py-2';
        input.value = value;
      } else if (typeof value === 'boolean') {
        input = document.createElement('select');
        input.className = 'w-full border border-gray-300 rounded-lg px-3 py-2';
        input.innerHTML = '<option value="true">true</option><option value="false">false</option>';
        input.value = value ? 'true' : 'false';
      } else if (Array.isArray(value)) {
        // Render array editor
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'space-y-2';
        value.forEach((item, idx) => {
          const itemWrapper = document.createElement('div');
          itemWrapper.className = 'border border-gray-200 rounded p-3';
          itemWrapper.appendChild(createField(`${key}[${idx}]`, item, `${path}[${idx}]`));
          arrayContainer.appendChild(itemWrapper);
        });
        wrapper.appendChild(label);
        wrapper.appendChild(arrayContainer);
        return wrapper;
      } else if (typeof value === 'object' && value !== null) {
        // Nested object editor
        const objContainer = document.createElement('div');
        objContainer.className = 'space-y-2';
        Object.keys(value).forEach((k) => {
          objContainer.appendChild(createField(k, value[k], `${path}.${k}`));
        });
        wrapper.appendChild(label);
        wrapper.appendChild(objContainer);
        return wrapper;
      } else {
        const span = document.createElement('span');
        span.className = 'text-gray-500 text-sm';
        span.textContent = 'Unsupported type';
        wrapper.appendChild(label);
        wrapper.appendChild(span);
        return wrapper;
      }

      input.setAttribute('data-path', path);
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      return wrapper;
    }

    // Build fields
    Object.keys(data || {}).forEach((key) => {
      form.appendChild(createField(key, data[key], `${sectionKey}.${key}`));
    });

    container.appendChild(form);
    sectionContent.appendChild(container);
  }

  function saveCurrentSection() {
    if (!currentSectionKey) return;

    // Reconstruct section data from inputs
    const inputs = sectionContent.querySelectorAll('[data-path]');
    const sectionData = JSON.parse(JSON.stringify(currentSections[currentSectionKey] || {}));

    inputs.forEach((input) => {
      const path = input.getAttribute('data-path');
      const value = input.tagName.toLowerCase() === 'select' ? (input.value === 'true') : input.value;

      // Set value in nested object based on path
      const keys = path.replace(`${currentSectionKey}.`, '').split('.');
      let target = sectionData;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!target[k]) target[k] = {};
        target = target[k];
      }
      target[keys[keys.length - 1]] = value;
    });

    showLoading();
    apiPost('save-section', { page: selectedPage, section: currentSectionKey, data: sectionData })
      .then((res) => {
        if (res.success) {
          // Signal frontend to force refresh content from API
          sessionStorage.setItem('forceContentRefresh', '1');
          showToast('Section saved');
          loadSections();
        } else {
          showToast(res.error || 'Failed to save section', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error saving section', 'error');
      })
      .finally(hideLoading);
  }

  // Media
  function openUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
  }
}

