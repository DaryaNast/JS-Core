class View {
    constructor() {
        this.app =  document.getElementById('app');
        this.searchInput = document.querySelector('.search-input');
        this.repoList = document.querySelector('.repo-list');
        this.selectedReposList = document.querySelector('.selected-repo-list');
        this.repoWrapper = document.querySelector('.repo-wrapper');

        this.repoList.style.display = 'none';
    }

    clearResults() {
        this.repoList.innerHTML = '';
    }

    showDropdown() {
        if (this.repoList.children.length > 0) {
            this.repoList.style.display = 'block';
        }
    }

    hideDropdown() {
        this.repoList.style.display = 'none';
    }

    createRepo(repoData) {
        const repoElement = document.createElement('li');
        repoElement.className ='repo-prev';
        repoElement.innerHTML = `<span class= "repo-prev-name">${repoData.name}</span>
                                 <span class="repo-prev-owner">${repoData.owner.login}</span>
                                 <span class="repo-prev-stars">${repoData.stargazers_count}</span>`;

        repoElement.addEventListener('click', () => {
            this.addToSelectedRepos(repoData);
        });
        this.repoList.append(repoElement);
    }

    addToSelectedRepos(repoData) {
        const selectedRepoElement = document.createElement('li');
        selectedRepoElement.className ='selected-repo';
        selectedRepoElement.innerHTML = `
            <div class="repo-info">
                <div class="repo-details">
                    <span class="repo-name">Name: ${repoData.name}</span>
                    <span class="repo-owner">Owner: ${repoData.owner.login}</span>
                    <span class="repo-stars">Stars: ${repoData.stargazers_count.toLocaleString()}</span>
                </div>
                <button class="remove-btn">×</button>
            </div>
        `;

        const removeBtn = selectedRepoElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedRepoElement.remove();
        })

        this.selectedReposList.appendChild(selectedRepoElement);
        this.clearResults()
        this.searchInput.value = '';
        this.hideDropdown();
    }
}

const REPO_PER_PAGE = 5;

class Search {
    constructor(view) {
        this.view = view;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.view.searchInput.addEventListener('input',
            this.debounce(this.searchRepo.bind(this), 400));

        this.view.searchInput.addEventListener('focus',
            this.handleFocus.bind(this));

        this.view.searchInput.addEventListener('click',
            this.handleFocus.bind(this));

        document.addEventListener('click', (e) => {
            if (e.target !== this.view.searchInput && !this.view.repoWrapper.contains(e.target)) {
                this.view.hideDropdown();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.view.hideDropdown();
            }
        });
    }

    handleFocus() {
        if (this.view.repoList.children.length > 0) {
            this.view.showDropdown();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            }
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        }
    }

    async searchRepo() {
        const searchValue = this.view.searchInput.value;

        if (searchValue.length === 0) {
            this.view.clearResults();
            this.view.repoWrapper.style.display = 'none';
            return;
        }

        this.view.clearResults();

        try {
            const response = await fetch(
                `https://api.github.com/search/repositories?q=${encodeURIComponent(searchValue)}&per_page=${REPO_PER_PAGE}`
            );

            if (response.ok) {
                const data = await response.json();
                this.view.clearResults();

                if (data.items && data.items.length > 0) {
                    data.items.forEach(repo => this.view.createRepo(repo));
                    this.view.showDropdown();
                } else {
                    this.view.hideDropdown();
                }
            } else {
                this.view.hideDropdown();
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
            this.view.hideDropdown();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Search(new View());
});