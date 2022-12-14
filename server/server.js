const express = require("express");
// import Apollo
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

// import typeDefs andresolvers
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");

// Express server
const PORT = process.env.PORT || 3001;

// create a new Apollo server pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
// Start the Apollo server
const startApolloServer = async (_typeDefs, _resolvers) => {
  await server.start();
  // integrate our Apollo server with Express as middleware
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

//start the server
startApolloServer(typeDefs, resolvers);