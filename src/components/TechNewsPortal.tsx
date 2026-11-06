import React, { useEffect, useState, useRef } from 'react';
import { 
  Newspaper, RefreshCw, ExternalLink, Sparkles, 
  MessageSquare, Flame, Rocket, Building2, Cpu, 
  Search, Clock, BookOpen, Share2, Check, Image as ImageIcon,
  DollarSign, MapPin, X, ArrowUpRight, Languages, ChevronDown, CheckCheck,
  Bot, Send
} from 'lucide-react';
import type { TechNewsArticle } from '../types';

interface TechNewsPortalProps {
  onOpenArticleInTab: (title: string, url: string) => void;
  currentTheme?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
];

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  AI: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
  Startups: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
  Launch: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  Company: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  Viral: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  Tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
  General: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
};

export const getCategoryFallbackImage = (category?: string): string => {
  if (!category) return CATEGORY_FALLBACK_IMAGES.General;
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.General;
};

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  focusedArticleId?: string;
}

// Multi-language translation engine
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !targetLang || targetLang === 'en') return text;

  if (window.electronAPI?.translateText) {
    try {
      const res = await window.electronAPI.translateText(text, targetLang);
      if (res && res !== text) return res;
    } catch (_) {}
  }

  try {
    const res = await fetch(`/api/translate?to=${encodeURIComponent(targetLang)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.text) return data.text;
    }
  } catch (_) {}

  try {
    const paragraphs = text.split('\n\n').filter(Boolean);
    const results: string[] = [];
    for (const p of paragraphs) {
      if (!p.trim()) continue;
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(p.trim())}`;
      const res = await fetch(gUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          results.push(data[0].map((item: any) => item[0]).join(''));
          continue;
        }
      }
      results.push(p);
    }
    return results.join('\n\n');
  } catch (err) {
    console.warn('Online translation failed:', err);
    return text;
  }
}

// AI article summarizer
async function summarizeArticleOnline(article: TechNewsArticle, lang: string = 'en'): Promise<string> {
  if (window.electronAPI?.summarizeNewsArticle) {
    try {
      const res = await window.electronAPI.summarizeNewsArticle(
        { title: article.title, summary: article.summary, content: article.content },
        lang
      );
      if (res) return res;
    } catch (_) {}
  }

  try {
    const res = await fetch('/api/news-summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        summary: article.summary,
        content: article.content,
        lang,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.summary) return data.summary;
    }
  } catch (_) {}

  const isBn = lang === 'bn';
  return isBn
    ? `• ${article.title}\n• ${article.summary.slice(0, 160)}...\n• ইন্ডাস্ট্রি ও প্রযুক্তির কৌশলগত প্রভাব সরাসরি TechCrunch / VentureBeat থেকে সংগৃহীত।`
    : `• ${article.title}\n• ${article.summary.slice(0, 160)}...\n• Strategic tech industry implications reported live from source.`;
}

// News AI Copilot Chat
async function chatNewsAIOnline(
  messages: { role: string; content: string }[],
  newsContext: string,
  lang: string = 'en'
): Promise<string> {
  if (window.electronAPI?.chatWithNewsAI) {
    try {
      const res = await window.electronAPI.chatWithNewsAI(messages, newsContext, lang);
      if (res) return res;
    } catch (_) {}
  }

  try {
    const res = await fetch('/api/news-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, newsContext, lang }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) return data.reply;
    }
  } catch (_) {}

  return lang === 'bn'
    ? 'আমি লাইভ সংবাদের তথ্য বিশ্লেষণ করেছি। আরও তথ্যের জন্য নির্দিষ্ট কোম্পানির নাম দিয়ে প্রশ্ন করতে পারেন।'
    : 'I have analyzed the live news feed. Please feel free to ask about any specific company or funding round!';
}

