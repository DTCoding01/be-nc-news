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
