import { callShopifyApi } from '../ShopifyConfig';

/** Blogs + their latest articles in one call */
export const getAllArticles = async (blogsFirst = 10, articlesFirst = 20) => {
  const query = `
    query {
      blogs(first: ${blogsFirst}) {
        edges {
          node {
            id
            handle
            title
            articles(first: ${articlesFirst}, sortKey: PUBLISHED_AT, reverse: true) {
              edges {
                node {
                  id
                  handle
                  title
                  excerpt
                  content
                  publishedAt
                  authorV2 { name }
                  image { url altText }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await callShopifyApi(query);
  const blogs = data?.blogs?.edges?.map((e: any) => e.node) ?? [];
  // flatten to a single list if you prefer
  const articles = blogs.flatMap((b: any) =>
    (b.articles?.edges ?? []).map((ae: any) => ({
      ...ae.node,
      blogHandle: b.handle,
      blogTitle: b.title,
    })),
  );
  return { blogs, articles };
};
export const getArticlesByBlog = async (
  handle: string,
  first = 20,
  after?: string,
) => {
  const afterArg = after ? `, after: "${after}"` : '';
  const query = `
      query {
        blog(handle: "${handle}") {
          id
          title
          articles(first: ${first}${afterArg}, sortKey: PUBLISHED_AT, reverse: true) {
            pageInfo { hasNextPage endCursor }
            edges { node { id handle title excerpt publishedAt image { url } } }
          }
        }
      }
    `;
  const data = await callShopifyApi(query);
  const a = data?.blog?.articles;
  return {
    items: a?.edges?.map((e: any) => e.node) ?? [],
    pageInfo: a?.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
};
