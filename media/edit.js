(function () {
    const vscode = acquireVsCodeApi();
    const i18n = window.i18n || {};
    const config = window.config || {};

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
            linkForm.innerHTML = `
                <div class="form-row">
                    <label for="label-${index}">${i18n.label || 'Label'}</label>
                    <input type="text" id="label-${index}" class="link-label" value="${escapeHtml(link.label || '')}">
                </div>
                <div class="form-row">
                    <label for="url-${index}">${i18n.url || 'URL'}</label>
                    <input type="text" id="url-${index}" class="link-url" value="${escapeHtml(link.url || '')}">
                </div>
                <div class="form-row">
                    <label for="tags-${index}">${i18n.tags || 'Tags'}</label>
                    <input type="text" id="tags-${index}" class="link-tags" value="${escapeHtml((link.tags || []).join(', '))}" placeholder="${i18n.tagsPlaceholder || 'Comma-separated'}">
                </div>
                <div class="form-group">
                    <label for="description-${index}">${i18n.description || 'Description'}</label>
                    <textarea id="description-${index}" class="link-description" rows="3">${escapeHtml(link.description || '')}</textarea>
                </div>
                <div class="form-footer">
                    <button class="delete-btn">${i18n.delete || 'Delete this link'}</button>
                </div>
            `;
            linksContainer.appendChild(linkForm);
        });
    }
    
    // ★ 1. 現在のフォームの入力内容を`linksData`に保存する関数を新設
    function updateStateFromDOM() {
        const newLinksData = [];
        document.querySelectorAll('.link-form').forEach(form => {
            const label = form.querySelector('.link-label').value;
            const url = form.querySelector('.link-url').value;
            const description = form.querySelector('.link-description').value;
            const tags = form.querySelector('.link-tags').value.split(',').map(t => t.trim()).filter(Boolean);
            
            newLinksData.push({ label, url, description, tags });
        });
        linksData = newLinksData;
    }

    // ★ 2. 「新規リンクを追加」の処理を修正
    addLinkBtn.addEventListener('click', () => {
        updateStateFromDOM(); // まず現在の状態を保存
        linksData.push({ label: '', url: '', description: '', tags: [] }); // その後、新しいリンクを追加
        renderLinks(); // 最後に再描画
    });

    linksContainer.addEventListener('click', e => {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const form = e.target.closest('.link-form');
            if (!form) return;
            const index = parseInt(form.dataset.index, 10);
            if (isNaN(index)) return;
    
            if (config.showDeleteConfirmation) {
                indexToDelete = index;
                modalText.textContent = i18n.deleteConfirm || 'Are you sure you want to delete this link?';
                modalConfirmBtn.textContent = i18n.ok || 'OK';
                modalCancelBtn.textContent = i18n.cancel || 'Cancel';
                confirmModal.classList.remove('hidden');
            } else {
                linksData.splice(index, 1);
                renderLinks();
            }
        }
    });

    modalConfirmBtn.addEventListener('click', () => {
        if (indexToDelete > -1) {
            updateStateFromDOM(); // ★ 削除前にも状態を保存
            linksData.splice(indexToDelete, 1);
            renderLinks();
        }
        confirmModal.classList.add('hidden'); 
        indexToDelete = -1;
    });

    modalCancelBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        indexToDelete = -1;
    });

    // ★ 3. 「変更を保存」も新しい関数を使うように修正
    saveChangesBtn.addEventListener('click', () => {
        updateStateFromDOM(); // 現在の状態を保存
        vscode.postMessage({
            type: 'save',
            data: linksData // 保存したデータを送信
        });
    });

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/"/g, '&quot;');
    }
}());