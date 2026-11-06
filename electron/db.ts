import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import type { TechNewsArticle, GitHubRepo } from '../src/types';

let dbInstance: any = null;
let useJsonFallback = false;
let jsonDbPath = '';

// Initialize SQLite database using Node 22 native node:sqlite DatabaseSync
export function initDatabase() {
  try {
    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'devworkspace_cache.db');
    jsonDbPath = path.join(userData, 'devworkspace_cache_fallback.json');

    try {
      // Dynamic require so esbuild node target bundles cleanly
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DatabaseSync } = require('node:sqlite');
      dbInstance = new DatabaseSync(dbPath);

      // Create tables for Tech News Articles & GitHub Repositories
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          url TEXT UNIQUE NOT NULL,
          source TEXT NOT NULL,
          category TEXT NOT NULL,
          published_at TEXT NOT NULL,
          summary TEXT,
          content TEXT,
          image_url TEXT,
          funding_amount TEXT,
          location TEXT,
          score INTEGER DEFAULT 100,
          comments_count INTEGER DEFAULT 0,
          read_time TEXT,
          created_at INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
        CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

        CREATE TABLE IF NOT EXISTS github_repos (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          full_name TEXT NOT NULL,
          owner_login TEXT,
          owner_avatar TEXT,
          description TEXT,
          html_url TEXT,
          clone_url TEXT,
          stars INTEGER DEFAULT 0,
          forks INTEGER DEFAULT 0,
          language TEXT,
          topics TEXT,
          stars_today INTEGER DEFAULT 0,
          timeframe TEXT,
          updated_at TEXT,
          cached_at INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_github_stars ON github_repos(stars DESC);
        CREATE INDEX IF NOT EXISTS idx_github_timeframe ON github_repos(timeframe);
      `);

      // Invalidate and delete legacy manipulated/stock-image articles
      try {
        dbInstance.exec(`
          DELETE FROM articles 
          WHERE id LIKE 'gn-%' 
             OR image_url LIKE '%photo-1677442136019%' 
             OR image_url IS NULL 
             OR image_url = '';
        `);
      } catch (_) {}

      console.log('✅ SQLite Database successfully initialized at:', dbPath);
      return;
    } catch (sqliteErr) {
      console.warn('node:sqlite initialization failed, falling back to JSON cache:', sqliteErr);
      useJsonFallback = true;
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
    useJsonFallback = true;
  }
}

// Fallback JSON store reader/writer
interface FallbackData {
  articles: TechNewsArticle[];
  githubRepos: (GitHubRepo & { timeframe?: string; cachedAt?: number })[];
}

function getJsonDbPath(): string {
  if (!jsonDbPath) {
    try {
      const userData = app.getPath('userData');
      jsonDbPath = path.join(userData, 'devworkspace_cache_fallback.json');
    } catch (_) {
      jsonDbPath = path.join(process.cwd(), 'devworkspace_cache_fallback.json');
    }
  }
  return jsonDbPath;
}

function readJsonFallback(): FallbackData {
  try {
    const targetPath = getJsonDbPath();
    if (targetPath && fs.existsSync(targetPath)) {
      return JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    }
  } catch (_) {}
  return { articles: [], githubRepos: [] };
}

function writeJsonFallback(data: FallbackData) {
  try {
    const targetPath = getJsonDbPath();
    if (targetPath) {
      fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (_) {}
}

// Save parsed tech news articles into SQLite database
export function saveArticles(articles: TechNewsArticle[]) {
  if (!articles || articles.length === 0) return;

  if (dbInstance && !useJsonFallback) {
    try {
      const stmt = dbInstance.prepare(`
        INSERT INTO articles (
          id, title, url, source, category, published_at, summary, content,
          image_url, funding_amount, location, score, comments_count, read_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
          title = excluded.title,
          source = excluded.source,
          category = excluded.category,
          published_at = excluded.published_at,
          summary = excluded.summary,
          content = COALESCE(excluded.content, articles.content),
          image_url = COALESCE(excluded.image_url, articles.image_url),
          funding_amount = COALESCE(excluded.funding_amount, articles.funding_amount),
          location = COALESCE(excluded.location, articles.location),
          score = excluded.score,
          comments_count = excluded.comments_count,
          read_time = excluded.read_time
      `);

      for (const a of articles) {
        stmt.run(
          a.id || `art-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          a.title,
          a.url,
          a.source,
          a.category,
          a.publishedAt || new Date().toISOString(),
          a.summary || '',
          a.content || '',
          a.imageUrl || '',
          a.fundingAmount || '',
          a.location || '',
          a.score || 120,
          a.commentsCount || 10,
          a.readTime || '4 min read',
          Date.now()
        );
      }
      return;
    } catch (err) {
      console.warn('SQLite insert articles failed, falling back to JSON:', err);
    }
  }

  // Fallback JSON handling
  const data = readJsonFallback();
  const urlMap = new Map(data.articles.map((item) => [item.url, item]));
  for (const a of articles) {
    urlMap.set(a.url, { ...a });
  }
  data.articles = Array.from(urlMap.values());
  writeJsonFallback(data);
}

