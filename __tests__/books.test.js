const request = require("supertest");
const app = require("../app");
const db = require("../db");

process.env.NODE_ENV === "test"

let bookID;

beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO books (
              isbn,
              amazon_url,
              author,
              language,
              pages,
              publisher,
              title,
              year) 
           VALUES (
                '1234567890',
                'https://amazon.com/test',
                'Bill',
                'English',
                300,
                'Penguin',
                'Science Facts',
                2003)
            RETURNING isbn`);
    bookID = result.rows[0].isbn;
});


describe("GET /books", () => {
    test("Get info on 1 book", async () => {
        const response = await request(app).get('/books');
        expect(response.body.books).toHaveLength(1);
        expect(response.body.books[0]).toHaveProperty("isbn");
        expect(response.body.books[0]).toHaveProperty("author");
    });
});


describe("GET /books/:id", () => {
    test("Get info on one specific book", async() => {
        const response = await request(app).get(`/books/${bookID}`);
        expect(response.body.book.isbn).toBe(bookID);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book).toHaveProperty("pages");
    });
});


describe("POST /books", () => {
    test("Creates one new book", async () => {
        const response = await request(app).post(`/books`).send({
            isbn: '987654321',
            amazon_url: 'https://amazon.com/newbook',
            author: 'Henry',
            language: 'English',
            pages: 53,
            publisher: 'Turtle Co.',
            title: 'The day I wrote a book',
            year: 2010
        });
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe('987654321');
        expect(response.statusCode).toBe(201);
    });
    test("Book not created and returns 400 status code", async () => {
        const response = await request(app).post(`/books`).send({pages: 53});
        expect(response.statusCode).toBe(400);
    })
});


describe("PUT /books/:isbn", () => {
    test("Update an existing book", async () => {
        const response = await request(app).put(`/books/${bookID}`).send({
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "TBD",
            year: 2017
        });
        expect(response.body.book).toHaveProperty('pages');
        expect(response.body.book.title).toBe('TBD');
    });
    test("Book not updated and returns 404 status code", async () => {
        const response = await request(app).post(`/books/${bookID}`).send({
            isbn: '874564563478',
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "TBD",
            year: 2017,
            wrong: 'this property should not exist'
        });
        expect(response.statusCode).toBe(404);
    });
});


describe("DELETE /books/:isbn", () => {
    test("Delete an existing book", async () => {
        const response = await request(app).delete(`/books/${bookID}`);
        expect(response.body).toEqual({message: "Book deleted"});
    });
});



afterEach(async () => {
    await db.query('DELETE FROM books');
});

afterAll(async () => {
    db.end();
});