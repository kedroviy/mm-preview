export type GuideSection = {
  title: string;
  paragraphs: string[];
};

export type LongTailGuide = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: GuideSection[];
  /** 3–6 ключевых фраз для <meta name="keywords"> */
  keywords: string[];
};