// Update specific article with full cleaned body content
export function updateArticleContent(url: string, content: string) {
  if (dbInstance && !useJsonFallback) {
    try {
      const stmt = dbInstance.prepare(`UPDATE articles SET content = ? WHERE url = ?`);
      stmt.run(content, url);
      return;
    } catch (_) {}
  }

  const data = readJsonFallback();
  const item = data.articles.find((a) => a.url === url);
  if (item) {
    item.content = content;
    writeJsonFallback(data);
  }
}

// Retrieve articles from local database
export function getArticles(options?: {
  category?: string;
  source?: string;
  query?: string;
  limit?: number;
}): TechNewsArticle[] {
  const limit = options?.limit || 150;

  if (dbInstance && !useJsonFallback) {
    try {
      let sql = `SELECT * FROM articles WHERE image_url IS NOT NULL AND image_url != '' AND image_url NOT LIKE '%photo-1677442136019%' AND id NOT LIKE 'gn-%'`;
      const params: any[] = [];

      if (options?.category && options.category !== 'All') {
        sql += ` AND category = ?`;
        params.push(options.category);
      }
      if (options?.source && options.source !== 'All') {
        sql += ` AND source = ?`;
        params.push(options.source);
      }
      if (options?.query && options.query.trim()) {
        sql += ` AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR location LIKE ? OR funding_amount LIKE ? OR source LIKE ?)`;
        const q = `%${options.query.trim()}%`;
        params.push(q, q, q, q, q, q);
      }

      sql += ` ORDER BY created_at DESC, published_at DESC LIMIT ?`;
      params.push(limit);

      const rows = dbInstance.prepare(sql).all(...params) as any[];
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        source: r.source,
        category: r.category as any,
        publishedAt: r.published_at,
        summary: r.summary,
        content: r.content,
        imageUrl: r.image_url || undefined,
        fundingAmount: r.funding_amount || undefined,
        location: r.location || undefined,
        score: r.score,
        commentsCount: r.comments_count,
        readTime: r.read_time,
      }));
    } catch (err) {
      console.warn('SQLite query articles failed, using fallback:', err);
    }
  }

  // Fallback JSON handling
  const data = readJsonFallback();
  let list = (data.articles || []).filter(
    (a) => a && a.title && a.imageUrl && !a.imageUrl.includes('photo-1677442136019') && !a.id?.startsWith('gn-')
  );
  if (options?.category && options.category !== 'All') {
    list = list.filter((a) => a.category === options.category);
  }
  if (options?.source && options.source !== 'All') {
    list = list.filter((a) => a.source.toLowerCase().includes(options.source!.toLowerCase()));
  }
  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.fundingAmount && a.fundingAmount.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return list.slice(0, limit);
}

// Save GitHub trending repositories into SQLite database
export function saveGitHubRepos(repos: GitHubRepo[], timeframe: string = 'daily') {
  if (!repos || repos.length === 0) return;

  if (dbInstance && !useJsonFallback) {
    try {
      const stmt = dbInstance.prepare(`
        INSERT INTO github_repos (
          id, name, full_name, owner_login, owner_avatar, description,
          html_url, clone_url, stars, forks, language, topics, stars_today,
          timeframe, updated_at, cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          full_name = excluded.full_name,
          owner_login = excluded.owner_login,
          owner_avatar = excluded.owner_avatar,
          description = excluded.description,
          html_url = excluded.html_url,
          clone_url = excluded.clone_url,
          stars = excluded.stars,
          forks = excluded.forks,
          language = excluded.language,
          topics = excluded.topics,
          stars_today = excluded.stars_today,
          timeframe = excluded.timeframe,
          updated_at = excluded.updated_at,
          cached_at = excluded.cached_at
      `);

      for (const r of repos) {
        stmt.run(
          r.id,
          r.name,
          r.fullName,
          r.owner?.login || '',
          r.owner?.avatarUrl || '',
          r.description || '',
          r.htmlUrl,
          r.cloneUrl,
          r.stars || 0,
          r.forks || 0,
          r.language || 'Unknown',
          JSON.stringify(r.topics || []),
          r.starsToday || 0,
          timeframe,
          r.updatedAt || new Date().toISOString(),
          Date.now()
        );
      }
      return;
    } catch (err) {
      console.warn('SQLite insert github_repos failed, falling back to JSON:', err);
    }
  }

  // Fallback JSON handling
  const data = readJsonFallback();
  const repoMap = new Map(data.githubRepos.map((item) => [item.id, item]));
  for (const r of repos) {
    repoMap.set(r.id, { ...r, timeframe, cachedAt: Date.now() });
  }
  data.githubRepos = Array.from(repoMap.values());
  writeJsonFallback(data);
}

