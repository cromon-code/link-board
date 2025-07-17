(function () {
    const vscode = acquireVsCodeApi();
    const linksContainer = document.getElementById('links-container');
    const addLinkBtn = document.getElementById('add-link-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');

    let linksData = [];

    // 拡張機能側からデータを受け取る
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'load') {
            linksData = message.data || [];
            renderLinks();
        }
    });

    // リンク一覧を描画する
    function renderLinks() {
        linksContainer.innerHTML = '';
        linksData.forEach((link, index) => {
            const linkForm = document.createElement('div');
            linkForm.className = 'link-form';
            linkForm.dataset.index = index;

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
                    <input type="text" id="tags-${index}" class="link-tags" value="${escapeHtml((link.tags || []).join(', '))}" placeholder="カンマ区切り">
                </div>
                <div class="form-group">
                    <label for="description-${index}">Description</label>
                    <textarea id="description-${index}" class="link-description" rows="3">${escapeHtml(link.description || '')}</textarea>
                </div>
                <div class="form-footer">
                    <button class="delete-btn">このリンクを削除</button>
                </div>
            `;
            linksContainer.appendChild(linkForm);
        });
    }

    // 新しいリンクを追加
    addLinkBtn.addEventListener('click', () => {
        linksData.push({ label: '', url: '', description: '', tags: [] });
        renderLinks();
    });

    // ▼▼▼ 削除ボタンのクリック処理 ▼▼▼
    linksContainer.addEventListener('click', e => {
        // クリックされた要素が`.delete-btn`クラスを持っているか確認
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('このリンクを本当に削除しますか？')) {
                // ボタンの親である.link-form要素を探す
                const form = e.target.closest('.link-form');
                if (!form) return;

                // data-index属性から、削除するデータのインデックスを取得
                const index = parseInt(form.dataset.index, 10);
                
                // データ配列から該当の要素を削除
                linksData.splice(index, 1);
                
                // 変更を反映して再描画
                renderLinks();
            }
        }
    });

    // 変更を保存
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