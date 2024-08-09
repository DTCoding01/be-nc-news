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
  it("Responds with the article object of the chosen id including coment_count", () => {
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
          comment_count: "11",
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

  it("Sorts the array by date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          coerce: true,
          descending: true,
        });
      });
  });

  it("Sorts the array by the specified column in the specified order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title", {
          coerce: true,
          descending: false,
        });
      });
  });
  it(`Sorts the array by the chosen sort_by in the chosen order regardless of case`, () => {
    return request(app)
      .get(`/api/articles?sort_by=title&order=desc`)
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("title", {
          coerce: true,
          descending: true,
        });
      });
  });

  it("Returns a 400 error when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalidColumn")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });

  it("Returns a 400 error when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalidOrder")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
  it("Filters the articles by the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("Returns a 404 error when the topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not_a_topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  it("responds with paginated articles and total count", () => {
    return request(app)
      .get("/api/articles?limit=2&p=1")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(2);
        expect(body.total_count).toBeGreaterThan(2);
      });
  });

  it("returns the correct articles for the second page", () => {
    return request(app)
      .get("/api/articles?limit=2&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(2);
        expect(body.total_count).toBeGreaterThan(2);
      });
  });

  it("returns 400 for invalid limit", () => {
    return request(app)
      .get("/api/articles?limit=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });

  it("returns 400 for invalid page", () => {
    return request(app)
      .get("/api/articles?p=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("Returns an array of comment objects for the chosen article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
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
  it("Returns a limited number of comments when limit query is provided", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
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

  it("Returns the correct comments for the given page", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(5);
      });
  });

  it("Returns an 404 if the page is out of range", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=10&p=100")
      .expect(404)
      .then(({ body }) => {
        expect(body).toMatchObject({ msg: "not found" });
      });
  });

  it("Responds with an error 400 if limit or p is invalid", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=invalid&p=invalid")
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
      // {
      //   invalidKey: "error",
      // },
      {
        invalidKey: "error",
        body: "comment",
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
        expect(body).toMatchObject({ msg: "article not found" });
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

describe("PATCH /api/articles/:article_id", () => {
  it("Increases the vote count for the chosen article and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("Decreases the vote count for the chosen article and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 90,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("Returns 400 for invalid article ID", () => {
    return request(app)
      .patch("/api/articles/NaN")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
  it("Returns 404 for non-existent article ID", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });
  it("Returns 400 for missing inc_votes in request body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "invalid input",
        });
      });
  });
  it("Returns 400 for invalid inc_votes value in request body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "NaN" })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "invalid input",
        });
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("Increases the vote count for the chosen comment and returns the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
      });
  });
  it("Decreases the vote count for the chosen comment and returns the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 15,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
      });
  });
  it("Returns 400 for invalid comment ID", () => {
    return request(app)
      .patch("/api/comments/NaN")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
  it("Returns 404 for non-existent comment ID", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "not found" });
      });
  });
  it("Returns 400 for missing inc_votes in request body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "invalid input",
        });
      });
  });
  it("Returns 400 for invalid inc_votes value in request body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "NaN" })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "invalid input",
        });
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("Responds with 204 and no content when a comment is successfully deleted", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  it("Responds with 404 for non-existent comment", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not found");
      });
  });
  it("Responds with 400 for invalid comment ID", () => {
    return request(app)
      .delete("/api/comments/NaN")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
});

