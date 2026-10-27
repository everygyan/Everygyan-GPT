import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { fetchArticlesByCategoryPaginated, PaginatedResult } from '../../services/articleService';
import { Article } from '../../types';
import { ArticleCard } from '../../components/common/ArticleCard';
import { LearningHub } from '../../components/learn-german/LearningHub';

export const GermanLanguagePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await fetchArticlesByCategoryPaginated('learn-german', 1, 10);
      setArticles(result.items);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      {/* Main Hub */}
      <LearningHub />
      {/* Supplemental Articles */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4">Explore Supplemental German Articles</h2>
        {loading ? (
          <p className="text-slate-500">Loading articles…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </section>
      <Outlet />
    </>
  );
};
