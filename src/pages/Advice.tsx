import React, { useState } from 'react';
import './Advice.css';

interface AdviceArticle {
  id: string;
  title: string;
  category: 'savings' | 'investing' | 'budgeting' | 'debt' | 'retirement';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  tags: string[];
  content: string;
  author: string;
  publishedDate: string;
  isFeatured: boolean;
}

const Advice: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'savings' | 'investing' | 'budgeting' | 'debt' | 'retirement'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  const adviceArticles: AdviceArticle[] = [
    {
      id: '1',
      title: 'Как создать резервный фонд за 6 месяцев',
      category: 'savings',
      difficulty: 'beginner',
      readTime: 5,
      tags: ['сбережения', 'финансовая безопасность', 'бюджет'],
      content: 'Резервный фонд - это основа финансовой стабильности. Начните с определения суммы на 3-6 месяцев жизни. Автоматизируйте переводы, сократите ненужные расходы и рассмотрите дополнительные источники дохода.',
      author: 'Мария Финансова',
      publishedDate: '2024-01-15',
      isFeatured: true
    },
    {
      id: '2',
      title: 'Основы инвестирования для начинающих',
      category: 'investing',
      difficulty: 'beginner',
      readTime: 8,
      tags: ['инвестиции', 'акции', 'облигации', 'диверсификация'],
      content: 'Начните с понимания своей терпимости к риску. Диверсифицируйте портфель между акциями, облигациями и ETF. Помните о сложном проценте - начинайте инвестировать как можно раньше.',
      author: 'Алексей Инвесторов',
      publishedDate: '2024-02-20',
      isFeatured: true
    },
    {
      id: '3',
      title: '50/30/20 правило бюджетирования',
      category: 'budgeting',
      difficulty: 'beginner',
      readTime: 4,
      tags: ['бюджет', 'распределение', 'финансовое планирование'],
      content: '50% дохода на обязательные расходы, 30% на желания и 20% на сбережения. Это простое правило поможет поддерживать финансовый баланс без сложных расчетов.',
      author: 'Иван Бюджетов',
      publishedDate: '2024-03-10',
      isFeatured: false
    },
    {
      id: '4',
      title: 'Стратегии погашения долгов',
      category: 'debt',
      difficulty: 'intermediate',
      readTime: 6,
      tags: ['долги', 'кредиты', 'финансовая свобода'],
      content: 'Метод снежного кома: погашайте долги от меньшего к большему. Метод лавины: сначала высокопроцентные долги. Выберите стратегию, которая мотивирует вас продолжать.',
      author: 'Ольга Кредитова',
      publishedDate: '2024-04-05',
      isFeatured: false
    },
    {
      id: '5',
      title: 'Планирование пенсии: с чего начать',
      category: 'retirement',
      difficulty: 'intermediate',
      readTime: 7,
      tags: ['пенсия', 'инвестиции', 'будущее'],
      content: 'Рассчитайте необходимый пенсионный капитал. Используйте ИИС и другие налоговые льготы. Диверсифицируйте инвестиции и регулярно пересматривайте стратегию.',
      author: 'Сергей Пенсионеров',
      publishedDate: '2024-05-12',
      isFeatured: true
    },
    {
      id: '6',
      title: 'Оптимизация налогов для инвесторов',
      category: 'investing',
      difficulty: 'advanced',
      readTime: 10,
      tags: ['налоги', 'инвестиции', 'ИИС'],
      content: 'Используйте ИИС для получения налоговых вычетов. Оптимизируйте момент продажи активов. Рассмотрите возможность инвестирования через юридическое лицо.',
      author: 'Дмитрий Налогов',
      publishedDate: '2024-06-18',
      isFeatured: false
    },
    {
      id: '7',
      title: 'Психология денег: как избежать эмоциональных решений',
      category: 'budgeting',
      difficulty: 'intermediate',
      readTime: 9,
      tags: ['психология', 'привычки', 'финансовое поведение'],
      content: 'Создайте финансовые ритуалы. Отделяйте эмоции от денежных решений. Разработайте систему проверки крупных покупок.',
      author: 'Анна Психологова',
      publishedDate: '2024-07-22',
      isFeatured: true
    },
    {
      id: '8',
      title: 'Автоматизация финансов: инструменты и сервисы',
      category: 'budgeting',
      difficulty: 'beginner',
      readTime: 5,
      tags: ['автоматизация', 'приложения', 'технологии'],
      content: 'Используйте автоматические переводы для сбережений. Настройте уведомления о счетах. Применяйте финансовые приложения для отслеживания расходов.',
      author: 'Павел Технологов',
      publishedDate: '2024-08-30',
      isFeatured: false
    }
  ];

  const toggleSaveArticle = (articleId: string) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const filteredArticles = adviceArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesDifficulty = difficultyFilter === 'all' || article.difficulty === difficultyFilter;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(article => article.isFeatured);
  const regularArticles = filteredArticles.filter(article => !article.isFeatured);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success)';
      case 'intermediate': return 'var(--warning)';
      case 'advanced': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'investing': return '📈';
      case 'budgeting': return '💸';
      case 'debt': return '🏠';
      case 'retirement': return '👵';
      default: return '📚';
    }
  };

  return (
    <div className="advice-page">
      <div className="page-header">
        <h1>Советы 💡</h1>
        <p>Экспертные рекомендации по управлению финансами</p>
      </div>

      <div className="advice-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Поиск советов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Категория:</label>
            <select 
              value={activeCategory} 
              onChange={(e) => setActiveCategory(e.target.value as any)}
            >
              <option value="all">Все категории</option>
              <option value="savings">💰 Сбережения</option>
              <option value="investing">📈 Инвестиции</option>
              <option value="budgeting">💸 Бюджетирование</option>
              <option value="debt">🏠 Долги</option>
              <option value="retirement">👵 Пенсия</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Сложность:</label>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
            >
              <option value="all">Любая сложность</option>
              <option value="beginner">👶 Начинающий</option>
              <option value="intermediate">🎯 Средний</option>
              <option value="advanced">🚀 Продвинутый</option>
            </select>
          </div>
        </div>
      </div>

      {featuredArticles.length > 0 && (
        <div className="featured-section">
          <h2>Рекомендуемые статьи</h2>
          <div className="featured-grid">
            {featuredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isSaved={savedArticles.includes(article.id)}
                onSaveToggle={toggleSaveArticle}
                getDifficultyColor={getDifficultyColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        </div>
      )}

      <div className="articles-section">
        <h2>Все статьи ({filteredArticles.length})</h2>
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Статьи не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        ) : (
          <div className="articles-grid">
            {regularArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isSaved={savedArticles.includes(article.id)}
                onSaveToggle={toggleSaveArticle}
                getDifficultyColor={getDifficultyColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        )}
      </div>

      <div className="advice-tips">
        <h2>Быстрые советы</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <h4>Ведите учет расходов</h4>
            <p>Записывайте все траты в течение месяца чтобы понять куда уходят деньги</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Ставьте финансовые цели</h4>
            <p>Конкретные цели с дедлайнами помогают лучше копить</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔄</div>
            <h4>Автоматизируйте сбережения</h4>
            <p>Настройте автоматические переводы на сберегательный счет</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📚</div>
            <h4>Постоянно обучайтесь</h4>
            <p>Финансовая грамотность - ключ к успешному управлению деньгами</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки статьи
interface ArticleCardProps {
  article: AdviceArticle;
  isSaved: boolean;
  onSaveToggle: (id: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  getCategoryIcon: (category: string) => string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSaved,
  onSaveToggle,
  getDifficultyColor,
  getCategoryIcon
}) => {
  return (
    <div className="article-card">
      <div className="article-header">
        <div className="article-category">
          <span className="category-icon">{getCategoryIcon(article.category)}</span>
          <span className="category-name">
            {article.category === 'savings' && 'Сбережения'}
            {article.category === 'investing' && 'Инвестиции'}
            {article.category === 'budgeting' && 'Бюджетирование'}
            {article.category === 'debt' && 'Долги'}
            {article.category === 'retirement' && 'Пенсия'}
          </span>
        </div>
        <button 
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={() => onSaveToggle(article.id)}
        >
          {isSaved ? '💾' : '📌'}
        </button>
      </div>

      <h3 className="article-title">{article.title}</h3>
      <p className="article-content">{article.content}</p>

      <div className="article-tags">
        {article.tags.map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>

      <div className="article-meta">
        <div className="meta-item">
          <span className="meta-label">Сложность:</span>
          <span 
            className="difficulty-badge"
            style={{ color: getDifficultyColor(article.difficulty) }}
          >
            {article.difficulty === 'beginner' && '👶 Начинающий'}
            {article.difficulty === 'intermediate' && '🎯 Средний'}
            {article.difficulty === 'advanced' && '🚀 Продвинутый'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Время чтения:</span>
          <span className="read-time">{article.readTime} мин</span>
        </div>
      </div>

      <div className="article-footer">
        <div className="author-info">
          <span className="author">{article.author}</span>
          <span className="publish-date">
            {new Date(article.publishedDate).toLocaleDateString('ru-RU')}
          </span>
        </div>
        <button className="btn btn-secondary read-btn">
          Читать →
        </button>
      </div>
    </div>
  );
};

export default Advice;