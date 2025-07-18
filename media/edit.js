(function () {
    const vscode = acquireVsCodeApi();
    const config = window.config || {};

    // modal
    const confirmModal = document.getElementById('confirm-modal');
    const modalText = document.getElementById('modal-text');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    const linksContainer = document.getElementById('links-container');
    const addLinkBtn = document.getElementById('add-link-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');

    let linksData = [];
    let indexToDelete = -1;

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'load') {
            linksData = message.data || [];
            renderLinks();
        }
    });

    function renderLinks() {
        linksContainer.innerHTML = '';
        linksData.forEach((link, index) => {
            const linkForm = document.createElement('div');
            linkForm.className = 'link-form';
            linkForm.dataset.index = index;
            // ★ ハードコーディングされた英語の文字列を使用
            linkForm.innerHTML = `
                <div class="form-row">
                    <label for="label-${index}">Label</label>
                    <input type="text" id="label-${index}" class="link-label" value="${escapeHtml(link.label || '')}">
                </div>
                <div class="form-row">
                    <label for="url-${index}">URL</label>
                    <input type="text" id="url-${index}" class="link-url" value="${escapeHtml(link.url || '')}">
                </div>
                <div class="form-row">
                    <label for="tags-${index}">Tags</label>
                    <input type="text" id="tags-${index}" class="link-tags" value="${escapeHtml((link.tags || []).join(', '))}" placeholder="Comma-separated">
                </div>
                <div class="form-group">
                    <label for="description-${index}">Description</label>
                    <textarea id="description-${index}" class="link-description" rows="3">${escapeHtml(link.description || '')}</textarea>
                </div>
                <div class="form-footer">
                    <button class="delete-btn">Delete this link</button>
                </div>
            `;
            linksContainer.appendChild(linkForm);
        });
    }

    addLinkBtn.addEventListener('click', () => {
        linksData.push({ label: '', url: '', description: '', tags: [] });
        renderLinks();
    });

    linksContainer.addEventListener('click', e => {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const form = e.target.closest('.link-form');
            if (!form) return;
            const index = parseInt(form.dataset.index, 10);
            if (isNaN(index)) return;

            if (config.showDeleteConfirmation) {
                indexToDelete = index;
                modalText.textContent = 'Are you sure you want to delete this link?';
                modalConfirmBtn.textContent = 'OK';
                modalCancelBtn.textContent = 'Cancel';
                confirmModal.classList.remove('hidden');
            } else {
                linksData.splice(index, 1);
                renderLinks();
            }
        }
    });

    // ok
    modalConfirmBtn.addEventListener('click', () => {
        if (indexToDelete > -1) {
            linksData.splice(indexToDelete, 1);
            renderLinks();
        }
        confirmModal.classList.add('hidden'); 
        indexToDelete = -1;
    });

    // cancel
    modalCancelBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        indexToDelete = -1;
    });

    saveChangesBtn.addEventListener('click', () => {
        const updatedLinks = [];
        document.querySelectorAll('.link-form').forEach(form => {
            const label = form.querySelector('.link-label').value;
            const url = form.querySelector('.link-url').value;
            const description = form.querySelector('.link-description').value;
            const tags = form.querySelector('.link-tags').value.split(',').map(t => t.trim()).filter(Boolean);
            
            if (label && url) {
                updatedLinks.push({ label, url, description, tags });
            }
        });

        vscode.postMessage({
            type: 'save',
            data: updatedLinks
        });
    });

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}());