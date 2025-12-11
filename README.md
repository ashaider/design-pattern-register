# Design Pattern Register

For setup, the database is already initialized. Simply download the repository, open a terminal, cd into the directory the project is at, and then run `node server.js`.
This should start the server locally at http://localhost:3000/index.html.

For debugging purposes, check http://localhost:3000/patterns to see the fields for each entry in the database.

## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node server.js
```

If the database for some reason isn't initialized, which it should be seeing as how it's included in the GitHub, run this before starting the server:

```base
  node db/init.js
```