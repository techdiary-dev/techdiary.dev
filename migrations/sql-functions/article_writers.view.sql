CREATE VIEW user_article_stats AS
 WITH user_articles AS (
         SELECT u.email,
            u.username,
            json_build_object('published_article_count', count(a.id)) AS attributes,
            count(a.id) AS published_article_count
           FROM users u
             JOIN articles a ON a.author_id = u.id
          WHERE a.published_at IS NOT NULL
          GROUP BY u.id, u.email, u.username
        )
 SELECT email,
    username,
    attributes
   FROM user_articles
  ORDER BY published_article_count DESC;