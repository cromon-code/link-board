document.addEventListener('DOMContentLoaded', function() {
    const debounceTime = parseInt(document.body.dataset.debounceTime || '150', 10);

    const searchBox = document.getElementById('search-box');
    const tagContainer = document.getElementById('tag-container');
    let activeTag = 'all';

    if (!searchBox || !tagContainer) { return; }

    // --- 1. デバウンス関数を定義 ---
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // --- 2. デバウンスされたフィルタリング関数を作成 ---
    const debouncedApplyFilters = debounce(applyFilters, debounceTime);

    // --- 3. イベントリスナーを修正 ---
    // 検索ボックスの入力にはデバウンス版を、タグクリックには即時実行版を使用
    searchBox.addEventListener('input', debouncedApplyFilters);
    tagContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-btn')) {
            tagContainer.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            activeTag = e.target.dataset.tag;
            applyFilters(); // タグクリックは即時反映
        }
    });

    function applyFilters() {
        const searchTerm = searchBox.value.toLowerCase();
        const noResultsMessage = document.getElementById('no-results-message');
        let visibleCardsCount = 0;

        document.querySelectorAll('.card').forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardTags = (card.dataset.tags || '').split(',');
            const matchesSearch = cardText.includes(searchTerm);
            const matchesTag = activeTag === 'all' || cardTags.includes(activeTag);

            if (matchesSearch && matchesTag) {
                card.style.display = 'flex';
                visibleCardsCount++;
                highlightTextInCard(card, searchTerm);
            } else {
                card.style.display = 'none';
                removeHighlightsInCard(card);
            }
        });

        if (visibleCardsCount === 0) {
            noResultsMessage.classList.remove('hidden');
        } else {
            noResultsMessage.classList.add('hidden');
        }
    }

    // highlightTextInCard, removeHighlightsInCard, highlightText, escapeRegExp 関数は変更なし
    function highlightTextInCard(card, searchTerm) {
        const titleElement = card.querySelector('.card-title');
        const descriptionElement = card.querySelector('.card-description');

        if (titleElement) {
            if (!titleElement.dataset.originalText) {
                titleElement.dataset.originalText = titleElement.textContent;
            }
            titleElement.innerHTML = highlightText(titleElement.dataset.originalText, searchTerm);
        }
        if (descriptionElement) {
            if (!descriptionElement.dataset.originalText) {
                descriptionElement.dataset.originalText = descriptionElement.textContent;
            }
            descriptionElement.innerHTML = highlightText(descriptionElement.dataset.originalText, searchTerm);
        }
    }
    
    function removeHighlightsInCard(card) {
        const titleElement = card.querySelector('.card-title');
        const descriptionElement = card.querySelector('.card-description');
        if (titleElement && titleElement.dataset.originalText) {
            titleElement.innerHTML = titleElement.dataset.originalText;
        }
        if (descriptionElement && descriptionElement.dataset.originalText) {
            descriptionElement.innerHTML = descriptionElement.dataset.originalText;
        }
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm) {
            return text;
        }
        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
        return text.replace(regex, `<mark>$&</mark>`);
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});