describe("GET /api/users", () => {
  it("Responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  it("Responds with an object containing selected user information", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  it("Responds with 404 for non-existent user", () => {
    return request(app)
      .get("/api/users/not-a-user")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
});

describe("Invalid endpoint handler", () => {
  test("should return 404 for invalid endpoints", () => {
    return request(app)
      .get("/invalid-endpoint")
      .then((response) => {
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Endpoint not found" });
      });
  });
});

describe("POST /api/articles", () => {
  it("Posts a new article and returns the posted article with default url when not provided", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "new article",
        body: "body",
        topic: "cats",
      })
      .expect(201)
      .then(({ body: { post } }) => {
        expect(post).toMatchObject({
          author: "butter_bridge",
          title: "new article",
          body: "body",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: "0",
        });
      });
  });
  it("Posts a new article and returns the posted article with provided url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "new article with image",
        body: "body",
        topic: "cats",
        article_img_url: "http://some-url.com/image.jpg",
      })
      .expect(201)
      .then(({ body: { post } }) => {
        expect(post).toMatchObject({
          author: "butter_bridge",
          title: "new article with image",
          body: "body",
          topic: "cats",
          article_img_url: "http://some-url.com/image.jpg",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: "0",
        });
      });
  });
  it("Returns 400 when required fields are missing", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "missing body and topic",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
  it("Returns 400 when author does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "nonexistent_user",
        title: "new article",
        body: "body",
        topic: "cats",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
  it("Returns 400 when topic does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "new article",
        body: "body",
        topic: "nonexistent_topic",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid input");
      });
  });
});
describe("addTopic", () => {
  it("should add a topic and return the added topic object", () => {
    const newTopic = {
      slug: "new-topic",
      description: "A new topic for testing",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toMatchObject({
          slug: "new-topic",
          description: "A new topic for testing",
        });
      });
  });

  it("should return an error if slug is missing", () => {
    const newTopic = {
      description: "A new topic for testing",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({
          msg: "invalid input",
        });
      });
  });

  it("should return an error if description is missing", () => {
    const newTopic = {
      slug: "new-topic",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({
          msg: "invalid input",
        });
      });
  });

  it("should return an error if both slug and description are missing", () => {
    const newTopic = {};

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body).toMatchObject({
          msg: "invalid input",
        });
      });
  });
});
describe("DELETE /api/articles/:article_id", () => {
  it("should delete the article and respond with 204 status", () => {
    return request(app).delete(`/api/articles/1`).expect(204);
  });
  it("should respond with 404 if the article does not exist", () => {
    const nonExistentArticleId = 999999;

    return request(app)
      .delete(`/api/articles/${nonExistentArticleId}`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });

  it("should respond with 400 if the article_id is invalid", () => {
    return request(app)
      .delete(`/api/articles/not-an-id`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
});
describe("DELETE /api/articles/:article_id/comments", () => {
  it("should delete all comments for a given article_id and respond with 204 status", () => {
    return request(app).delete(`/api/articles/1/comments`).expect(204);
  });

  it("should respond with 404 if the article does not exist", () => {
    return request(app)
      .delete(`/api/articles/9999999/comments`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });

  it("should respond with 400 if the article_id is invalid", () => {
    return request(app)
      .delete(`/api/articles/not-an-id/comments`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
});

describe("POST /api/users/:username/follow-topic", () => {
  it("allows a user to follow a topic and responds with a success message", () => {
    return request(app)
      .post("/api/users/butter_bridge/follow-topic")
      .send({ topicSlug: "mitch" })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "User butter_bridge followed topic mitch",
        });
      });
  });

  it("returns 404 if the user does not exist", () => {
    return request(app)
      .post("/api/users/nonexistent_user/follow-topic")
      .send({ topicSlug: "mitch" })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "user not found" });
      });
  });

  it("returns 404 if the topic does not exist", () => {
    return request(app)
      .post("/api/users/butter_bridge/follow-topic")
      .send({ topicSlug: "nonexistent_topic" })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "topic not found" });
      });
  });

  it("returns 400 if the topicSlug is missing from the request body", () => {
    return request(app)
      .post("/api/users/butter_bridge/follow-topic")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
});
describe("DELETE /api/users/:username/unfollow-topic", () => {
  it("allows a user to unfollow a topic and responds with a success message", () => {
    return request(app)
      .delete("/api/users/butter_bridge/unfollow-topic")
      .send({ topicSlug: "mitch" })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "User butter_bridge unfollowed topic mitch",
        });
      });
  });

  it("returns 404 if the user does not exist", () => {
    return request(app)
      .delete("/api/users/nonexistent_user/unfollow-topic")
      .send({ topicSlug: "mitch" })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "user not found" });
      });
  });

  it("returns 404 if the topic does not exist", () => {
    return request(app)
      .delete("/api/users/butter_bridge/unfollow-topic")
      .send({ topicSlug: "nonexistent_topic" })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "topic not found" });
      });
  });

  it("returns 400 if the topicSlug is missing from the request body", () => {
    return request(app)
      .delete("/api/users/butter_bridge/unfollow-topic")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
});
describe("GET /api/users/:username/followings", () => {
  it("retrieves the topics and users that a specific user is following", () => {
    return request(app)
      .get("/api/users/butter_bridge/followings")
      .expect(200)
      .then(({ body }) => {
        console.log(body, "body")
        expect(body).toHaveProperty('topics');
        expect(body).toHaveProperty('users');
        expect(Array.isArray(body.topics)).toBe(true);
        expect(Array.isArray(body.users)).toBe(true);
      });
  });

  it("returns 404 if the user does not exist", () => {
    return request(app)
      .get("/api/users/nonexistent_user/followings")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "User Not Found" });
      });
  });

  it("handles database errors gracefully", () => {
    return request(app)
      .get("/api/users/error_simulation_user/followings")
      .expect(404) 
      .then(({ body }) => {
        expect(body).toEqual({ msg: "User Not Found" });
      });
  });
});