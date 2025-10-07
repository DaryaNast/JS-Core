class View {
    constructor() {
        this.app =  document.getElementById('app');

        this.title = this.createElement('h1', 'title');
        this.title.textContent = 'Github Search Repo';

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.searchInput.placeholder = 'Search repositories...';
        this.searchLine.append(this.searchInput);

        this.repoWrapper = this.createElement('div', 'repo-wrapper');
        this.repoList = this.createElement('ul', 'repo-list');
        this.repoWrapper.append(this.repoList);

        this.main = this.createElement('div', 'main');
        this.main.append(this.repoWrapper);

        this.selectedRepos = this.createElement('div', 'selected-repos');
        this.selectedReposTitle = this.createElement('h2', 'selected-repos-title');
        this.selectedReposList = this.createElement('ul', 'selected-repos-list');

        this.selectedRepos.append(this.selectedReposTitle);
        this.selectedRepos.append(this.selectedReposList);

        this.app.append(this.title);
        this.app.append(this.searchLine);
        this.app.append(this.main);
        this.main.append(this.selectedRepos);
    }
    createElement(elementTag, elementClass) {
        const element = document.createElement(elementTag);
        if (elementClass) {
            element.classList.add(elementClass);
        }
        return element;
    }

    clearResults() {
        this.repoList.innerHTML = '';
    }

    createRepo(repoData) {
        const repoElement = this.createElement('li', 'repo-prev');
        repoElement.innerHTML = `<span class= "repo-prev-name">${repoData.name}</span>
                                 <span class="repo-prev-owner">${repoData.owner.login}</span>
                                 <span class="repo-prev-stars">${repoData.stargazers_count}</span>`;

        repoElement.addEventListener('click', () => {
            this.addToSelectedRepos(repoData);
        });
        this.repoList.append(repoElement);
    }

    addToSelectedRepos(repoData) {
        const selectedRepoElement = this.createElement('li', 'selected-repo');
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

        this.selectedReposList.append(selectedRepoElement);
        this.clearResults()
        this.searchInput.value = '';
        this.repoWrapper.style.display = 'none';
    }
}

const REPO_PER_PAGE = 5;

class Search {
    constructor(view) {
        this.view = view;
        this.view.searchInput.addEventListener('input', this.debounce(this.searchRepo.bind(this), 400));
        this.view.searchInput.addEventListener('focus', () => {
            if (this.view.repoList.children.length > 0) {
                this.view.repoWrapper.style.display = 'block';
            }
    })

        document.addEventListener('click', (e) => {
            if (!this.view.repoWrapper.contains(e.target) && e.target !== this.view.searchInput) {
                this.view.repoWrapper.style.display = 'none';
            }
        });
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

        return await fetch(`https://api.github.com/search/repositories?q=Q${this.view.searchInput.value}&per_page=${REPO_PER_PAGE}`)
            .then((res) => {
            if (res.ok) {
                res.json().then(res => {
                    res.items.forEach(repo => this.view.createRepo(repo));
                });
            } else {
                this.view.repoWrapper.style.display = 'none';
            }
        });
    }
}

new Search(new View());