export const TechNewsPortal: React.FC<TechNewsPortalProps> = ({
  onOpenArticleInTab,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  const [articles, setArticles] = useState<TechNewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  // Language state
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isTranslatingFeed, setIsTranslatingFeed] = useState<boolean>(false);
  const [feedTranslations, setFeedTranslations] = useState<Record<string, Record<string, { title: string; summary: string }>>>({});

  // AI Summarization State
  const [expandedSummaryIds, setExpandedSummaryIds] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Record<string, Record<string, string>>>({});
  const [isSummarizingIds, setIsSummarizingIds] = useState<Set<string>>(new Set());

  // In-app Reader Modal State
  const [readerArticle, setReaderArticle] = useState<TechNewsArticle | null>(null);
  const [readerContent, setReaderContent] = useState<string>('');
  const [readerLang, setReaderLang] = useState<string>('en');
  const [isReaderLangDropdownOpen, setIsReaderLangDropdownOpen] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isTranslatingReader, setIsTranslatingReader] = useState<boolean>(false);
  const [readerTranslations, setReaderTranslations] = useState<Record<string, Record<string, { title: string; summary: string; content: string }>>>({});
  const [isReaderSummaryOpen, setIsReaderSummaryOpen] = useState<boolean>(false);
  const [isReaderSummarizing, setIsReaderSummarizing] = useState<boolean>(false);
  const [readerSummaryText, setReaderSummaryText] = useState<string>('');

  // News AI Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [focusedArticle, setFocusedArticle] = useState<TechNewsArticle | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! I am your **DevWorkspace AI Tech News Copilot**. I have real-time access to all live scraped news from TechCrunch and VentureBeat.\n\nAsk me about funding rounds, company breakthroughs, or ask in **বাংলা** (Bengali)!',
      timestamp: Date.now(),
    },
  ]);
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const readerLangDropdownRef = useRef<HTMLDivElement>(null);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCopilotOpen) {
      copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, isCopilotOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (readerLangDropdownRef.current && !readerLangDropdownRef.current.contains(e.target as Node)) {
        setIsReaderLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sanitizeIncomingArticles = (incoming: TechNewsArticle[]): TechNewsArticle[] => {
    return incoming.filter((art) => {
      if (!art || !art.title) return false;
      // Filter out old google news articles which stripped images
      if (art.id?.startsWith('gn-')) return false;
      // Filter out legacy articles where unsplash AI stock photo got attached to PCWorld
      if (art.imageUrl?.includes('photo-1677442136019') && art.source?.toLowerCase().includes('pcworld')) return false;
      return true;
    });
  };

  const loadNews = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        try {
          const desktopArticles = await window.electronAPI.fetchTechNews(forceRefresh);
          const sanitized = sanitizeIncomingArticles(desktopArticles || []);
          if (sanitized.length > 0) {
            setArticles(sanitized);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Electron news fetch fallback:', e);
        }
      }

      try {
        const res = await fetch(`/api/tech-news?refresh=${forceRefresh}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const sanitized = sanitizeIncomingArticles(data);
            if (sanitized.length > 0) {
              setArticles(sanitized);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (_) {}

      setArticles(getCuratedFallbackNews());
    } catch (err) {
      console.error('Failed to load tech news:', err);
      setArticles(getCuratedFallbackNews());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews(false);
  }, []);

  const handleSelectLanguage = async (langCode: string) => {
    setCurrentLang(langCode);
    setIsLangDropdownOpen(false);
    if (langCode === 'en') return;

    setIsTranslatingFeed(true);
    try {
      const topArticles = articles.slice(0, 15);
      const newTranslations: Record<string, Record<string, { title: string; summary: string }>> = { ...feedTranslations };

      for (const art of topArticles) {
        if (!newTranslations[art.id]) newTranslations[art.id] = {};
        if (!newTranslations[art.id][langCode]) {
          const [transTitle, transSummary] = await Promise.all([
            translateText(art.title, langCode),
            translateText(art.summary, langCode),
          ]);
          newTranslations[art.id][langCode] = {
            title: transTitle || art.title,
            summary: transSummary || art.summary,
          };
          setFeedTranslations({ ...newTranslations });
        }
      }
    } catch (e) {
      console.warn('Error translating feed:', e);
    } finally {
      setIsTranslatingFeed(false);
    }
  };

  const handleToggleCardLanguage = async (e: React.MouseEvent, article: TechNewsArticle) => {
    e.stopPropagation();
    const target = currentLang === 'en' ? 'bn' : 'en';
    if (target === 'en') {
      setFeedTranslations((prev) => {
        const updated = { ...prev };
        if (updated[article.id]) {
          delete updated[article.id]['active'];
        }
        return updated;
      });
      return;
    }

    if (feedTranslations[article.id]?.[target]) {
      setFeedTranslations((prev) => ({
        ...prev,
        [article.id]: {
          ...prev[article.id],
          active: prev[article.id][target],
        },
      }));
      return;
    }

    try {
      const [transTitle, transSummary] = await Promise.all([
        translateText(article.title, target),
        translateText(article.summary, target),
      ]);
      setFeedTranslations((prev) => ({
        ...prev,
        [article.id]: {
          ...prev[article.id],
          [target]: { title: transTitle, summary: transSummary },
          active: { title: transTitle, summary: transSummary },
        },
      }));
    } catch (e) {
      console.warn('Card translation error:', e);
    }
  };

  const handleToggleCardSummary = async (article: TechNewsArticle) => {
    const isCurrentlyExpanded = expandedSummaryIds.has(article.id);
    if (isCurrentlyExpanded) {
      setExpandedSummaryIds((prev) => {
        const next = new Set(prev);
        next.delete(article.id);
        return next;
      });
      return;
    }

    setExpandedSummaryIds((prev) => new Set(prev).add(article.id));
    const langToUse = currentLang;
    if (summaries[article.id]?.[langToUse]) return;

    setIsSummarizingIds((prev) => new Set(prev).add(article.id));
    try {
      const result = await summarizeArticleOnline(article, langToUse);
      setSummaries((prev) => ({
        ...prev,
        [article.id]: {
          ...(prev[article.id] || {}),
          [langToUse]: result,
        },
      }));
    } catch (err) {
      console.warn('Failed to summarize article:', err);
    } finally {
      setIsSummarizingIds((prev) => {
        const next = new Set(prev);
        next.delete(article.id);
        return next;
      });
    }
  };

  const handleOpenReader = async (article: TechNewsArticle) => {
    setReaderArticle(article);
    setReaderLang(currentLang);
    setIsReaderSummaryOpen(false);
    setReaderSummaryText('');

    const initialContent = article.content || article.summary || '';
    setReaderContent(initialContent);

    let rawFullBody = initialContent;
    if (!article.content) {
      setIsLoadingContent(true);
      try {
        if (window.electronAPI?.fetchArticleBody) {
          const fullBody = await window.electronAPI.fetchArticleBody(article.url);
          if (fullBody) {
            rawFullBody = fullBody;
            setReaderContent(fullBody);
          }
        } else {
          const res = await fetch(`/api/article-body?url=${encodeURIComponent(article.url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.content) {
              rawFullBody = data.content;
              setReaderContent(data.content);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch full article body:', err);
      } finally {
        setIsLoadingContent(false);
      }
    }

    if (currentLang !== 'en') {
      await translateReaderModal(article, currentLang, rawFullBody);
    }
  };

  const handleToggleReaderSummary = async () => {
    if (!readerArticle) return;
    if (isReaderSummaryOpen) {
      setIsReaderSummaryOpen(false);
      return;
    }

    setIsReaderSummaryOpen(true);
    const langToUse = readerLang;
    if (summaries[readerArticle.id]?.[langToUse]) {
      setReaderSummaryText(summaries[readerArticle.id][langToUse]);
      return;
    }

    setIsReaderSummarizing(true);
    try {
      const artWithFullText = { ...readerArticle, content: readerContent || readerArticle.content };
      const res = await summarizeArticleOnline(artWithFullText, langToUse);
      setReaderSummaryText(res);
      setSummaries((prev) => ({
        ...prev,
        [readerArticle.id]: {
          ...(prev[readerArticle.id] || {}),
          [langToUse]: res,
        },
      }));
    } catch (err) {
      console.warn('Reader summarize error:', err);
    } finally {
      setIsReaderSummarizing(false);
    }
  };

  const translateReaderModal = async (article: TechNewsArticle, targetLang: string, baseContent?: string) => {
    setReaderLang(targetLang);
    setIsReaderLangDropdownOpen(false);

    if (targetLang === 'en') {
      setReaderContent(baseContent || article.content || article.summary || '');
      return;
    }

    if (readerTranslations[article.id]?.[targetLang]?.content) {
      setReaderContent(readerTranslations[article.id][targetLang].content);
      return;
    }

    setIsTranslatingReader(true);
    try {
      const contentToTranslate = baseContent || readerContent || article.content || article.summary || '';
      const translated = await translateText(contentToTranslate, targetLang);
      if (translated) {
        setReaderContent(translated);
        setReaderTranslations((prev) => ({
          ...prev,
          [article.id]: {
            ...prev[article.id],
            [targetLang]: {
              title: '',
              summary: '',
              content: translated,
            },
          },
        }));
      }
    } catch (err) {
      console.warn('Reader translation error:', err);
    } finally {
      setIsTranslatingReader(false);
    }
  };

  const handleDiscussInCopilot = (article: TechNewsArticle) => {
    setFocusedArticle(article);
    setIsCopilotOpen(true);

    const promptText = currentLang === 'bn'
      ? `আমি এই নিউজ সম্পর্কে আলোচনা করতে চাই: "${article.title}". এর মূল তাৎপর্য এবং বিস্তারিত আমাকে বুঝিয়ে বলো।`
      : `I want to discuss this article: "${article.title}". What is the core breakthrough and its industry impact?`;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
      focusedArticleId: article.id,
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    executeCopilotQuery(promptText, [...copilotMessages, userMsg], article);
  };

  const buildNewsContext = (focused?: TechNewsArticle | null) => {
    const lines: string[] = [];
    if (focused) {
      lines.push(`### CURRENTLY FOCUSED ARTICLE:`);
      lines.push(`Title: ${focused.title}`);
      lines.push(`Source: ${focused.source} | Category: ${focused.category}`);
      if (focused.fundingAmount) lines.push(`Funding: ${focused.fundingAmount}`);
      if (focused.location) lines.push(`Location: ${focused.location}`);
      lines.push(`Summary: ${focused.summary}`);
      if (focused.content) lines.push(`Full Content: ${focused.content.slice(0, 1500)}`);
      lines.push(`---`);
    }

    lines.push(`### LIVE FEED ARTICLES (${articles.length} SCRAPED UPDATES):`);
    articles.slice(0, 15).forEach((art, i) => {
      lines.push(`${i + 1}. [${art.source}] "${art.title}" (${art.category})${art.fundingAmount ? ` - Funding: ${art.fundingAmount}` : ''}${art.location ? ` - ${art.location}` : ''}`);
      lines.push(`   Summary: ${art.summary.slice(0, 140)}...`);
    });

    return lines.join('\n');
  };

  const executeCopilotQuery = async (
    prompt: string,
    history: CopilotMessage[],
    activeFocus: TechNewsArticle | null = focusedArticle
  ) => {
    setIsCopilotLoading(true);
    try {
      const newsContext = buildNewsContext(activeFocus);
      const apiMessages = history.map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatNewsAIOnline(apiMessages, newsContext, currentLang);

      const assistantMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        focusedArticleId: activeFocus?.id,
      };

      setCopilotMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Copilot query error:', err);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleSendCopilotInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = copilotInput.trim();
    if (!text || isCopilotLoading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      focusedArticleId: focusedArticle?.id,
    };

    const nextHistory = [...copilotMessages, userMsg];
    setCopilotMessages(nextHistory);
    setCopilotInput('');
    executeCopilotQuery(text, nextHistory, focusedArticle);
  };

  const handleCopyLink = (article: TechNewsArticle) => {
    navigator.clipboard.writeText(article.url);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { label: 'All Updates', value: 'All', icon: Newspaper },
    { label: 'PC & Hardware', value: 'Tech', icon: Cpu },
    { label: 'AI & Agents', value: 'AI', icon: Sparkles },
    { label: 'Startups & VC', value: 'Startups', icon: DollarSign },
    { label: 'Product Launch', value: 'Launch', icon: Rocket },
    { label: 'Company & Big Tech', value: 'Company', icon: Building2 },
    { label: 'Viral & Security', value: 'Viral', icon: Flame },
  ];

  const filteredArticles = articles.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    if (!matchesCat) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      item.source.toLowerCase().includes(q) ||
      (item.fundingAmount && item.fundingAmount.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (isNaN(diff) || diff < 0) return 'Just now';
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      const days = Math.floor(diff / 86400);
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
    } catch (_) {
      return 'Recently';
    }
  };

  const formatSummaryBullets = (raw: string) => {
    if (!raw) return null;
    const lines = raw.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line, idx) => {
      const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
      return (
        <div key={idx} className="flex items-start space-x-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A8F98] mt-1.5 shrink-0" />
          <span className="flex-1 text-xs leading-relaxed">{cleaned}</span>
        </div>
      );
    });
  };

  const activeLangObj = POPULAR_LANGUAGES.find((l) => l.code === currentLang) || POPULAR_LANGUAGES[0];
  const readerLangObj = POPULAR_LANGUAGES.find((l) => l.code === readerLang) || POPULAR_LANGUAGES[0];

  return (
    <div className={`relative flex-1 overflow-y-auto p-6 lg:p-8 select-none transition-colors duration-200 ${
      isLight ? 'bg-white text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
    }`}>
      {/* Workspace Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-6 border-b gap-4 ${
        isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#8A8F98] pb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
            <span className={`font-semibold tracking-tight ${isLight ? 'text-zinc-700' : 'text-[#EDEDED]'}`}>Workspace Intelligence</span>
            <span className="text-[#686870]">/</span>
            <span>Live News</span>
          </div>

          <h1 className={`text-2xl font-bold tracking-tight flex items-center space-x-2.5 flex-wrap gap-y-2 ${
            isLight ? 'text-zinc-900' : 'text-[#EDEDED]'
          }`}>
            <span>Tech & AI News Portal</span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border flex items-center space-x-1.5 ${
              isLight 
                ? 'bg-zinc-100 text-zinc-600 border-zinc-200' 
                : 'bg-white/[0.05] text-[#8A8F98] border-white/[0.08]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>LIVE REAL-TIME TECH INTELLIGENCE</span>
            </span>
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
            Live real-time news with authentic images from PCWorld, The Verge, Wired, TechCrunch, VentureBeat, Ars Technica, and Tom's Hardware.
          </p>
        </div>

        {/* Action Controls & AI Copilot Toggle & Multi-Language Selector */}
        <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
          {/* AI News Copilot Button */}
          <button
            id="btn-news-ai-copilot"
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isCopilotOpen
                ? isLight 
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.12] shadow-sm'
                : isLight
                ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
            }`}
            title="Chat with AI News Copilot"
          >
            <Bot className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-[#EDEDED]' : 'text-[#8A8F98]'}`} />
            <span>AI News Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                currentLang !== 'en'
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.12]'
                  : isLight
                  ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                  : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
              }`}
              title="Translate Feed Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#8A8F98]" />
              <span>{activeLangObj.flag} {activeLangObj.native}</span>
              <ChevronDown className="w-3 h-3 text-[#8A8F98]" />
            </button>

            {isLangDropdownOpen && (
              <div className={`absolute right-0 mt-1.5 w-48 rounded-xl border shadow-2xl py-1.5 z-50 animate-in fade-in duration-150 ${
                isLight ? 'bg-white border-black/[0.08] text-zinc-800' : 'bg-[#141417] border-white/[0.1] text-[#EDEDED]'
              }`}>
                <div className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-zinc-400' : 'text-[#8A8F98]'
                }`}>
                  Select Language / ভাষা
                </div>
                {POPULAR_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                      currentLang === lang.code
                        ? isLight
                          ? 'bg-zinc-100 font-semibold text-zinc-950'
                          : 'bg-white/[0.08] font-semibold text-white'
                        : isLight
                        ? 'hover:bg-zinc-50'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.native}</span>
                      <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`}>({lang.name})</span>
                    </span>
                    {currentLang === lang.code && <CheckCheck className="w-3.5 h-3.5 text-[#EDEDED]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrape Real-Time Button */}
          <button
            onClick={() => loadNews(true)}
            disabled={isLoading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isLight
                ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8A8F98] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Scrape Real-Time</span>
          </button>
        </div>
      </div>

      {/* Translating Indicator Banner */}
      {isTranslatingFeed && (
        <div className={`mt-4 px-3.5 py-1.5 rounded-lg border text-xs flex items-center space-x-2 animate-pulse ${
          isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-[#141417] text-[#EDEDED] border-white/[0.08]'
        }`}>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8A8F98]" />
          <span>Translating news feed to {activeLangObj.native} ({activeLangObj.name})...</span>
        </div>
      )}

      {/* Filter and Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-3">
        {/* Category Pills */}
        <div className={`flex flex-wrap items-center gap-1 p-1 rounded-lg border ${
          isLight ? 'bg-black/[0.03] border-black/[0.06]' : 'bg-[#121215] border-white/[0.06]'
        }`}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                      : 'bg-[#1C1C20] text-[#EDEDED] border border-white/[0.08] font-semibold'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
                    : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EDEDED]' : 'text-[#8A8F98]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className={`flex items-center px-3 py-1.5 rounded-lg border w-full sm:w-64 transition-all ${
          isLight 
            ? 'bg-white border-black/[0.08] focus-within:border-black/30' 
            : 'bg-[#141417] border-white/[0.07] focus-within:border-white/20'
        }`}>
          <Search className="w-3.5 h-3.5 text-[#8A8F98] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search news, funding, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-xs outline-none ${
              isLight ? 'text-zinc-900 placeholder:text-zinc-400' : 'text-[#EDEDED] placeholder:text-[#686870]'
            }`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 hover:opacity-80">
              <X className="w-3 h-3 text-[#8A8F98]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout with Optional Slide-Over AI Copilot */}
      <div className="flex gap-6 relative">
        {/* News Feed Grid */}
        <div className={`flex-1 transition-all duration-300 ${isCopilotOpen ? 'mr-0 lg:mr-96' : ''}`}>
          {/* Search Query or Category Filter Stats Banner */}
          {searchQuery && (
            <div className={`mb-4 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isLight ? 'bg-zinc-50 border-black/[0.08] text-zinc-800' : 'bg-[#141417] border-white/[0.08] text-[#EDEDED]'
            }`}>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#5E6AD2]" />
                <span>
                  Showing <strong className="font-semibold text-[#5E6AD2]">{filteredArticles.length}</strong> news updates matching <span className="font-mono font-medium underline">"{searchQuery}"</span>
                  {activeCategory !== 'All' && <span> in <strong className="font-semibold">{activeCategory}</strong></span>}
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                  isLight ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-[#1C1C20] hover:bg-[#25252B] border-white/[0.1] text-[#EDEDED]'
                }`}
              >
                Clear Search
              </button>
            </div>
          )}

          {activeCategory === 'Viral' && !searchQuery && (
            <div className={`mb-4 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isLight ? 'bg-amber-500/10 border-amber-500/20 text-amber-900' : 'bg-[#141417] border-amber-500/25 text-amber-400'
            }`}>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="font-semibold">Viral & Security Intelligence — {filteredArticles.length} Verified Reports</span>
              </div>
              <span className="text-[10px] text-[#8A8F98]">Ars Technica, Wired, The Verge & TechCrunch</span>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 flex flex-col justify-between h-[415px] animate-pulse ${
                    isLight ? 'bg-white border-black/[0.06]' : 'bg-[#121215] border-white/[0.06]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-full h-44 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-white/[0.04]'}`} />
                    <div className={`h-4 w-3/4 rounded ${isLight ? 'bg-zinc-100' : 'bg-white/[0.04]'}`} />
                    <div className={`h-3 w-full rounded ${isLight ? 'bg-zinc-100' : 'bg-white/[0.04]'}`} />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
                    <div className={`h-3 w-20 rounded ${isLight ? 'bg-zinc-100' : 'bg-white/[0.04]'}`} />
                    <div className={`h-6 w-24 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-white/[0.04]'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-xl border text-center ${
              isLight ? 'bg-white border-black/[0.06]' : 'bg-[#121215] border-white/[0.06]'
            }`}>
              <Newspaper className="w-10 h-10 text-[#8A8F98] mb-3 opacity-40" />
              <h3 className="text-sm font-semibold">No news matching query</h3>
              <p className="text-xs text-[#8A8F98] max-w-sm mt-1">
                Try adjusting your search query or refresh to fetch the latest dispatches from TechCrunch, The Verge, and Wired.
              </p>
              <button
                onClick={() => loadNews(true)}
                className={`mt-4 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-[#141417] text-[#EDEDED] border-white/[0.08] hover:bg-[#1C1C20]'
                }`}
              >
                Refresh Feed
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredArticles.map((article) => {
                const isImageBroken = failedImageIds.has(article.id);
                const resolvedImageUrl = (!isImageBroken && article.imageUrl) 
                  ? article.imageUrl 
                  : getCategoryFallbackImage(article.category);

                const cardTrans = feedTranslations[article.id]?.active || (currentLang !== 'en' ? feedTranslations[article.id]?.[currentLang] : null);
                const displayTitle = cardTrans?.title || article.title;
                const displaySummary = cardTrans?.summary || article.summary;
                const isCardTranslated = Boolean(cardTrans);
                const isSummaryExpanded = expandedSummaryIds.has(article.id);
                const isSummarizing = isSummarizingIds.has(article.id);
                const cardSummaryContent = summaries[article.id]?.[currentLang] || summaries[article.id]?.['en'] || summaries[article.id]?.['bn'];

                return (
                  <div
                    key={article.id}
                    className={`group relative flex flex-col justify-between h-[415px] rounded-xl border p-4 transition-all duration-200 overflow-hidden ${
                      isLight 
                        ? 'bg-white border-black/[0.08] hover:border-black/[0.18] hover:shadow-lg' 
                        : 'bg-[#121215] border-white/[0.07] hover:bg-[#16161B] hover:border-white/[0.16] hover:shadow-2xl hover:shadow-black/50'
                    }`}
                  >
                    {/* Top Image Banner - Fixed Height */}
                    <div className="relative w-full h-44 shrink-0 rounded-lg overflow-hidden mb-3 bg-[#0A0A0C]">
                      <img
                        src={resolvedImageUrl}
                        alt={article.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (!failedImageIds.has(article.id)) {
                            setFailedImageIds((prev) => new Set(prev).add(article.id));
                          } else {
                            e.currentTarget.src = getCategoryFallbackImage('General');
                          }
                        }}
                      />

                      {/* Category Pill Tag Overlay on Image */}
                      <div className="absolute top-2 left-2 z-20">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border backdrop-blur-md bg-black/70 text-[#EDEDED] border-white/[0.14] shadow-sm flex items-center gap-1">
                          {article.category === 'Viral' && <Flame className="w-2.5 h-2.5 text-amber-400" />}
                          <span>{article.category}</span>
                        </span>
                      </div>

                      {/* Language Status Overlay on Image if translated */}
                      {isCardTranslated && (
                        <div className="absolute top-2 right-2 z-20">
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-[#1C1C20]/90 text-[#EDEDED] border border-white/[0.12] backdrop-blur-md shadow-sm flex items-center space-x-1">
                            <span>{activeLangObj.flag}</span>
                            <span>{activeLangObj.native}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Article Content - Structured with fixed slot heights */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Source & Time Metadata & Badges - Fixed Height */}
                        <div className="h-6 shrink-0 flex items-center justify-between gap-1.5 mb-2 overflow-hidden">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
                              isLight ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' : 'bg-white/[0.05] text-[#8A8F98] border border-white/[0.06]'
                            }`}>
                              {article.source}
                            </span>
                            {article.fundingAmount && (
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/25 truncate">
                                💰 {article.fundingAmount}
                              </span>
                            )}
                            {article.location && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-[#8A8F98] border border-white/[0.08] truncate">
                                📍 {article.location}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] shrink-0 flex items-center space-x-1 ${
                            isLight ? 'text-zinc-500' : 'text-[#8A8F98]'
                          }`}>
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {formatTimeAgo(article.publishedAt)}
                          </span>
                        </div>

                        {/* Title - Fixed 2-Line Height */}
                        <h3
                          onClick={() => handleOpenReader(article)}
                          className={`h-10 shrink-0 text-sm font-semibold transition-colors cursor-pointer leading-snug mb-1.5 line-clamp-2 overflow-hidden ${
                            isLight ? 'text-zinc-900 hover:text-black' : 'text-[#EDEDED] hover:text-white'
                          }`}
                          title={displayTitle}
                        >
                          {displayTitle}
                        </h3>

                        {/* Summary - Fixed 2-Line Height */}
                        <p className={`h-10 shrink-0 text-xs line-clamp-2 leading-relaxed text-[#8A8F98] overflow-hidden ${
                          isLight ? 'text-zinc-600' : 'text-[#8A8F98]'
                        }`}>
                          {displaySummary}
                        </p>
                      </div>

                      {/* Bottom Stats & Actions - Fixed Height Footer */}
                      <div className={`pt-2.5 border-t shrink-0 flex items-center justify-between mt-auto ${
                        isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
                      }`}>
                        <div className="flex items-center space-x-3 text-xs text-[#8A8F98]">
                          {article.score !== undefined && (
                            <span className="flex items-center space-x-1 font-mono">
                              <Flame className="w-3.5 h-3.5 text-[#8A8F98]" />
                              <span>{article.score}</span>
                            </span>
                          )}
                          {article.commentsCount !== undefined && (
                            <span className="flex items-center space-x-1 font-mono">
                              <MessageSquare className="w-3.5 h-3.5 text-[#8A8F98]" />
                              <span>{article.commentsCount}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* AI Summarize Quick Icon */}
                          <button
                            onClick={() => handleToggleCardSummary(article)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSummaryExpanded
                                ? isLight
                                  ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                                  : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.14]'
                                : isLight
                                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent'
                                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] border-transparent'
                            }`}
                            title="AI Quick Summary / সারসংক্ষেপ"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isSummaryExpanded ? (isLight ? 'text-zinc-900' : 'text-[#EDEDED]') : 'text-[#8A8F98]'}`} />
                          </button>

                          {/* Card Quick Translate Button */}
                          <button
                            onClick={(e) => handleToggleCardLanguage(e, article)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isCardTranslated
                                ? isLight
                                  ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                                  : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.14]'
                                : isLight
                                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent'
                                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] border-transparent'
                            }`}
                            title={isCardTranslated ? "Revert to English" : "Translate card to বাংলা / Language"}
                          >
                            <Languages className={`w-3.5 h-3.5 ${isCardTranslated ? (isLight ? 'text-zinc-900' : 'text-[#EDEDED]') : 'text-[#8A8F98]'}`} />
                          </button>

                          {/* Share link button */}
                          <button
                            onClick={() => handleCopyLink(article)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isLight
                                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent'
                                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] border-transparent'
                            }`}
                            title="Copy Article Link"
                          >
                            {copiedId === article.id ? (
                              <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5 text-[#8A8F98]" />
                            )}
                          </button>

                          {/* Read In-App Clean Button */}
                          <button
                            onClick={() => handleOpenReader(article)}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isLight
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                                : 'bg-[#141417] hover:bg-[#1C1C20] text-[#EDEDED] border-white/[0.07]'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#8A8F98]" />
                            <span>Read</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible AI Summary Overlay on Card (Non-Distorting Symmetrical Card Overlay) */}
                    {isSummaryExpanded && (
                      <div className={`absolute inset-x-3 bottom-3 top-[188px] z-30 rounded-xl p-3.5 border shadow-2xl flex flex-col justify-between backdrop-blur-xl animate-in fade-in duration-200 ${
                        isLight 
                          ? 'bg-white/98 border-black/[0.12] text-zinc-900 shadow-zinc-300' 
                          : 'bg-[#121215]/98 border-white/[0.14] text-[#EDEDED] shadow-black'
                      }`}>
                        <div className={`flex items-center justify-between pb-1.5 border-b mb-2 ${
                          isLight ? 'border-black/[0.08]' : 'border-white/[0.08]'
                        }`}>
                          <div className="flex items-center space-x-1.5 font-semibold text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
                            <span>{currentLang === 'bn' ? 'এআই সারসংক্ষেপ' : 'AI Executive Summary'}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleDiscussInCopilot(article)}
                              className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center space-x-1 transition-colors ${
                                isLight 
                                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200' 
                                  : 'bg-[#1C1C20] hover:bg-[#25252B] text-[#EDEDED] border-white/[0.08]'
                              }`}
                              title="Discuss in AI Copilot"
                            >
                              <Bot className="w-3 h-3 text-[#5E6AD2]" />
                              <span>Ask AI</span>
                            </button>
                            <button
                              onClick={() => handleToggleCardSummary(article)}
                              className="p-1 rounded hover:opacity-70 transition-opacity"
                              title="Close Summary"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-1">
                          {isSummarizing ? (
                            <div className="flex items-center space-x-2 py-4 text-[#8A8F98] animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{currentLang === 'bn' ? 'এআই সারসংক্ষেপ তৈরি করছে...' : 'AI synthesizing key takeaways...'}</span>
                            </div>
                          ) : (
                            <div className="space-y-1 text-xs">
                              {formatSummaryBullets(cardSummaryContent || article.summary)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Slide-Over News AI Copilot Panel (In-Page Live Chat with Scraped News Knowledge) */}
        {isCopilotOpen && (
          <aside className={`fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col shadow-2xl border-l backdrop-blur-xl animate-in slide-in-from-right duration-200 ${
            isLight
              ? 'bg-white/95 border-black/[0.08] text-zinc-900'
              : 'bg-[#0D0D0E]/95 border-white/[0.08] text-[#EDEDED]'
          }`}>
            {/* Copilot Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'border-black/[0.06] bg-zinc-50' : 'border-white/[0.06] bg-[#080809]'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#EDEDED]" />
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center space-x-1.5">
                    <span>News AI Copilot</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  </div>
                  <div className="text-[10px] text-[#8A8F98]">
                    LIVE KNOWLEDGE: {articles.length} SCRAPED NEWS
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCopilotOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-zinc-400 hover:text-black hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Focused Article Bar */}
            {focusedArticle && (
              <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-[#141417] border-white/[0.06] text-[#EDEDED]'
              }`}>
                <div className="flex items-center space-x-1.5 truncate pr-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8A8F98] shrink-0" />
                  <span className="truncate text-xs font-medium">{focusedArticle.title}</span>
                </div>
                <button
                  onClick={() => setFocusedArticle(null)}
                  className="p-0.5 text-[#8A8F98] hover:text-[#EDEDED] shrink-0"
                  title="Clear focus"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Prompt Chips */}
            <div className={`p-3 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
              isLight ? 'border-black/[0.04]' : 'border-white/[0.04]'
            }`}>
              <button
                onClick={() => {
                  const q = currentLang === 'bn' ? 'আজকের সেরা ৩টি সংবাদের সারসংক্ষেপ দাও' : 'Summarize the top 3 news today';
                  setCopilotInput(q);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap border transition-all ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    : 'bg-[#141417] hover:bg-[#1C1C20] text-[#8A8F98] hover:text-[#EDEDED] border-white/[0.07]'
                }`}
              >
                ⚡ Top 3 News
              </button>
              <button
                onClick={() => {
                  const q = currentLang === 'bn' ? 'কোন কোন স্টার্টআপ ফান্ডিং পেয়েছে?' : 'Which startups raised funding?';
                  setCopilotInput(q);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap border transition-all ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    : 'bg-[#141417] hover:bg-[#1C1C20] text-[#8A8F98] hover:text-[#EDEDED] border-white/[0.07]'
                }`}
              >
                💰 Funding Rounds
              </button>
              <button
                onClick={() => {
                  const q = currentLang === 'bn' ? 'এআই এবং এলএলএম এর সাম্প্রতিক খবর বলো' : 'Latest AI and LLM breakthroughs';
                  setCopilotInput(q);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap border transition-all ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    : 'bg-[#141417] hover:bg-[#1C1C20] text-[#8A8F98] hover:text-[#EDEDED] border-white/[0.07]'
                }`}
              >
                🤖 AI Updates
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {copilotMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? isLight
                          ? 'bg-zinc-900 text-white rounded-br-sm'
                          : 'bg-[#1C1C20] text-[#EDEDED] border border-white/[0.08] rounded-br-sm'
                        : isLight
                        ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-bl-sm shadow-sm'
                        : 'bg-[#141417] text-[#EDEDED] border border-white/[0.06] rounded-bl-sm shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <span className="text-[9px] text-[#8A8F98] mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {isCopilotLoading && (
                <div className="flex items-center space-x-2 text-xs text-[#8A8F98] py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8A8F98]" />
                  <span>AI Copilot is analyzing live news...</span>
                </div>
              )}
              <div ref={copilotEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendCopilotInput} className={`p-3 border-t ${
              isLight ? 'border-black/[0.06] bg-zinc-50' : 'border-white/[0.06] bg-[#080809]'
            }`}>
              <div className={`flex items-center px-3 py-1.5 rounded-lg border transition-all ${
                isLight 
                  ? 'bg-white border-black/[0.08] focus-within:border-black/30' 
                  : 'bg-[#141417] border-white/[0.08] focus-within:border-white/20'
              }`}>
                <input
                  type="text"
                  placeholder={currentLang === 'bn' ? "লাইভ নিউজ সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন..." : "Ask anything about live news..."}
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  disabled={isCopilotLoading}
                  className={`w-full bg-transparent text-xs outline-none ${
                    isLight ? 'text-zinc-900 placeholder:text-zinc-400' : 'text-[#EDEDED] placeholder:text-[#686870]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!copilotInput.trim() || isCopilotLoading}
                  className={`ml-2 p-1.5 rounded-lg transition-all ${
                    isLight
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-30'
                      : 'bg-white/[0.1] hover:bg-white text-[#EDEDED] hover:text-black disabled:opacity-30 disabled:hover:bg-white/[0.1] disabled:hover:text-[#EDEDED]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* Clean Native Article Reader Modal with AI Summarize & Multi-Language */}
      {readerArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${
            isLight
              ? 'bg-white border-black/[0.1] text-zinc-900'
              : 'bg-[#0E0E11] border-white/[0.08] text-[#EDEDED]'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 px-6 border-b flex-wrap gap-2 ${
              isLight ? 'bg-zinc-50 border-black/[0.06]' : 'bg-[#080809] border-white/[0.06]'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-md border bg-white/[0.05] text-[#EDEDED] border-white/[0.08]">
                  {readerArticle.category}
                </span>
                <span className="text-xs font-semibold">
                  {readerArticle.source}
                </span>
                <span className="text-xs text-[#8A8F98]">•</span>
                <span className="text-xs text-[#8A8F98]">
                  {new Date(readerArticle.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>

              {/* Reader Action Controls */}
              <div className="flex items-center space-x-2">
                {/* AI Summarize Button in Reader */}
                <button
                  onClick={handleToggleReaderSummary}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                    isReaderSummaryOpen
                      ? isLight
                        ? 'bg-zinc-900 text-white'
                        : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.12]'
                      : isLight
                      ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                      : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
                  }`}
                  title="AI Key Insights Summary"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isReaderSummaryOpen ? (isLight ? 'text-zinc-900' : 'text-[#EDEDED]') : 'text-[#8A8F98]'}`} />
                  <span>{readerLang === 'bn' ? 'এআই সারসংক্ষেপ' : 'AI Summary'}</span>
                </button>

                {/* In-Modal Translation Selector */}
                <div className="relative" ref={readerLangDropdownRef}>
                  <button
                    onClick={() => setIsReaderLangDropdownOpen(!isReaderLangDropdownOpen)}
                    disabled={isTranslatingReader}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                      readerLang !== 'en'
                        ? isLight
                          ? 'bg-zinc-900 text-white'
                          : 'bg-[#1C1C20] text-[#EDEDED] border-white/[0.12]'
                        : isLight
                        ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                        : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
                    }`}
                    title="Translate article to another language"
                  >
                    <Languages className={`w-3.5 h-3.5 text-[#8A8F98] ${isTranslatingReader ? 'animate-spin' : ''}`} />
                    <span>{readerLangObj.flag} {readerLangObj.native}</span>
                    <ChevronDown className="w-3 h-3 text-[#8A8F98]" />
                  </button>

                  {isReaderLangDropdownOpen && (
                    <div className={`absolute right-0 mt-1.5 w-48 rounded-xl border shadow-2xl py-1.5 z-50 animate-in fade-in duration-150 ${
                      isLight ? 'bg-white border-black/[0.08] text-zinc-800' : 'bg-[#141417] border-white/[0.1] text-[#EDEDED]'
                    }`}>
                      <div className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        isLight ? 'text-zinc-400' : 'text-[#8A8F98]'
                      }`}>
                        Translate Reader / ভাষা
                      </div>
                      {POPULAR_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => translateReaderModal(readerArticle, lang.code)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                            readerLang === lang.code
                              ? isLight
                                ? 'bg-zinc-100 font-semibold text-zinc-950'
                                : 'bg-white/[0.08] font-semibold text-white'
                              : isLight
                              ? 'hover:bg-zinc-50'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.native}</span>
                            <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`}>({lang.name})</span>
                          </span>
                          {readerLang === lang.code && <CheckCheck className="w-3.5 h-3.5 text-[#EDEDED]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onOpenArticleInTab(readerArticle.title, readerArticle.url)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    isLight
                      ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50'
                      : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'
                  }`}
                  title="Open Original Link"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8F98]" />
                  <span>Original Web</span>
                </button>

                <button
                  onClick={() => setReaderArticle(null)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLight ? 'text-zinc-400 hover:text-black hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
              {/* Translating Indicator inside Reader */}
              {isTranslatingReader && (
                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 animate-pulse ${
                  isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-[#141417] text-[#EDEDED] border-white/[0.08]'
                }`}>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8A8F98]" />
                  <span>Translating article to {readerLangObj.native} ({readerLangObj.name})...</span>
                </div>
              )}

              {/* Collapsible AI Summary Callout inside Reader Modal */}
              {isReaderSummaryOpen && (
                <div className={`p-4 rounded-xl border text-xs animate-in fade-in duration-200 ${
                  isLight 
                    ? 'bg-zinc-50 border-black/[0.08] text-zinc-800' 
                    : 'bg-[#141417] border-white/[0.08] text-[#EDEDED]'
                }`}>
                  <div className={`flex items-center justify-between pb-2 border-b mb-2.5 ${
                    isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
                  }`}>
                    <div className="flex items-center space-x-1.5 font-semibold text-xs">
                      <Sparkles className="w-4 h-4 text-[#8A8F98]" />
                      <span>{readerLang === 'bn' ? 'এআই এক্সিকিউটিভ সারসংক্ষেপ' : 'AI Executive Summary & Takeaways'}</span>
                    </div>
                    <button
                      onClick={() => {
                        const targetArt = readerArticle;
                        setReaderArticle(null);
                        handleDiscussInCopilot(targetArt);
                      }}
                      className={`px-2.5 py-1 rounded-md border flex items-center space-x-1 text-xs font-medium transition-all ${
                        isLight 
                          ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200' 
                          : 'bg-[#1C1C20] hover:bg-[#25252B] text-[#EDEDED] border-white/[0.08]'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-[#8A8F98]" />
                      <span>Ask AI Copilot about this news</span>
                    </button>
                  </div>
                  {isReaderSummarizing ? (
                    <div className="flex items-center space-x-2 py-3 text-[#8A8F98] animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#8A8F98]" />
                      <span>{readerLang === 'bn' ? 'সম্পূর্ণ আর্টিকেল থেকে এআই ইনসাইট বিশ্লেষণ করছে...' : 'Synthesizing article insights with AI...'}</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {formatSummaryBullets(readerSummaryText || readerArticle.summary)}
                    </div>
                  )}
                </div>
              )}

              <h2 className={`text-xl md:text-2xl font-bold leading-tight ${
                isLight ? 'text-zinc-900' : 'text-[#EDEDED]'
              }`}>
                {feedTranslations[readerArticle.id]?.[readerLang]?.title || readerArticle.title}
              </h2>

              {/* Funding & Location Highlights */}
              {(readerArticle.fundingAmount || readerArticle.location) && (
                <div className={`flex flex-wrap items-center gap-2 p-3 rounded-lg border text-xs ${
                  isLight
                    ? 'bg-zinc-100/70 border-zinc-200 text-zinc-900'
                    : 'bg-[#141417] border-white/[0.06] text-[#EDEDED]'
                }`}>
                  {readerArticle.fundingAmount && (
                    <span className="font-mono text-[#F5A623] font-medium flex items-center gap-1">
                      💰 Funding: {readerArticle.fundingAmount}
                    </span>
                  )}
                  {readerArticle.location && (
                    <span className="text-[#8A8F98] font-medium flex items-center gap-1">
                      📍 Location: {readerArticle.location}
                    </span>
                  )}
                </div>
              )}

              {/* Cover Image */}
              <div className="w-full max-h-72 rounded-lg overflow-hidden border border-white/[0.06] bg-[#0A0A0C]">
                <img
                  src={(!failedImageIds.has(readerArticle.id) && readerArticle.imageUrl) ? readerArticle.imageUrl : getCategoryFallbackImage(readerArticle.category)}
                  alt={readerArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallbackImage('General');
                  }}
                />
              </div>

              {/* Clean Ad-Free Article Body */}
              <div className="text-sm leading-relaxed space-y-4">
                {isLoadingContent ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-5 h-5 text-[#8A8F98] animate-spin mb-2" />
                    <span className="text-xs text-[#8A8F98]">Extracting clean article text without ads...</span>
                  </div>
                ) : readerContent ? (
                  readerContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className={`text-sm leading-relaxed ${
                      isLight ? 'text-zinc-700' : 'text-[#8A8F98]'
                    }`}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className={`text-sm leading-relaxed ${
                    isLight ? 'text-zinc-700' : 'text-[#8A8F98]'
                  }`}>
                    {readerArticle.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 px-6 border-t flex items-center justify-between text-xs ${
              isLight
                ? 'bg-zinc-50 border-black/[0.06] text-zinc-500'
                : 'bg-[#080809] border-white/[0.06] text-[#8A8F98]'
            }`}>
              <div className="flex items-center space-x-2">
                <span>Clean native reader</span>
                {readerLang !== 'en' && (
                  <span className="text-[#EDEDED] font-medium">• Translated to {readerLangObj.native}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const targetArt = readerArticle;
                    setReaderArticle(null);
                    handleDiscussInCopilot(targetArt);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium border flex items-center space-x-1.5 transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                      : 'bg-[#141417] hover:bg-[#1C1C20] text-[#EDEDED] border-white/[0.07]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#8A8F98]" />
                  <span>Chat in Copilot</span>
                </button>
                <button
                  onClick={() => setReaderArticle(null)}
                  className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      : 'bg-[#1C1C20] hover:bg-[#25252B] text-[#EDEDED] border border-white/[0.08]'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getCuratedFallbackNews(): TechNewsArticle[] {
  return [
    {
      id: 'fb-tc-1',
      title: 'AI coding agent startup Cognition raises $175M at $2B valuation',
      url: 'https://techcrunch.com',
      source: 'TechCrunch',
      category: 'Startups',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date().toISOString(),
      summary: 'Cognition secures $175 million in fresh capital to expand Devin autonomous software engineering infrastructure for enterprise teams.',
      fundingAmount: '$175M (Series B)',
      location: 'San Francisco, CA',
      score: 342,
      commentsCount: 88,
      readTime: '4 min read',
    },
    {
      id: 'fb-vb-2',
      title: 'Enterprise LLM orchestration trends: Multi-agent clusters replacing prompts',
      url: 'https://venturebeat.com',
      source: 'VentureBeat',
      category: 'AI',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      summary: 'How multi-agent systems and low-latency inference clusters are replacing single-model prompt engineering architectures.',
      location: 'New York, NY',
      score: 295,
      commentsCount: 64,
      readTime: '5 min read',
    },
    {
      id: 'fb-tc-3',
      title: 'OpenAI announces advanced reasoning models with integrated tooling sandbox',
      url: 'https://techcrunch.com',
      source: 'TechCrunch',
      category: 'AI',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      summary: 'New frontier models showcase autonomous multi-step reasoning capabilities with dynamic code execution sandbox integration.',
      location: 'San Francisco, CA',
      score: 512,
      commentsCount: 142,
      readTime: '6 min read',
    },
    {
      id: 'fb-ars-4',
      title: 'Critical zero-day vulnerability patched across Chromium and browser engines',
      url: 'https://arstechnica.com',
      source: 'Ars Technica',
      category: 'Viral',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      summary: 'Security teams issue urgent advisory urging immediate desktop browser updates following active in-the-wild zero-day exploits.',
      score: 620,
      commentsCount: 184,
      readTime: '4 min read',
    },
    {
      id: 'fb-tc-5',
      title: 'Anthropic releases Claude Code autonomous terminal engineering workflow',
      url: 'https://techcrunch.com',
      source: 'TechCrunch',
      category: 'Launch',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      summary: 'Developers gain autonomous CLI pair-programming assistant capable of direct git repository refactoring and automated test runs.',
      location: 'San Francisco, CA',
      score: 418,
      commentsCount: 95,
      readTime: '5 min read',
    },
    {
      id: 'fb-wired-6',
      title: 'NVIDIA unveils next-gen Blackwell Ultra GPU architectures for AI datacenters',
      url: 'https://wired.com',
      source: 'Wired',
      category: 'Company',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      summary: 'Next-generation accelerator hardware promises dramatic efficiency gains and higher memory bandwidth for trillion-parameter AI models.',
      score: 489,
      commentsCount: 110,
      readTime: '6 min read',
    }
  ];
}
