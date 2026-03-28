// ============================================
// Hardy's Blog - Modern Static Blog App
// ============================================

class BlogApp {
  constructor() {
    this.posts = [];
    this.allTags = new Set();
    this.activeTag = null;
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.loadPosts();
    this.setupEventListeners();
    this.loadTheme();
    this.render();
  }

  loadPosts() {
    const dataElement = document.getElementById('postsData');
    if (dataElement) {
      const data = JSON.parse(dataElement.textContent);
      this.posts = data.posts || [];
      
      // Extract all tags
      this.posts.forEach(post => {
        if (post.tags) {
          post.tags.forEach(tag => this.allTags.add(tag));
        }
      });
    }
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    // Tag filtering
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag')) {
        const tagName = e.target.textContent;
        this.activeTag = this.activeTag === tagName ? null : tagName;
        this.render();
      }
    });
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }

  getFilteredPosts() {
    return this.posts.filter(post => {
      // Search filter
      const matchesSearch = !this.searchQuery || 
        post.title.toLowerCase().includes(this.searchQuery) ||
        post.summary.toLowerCase().includes(this.searchQuery);

      // Tag filter
      const matchesTag = !this.activeTag || 
        (post.tags && post.tags.includes(this.activeTag));

      return matchesSearch && matchesTag;
    });
  }

  renderPosts() {
    const container = document.getElementById('postsContainer');
    const noResults = document.getElementById('noResults');
    
    if (!container) return;

    const filteredPosts = this.getFilteredPosts();

    if (filteredPosts.length === 0) {
      container.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';
    container.innerHTML = filteredPosts.map(post => `
      <article class="post-card">
        <div class="post-date">${this.formatDate(post.date)}</div>
        <h2 class="post-title">
          <a href="${post.url}">${post.title}</a>
        </h2>
        <p class="post-summary">${post.summary}</p>
        <div class="post-tags">
          ${post.tags ? post.tags.map(tag => `
            <span class="post-tag">${tag}</span>
          `).join('') : ''}
        </div>
      </article>
    `).join('');
  }

  renderTags() {
    const container = document.getElementById('tagsCloud');
    if (!container) return;

    const tags = Array.from(this.allTags).sort();
    container.innerHTML = tags.map(tag => `
      <span class="tag ${this.activeTag === tag ? 'active' : ''}">${tag}</span>
    `).join('');
  }

  renderArchives() {
    const container = document.getElementById('archiveList');
    if (!container) return;

    // Extract years and months from posts
    const archives = new Map();
    this.posts.forEach(post => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      
      if (!archives.has(key)) {
        archives.set(key, { year, month });
      }
    });

    // Sort by date descending
    const sorted = Array.from(archives.values()).sort((a, b) => {
      return b.year - a.year || b.month - a.month;
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    container.innerHTML = '<li><a href="/">All Posts</a></li>' + sorted.map(archive => `
      <li><a href="/#${archive.year}-${archive.month}">${monthNames[archive.month - 1]} ${archive.year}</a></li>
    `).join('');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  render() {
    this.renderPosts();
    this.renderTags();
    this.renderArchives();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
  });
} else {
  new BlogApp();
}
