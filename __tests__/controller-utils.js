const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index.js");
const { checkArticleExists } = require("../utils");

beforeEach(() => seed({ topicData, userData, articleData, commentData }));
afterAll(() => db.end());

describe("checkArticleExists", () => {
  it("Resolves with the article if it exists", () => {
    return checkArticleExists(1).then((article) => {
      expect(article).toMatchObject({
        article_id: 1,
        title: expect.any(String),
        body: expect.any(String),
        votes: expect.any(Number),
        topic: expect.any(String),
        author: expect.any(String),
        created_at: expect.any(Date),
      });
    });
  });

  it("Rejects with a 404 error if the article does not exist", () => {
    return checkArticleExists(9999)
      .then(() => {})
      .catch((err) => {
        expect(err).toEqual({ status: 404, msg: "article not found" });
      });
  });
});
