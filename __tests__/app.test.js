const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");

beforeEach(() => seed({ topicData, userData, articleData, commentData }));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  it("Returns an array", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { rows } }) => {
        expect(Array.isArray(rows)).toBe(true);
      });
  });
  it("Returns an array containing objects with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { rows } }) => {
        rows.forEach((object) => {
          expect(object).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api", () => {
  it("Returns an object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { response } }) => {
        expect(typeof response).toBe("object");
      });
  });
  it("Returns the endpoints.json data", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { response } }) => {
        expect(response).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("Responds with the article object of the chosen id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("Responds with an error 404 if an id is entered that does not exist", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "not found" });
      });
  });
  it("Responds with an error 400 if an invalid id is entered", () => {
    return request(app)
      .get("/api/articles/NaN")
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "invalid input" });
      });
  });
});

describe("GET /api/articles", () => {
  it("Responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  it("Does not include a body property on any of the objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article.hasOwnProperty("body")).toBe(false);
        });
      });
  });
  it("Sorts the array by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          coearce: true,
          descending: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("Returns an array of comment objects for the chosen article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  it("Returns an array sorted by created_at date", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", {
          coerce: true,
          descending: true,
        });
      });
  });
  it("Responds with an error 404 if an id is entered that does not exist", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "not found" });
      });
  });
  it("Responds with an error 400 if an invalid id is entered", () => {
    return request(app)
      .get("/api/articles/NaN/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "invalid input" });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("Posts a new comment to the specific article and returns the comment", () => {
    const comment = {
      username: "butter_bridge",
      body: "comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(comment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 19,
          body: "comment",
          article_id: 1,
          author: "butter_bridge",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  it("Returns an error if an invalid comment object is sent", () => {
    const invalidComments = [
      {
        invalidKey: "error",
      },
      {
        invalidKey: "error",
        body: "comment",
      },
      {
        invalidKey: "error",
        body: "comment",
        username: "butter_bridge",
      },
    ];
    invalidComments.forEach((invalidComment) => {
      return request(app)
        .post("/api/articles/1/comments")
        .send(invalidComment)
        .expect(400)
        .then(({ body }) => {
          expect(body).toMatchObject({ msg: "invalid comment input" });
        });
    });
  });
  it("Responds with an error 404 if an id is entered that does not exist", () => {
    const comment = {
      username: "butter_bridge",
      body: "comment",
    };
    return request(app)
      .post("/api/articles/999999/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "not found" });
      });
  });
  it("Responds with an error 400 if an invalid id is entered", () => {
    const comment = {
      username: "butter_bridge",
      body: "comment",
    };
    return request(app)
      .post("/api/articles/NaN/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "invalid input" });
      });
  });
});