// Retrieve GitHub repositories from local database
export function getGitHubRepos(options?: {
  timeframe?: string;
  language?: string;
  topic?: string;
  query?: string;
  sort?: 'stars' | 'forks' | 'updated';
  limit?: number;
}): GitHubRepo[] {
  const limit = options?.limit || 30;

  if (dbInstance && !useJsonFallback) {
    try {
      let sql = `SELECT * FROM github_repos WHERE 1=1`;
      const params: any[] = [];

      if (options?.timeframe && options.timeframe !== 'all') {
        sql += ` AND timeframe = ?`;
        params.push(options.timeframe);
      }
      if (options?.language && options.language !== 'all') {
        sql += ` AND LOWER(language) = LOWER(?)`;
        params.push(options.language);
      }
      if (options?.query && options.query.trim()) {
        sql += ` AND (name LIKE ? OR description LIKE ? OR full_name LIKE ?)`;
        const q = `%${options.query.trim()}%`;
        params.push(q, q, q);
      }

      if (options?.sort === 'forks') {
        sql += ` ORDER BY forks DESC LIMIT ?`;
      } else if (options?.sort === 'updated') {
        sql += ` ORDER BY updated_at DESC LIMIT ?`;
      } else {
        sql += ` ORDER BY stars DESC LIMIT ?`;
      }
      params.push(limit);

      const rows = dbInstance.prepare(sql).all(...params) as any[];
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: {
          login: r.owner_login,
          avatarUrl: r.owner_avatar,
        },
        description: r.description,
        htmlUrl: r.html_url,
        cloneUrl: r.clone_url,
        stars: r.stars,
        forks: r.forks,
        language: r.language,
        topics: (() => {
          try {
            return JSON.parse(r.topics);
          } catch (_) {
            return [];
          }
        })(),
        updatedAt: r.updated_at,
        starsToday: r.stars_today,
      }));
    } catch (err) {
      console.warn('SQLite query github_repos failed, using fallback:', err);
    }
  }

  // Fallback JSON handling
  const data = readJsonFallback();
  let list = data.githubRepos;
  if (options?.timeframe && options.timeframe !== 'all') {
    list = list.filter((r) => r.timeframe === options.timeframe);
  }
  if (options?.language && options.language !== 'all') {
    list = list.filter((r) => r.language.toLowerCase() === options.language!.toLowerCase());
  }
  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }
  list = list.sort((a, b) => b.stars - a.stars);
  return list.slice(0, limit);
}

// AI Agent Bridge Query Function: Retrieves localized data context for the internal AI agent
export function queryAIContext(userPrompt: string): {
  newsContext: string;
  githubContext: string;
  hasNewsQuery: boolean;
  hasGitHubQuery: boolean;
} {
  const p = userPrompt.toLowerCase();

  const newsKeywords = [
    'news', 'headline', 'techcrunch', 'venturebeat', 'article', 'top 5', 'top 10',
    'startup', 'funding', 'raised', 'seed', 'series a', 'ai model', 'announcement', 'industry'
  ];
  const githubKeywords = [
    'github', 'trending', 'repo', 'repositories', 'stars', 'fork', 'open source',
    'deepseek', 'ollama', 'popular repo', 'most starred'
  ];

  const hasNewsQuery = newsKeywords.some((k) => p.includes(k));
  const hasGitHubQuery = githubKeywords.some((k) => p.includes(k));

  // Fetch latest news articles from SQLite cache
  const articles = getArticles({ limit: 10 });
  let newsContext = '';
  if (articles.length > 0) {
    newsContext = articles.slice(0, 7).map((a, i) => {
      let meta = `[${i + 1}] "${a.title}" | Source: ${a.source} | Category: ${a.category} | Date: ${a.publishedAt.split('T')[0]}`;
      if (a.fundingAmount) meta += ` | Funding: ${a.fundingAmount}`;
      if (a.location) meta += ` | Location: ${a.location}`;
      meta += `\nSummary: ${a.summary}`;
      if (a.content && a.content.length > 30) {
        meta += `\nExcerpt: ${a.content.slice(0, 300)}...`;
      }
      meta += `\nLink: ${a.url}`;
      return meta;
    }).join('\n\n');
  }

  // Fetch top trending repos from SQLite cache
  const repos = getGitHubRepos({ limit: 8 });
  let githubContext = '';
  if (repos.length > 0) {
    githubContext = repos.slice(0, 7).map((r, i) => {
      return `[${i + 1}] ${r.fullName} (${r.language}) - ⭐ ${r.stars.toLocaleString()} stars (+${r.starsToday || 0} today)
Description: ${r.description}
Topics: ${r.topics.slice(0, 5).join(', ')}
Clone/URL: ${r.htmlUrl}`;
    }).join('\n\n');
  }

  return {
    newsContext,
    githubContext,
    hasNewsQuery,
    hasGitHubQuery,
  };
}
