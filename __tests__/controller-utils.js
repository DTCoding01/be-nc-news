const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index.js");
const { checkArticleExists, checkCommentExists } = require("../utils");

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

describe("checkCommentExists", () => {
  it("Resolves with the comment if it exists", () => {
    return checkCommentExists(1).then((comment) => {
      expect(comment).toMatchObject({
        comment_id: 1,
        author: expect.any(String),
        article_id: expect.any(Number),
        votes: expect.any(Number),
        created_at: expect.any(Date),
        body: expect.any(String),
      });
    });
  });
  it("Rejects with a 404 error if the comment does not exist", () => {
    return checkCommentExists(9999)
      .then()
      .catch((err) => {
        expect(err).toEqual({ status: 404, msg: "comment not found" });
      });
  });
  it("Rejects with a 400 error for invalid comment ID", () => {
    return checkCommentExists("NaN")
      .then()
      .catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
  });
});


