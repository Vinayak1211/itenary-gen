import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(String(process.env.MONGO_URI));
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
const db = client.db("travel-recommender");

const isLoggedIn = async (req: Request, res: Response, next: any) => {
  try {
    // check if auth header exists
    if (req.headers.authorization) {
      // parse token from header
      const token = req.headers.authorization.split(" ")[1]; //split the header and get the token
      if (token) {
        const payload = await jwt.verify(token, process.env.SECRET);
        if (payload) {
          // store user data in request object
          // @ts-ignore
          req.user = payload;
          next();
        } else {
          res.status(400).json({ error: "token verification failed" });
        }
      } else {
        res.status(400).json({ error: "malformed auth header" });
      }
    } else {
      res.status(400).json({ error: "No authorization header" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

app.post("/generate", isLoggedIn, async (req: Request, res: Response) => {
  const data = req.body;
  const TEMPLATE = `These are the details for a vacation ${JSON.stringify(
    data,
  )} and generate an iternary for it\n\nthe structure should be\n\nday {number}->\n{ativites}\n\nfor each day and the cumulative cost below and wbesties to book it from\n`;
  const genAI = new GoogleGenerativeAI(String(process.env.API_KEY));
  const itenaryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const [itenary, _] = await Promise.all([
    await itenaryModel.generateContent(TEMPLATE),
    await db.collection("prompts").insertOne(data),
  ]);
  const result = await itenary.response;
  const output = result.text();
  res.send(output);
});

app.get("/suprise", isLoggedIn, async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(String(process.env.API_KEY));
  const itenaryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompts = await db
    .collection("prompts")
    .find()
    .sort({ $natural: -1 })
    .limit(5)
    .toArray();
  let TEMPLATE = "";
  let PROMPTS = "";
  if (prompts.length === 0) {
    // if not the surprise vacation generate
    TEMPLATE = `These are the details for a vacation ${JSON.stringify({
      location: "Paris",
      travel_with: "family",
    })} and generate an iternary for it\n\nthe structure should be\n\nday {number}->\n{ativites}\n\nfor each day and the cumulative cost below and wbesties to book it from\n`;
  } else {
    TEMPLATE =
      "I will be providing some previous prompts so generate a single itinary which caters and adds personalistaion to this user similar budget similar stay similar location (not same) and similar style\n";
    console.log(prompts);
    PROMPTS =
      "These are the previous details " +
      prompts
        .map(
          (prompt: any) => `These are the details ${JSON.stringify(prompt)}\n`,
        )
        .join("\n\n");
  }
  const itenary = await itenaryModel.generateContent(TEMPLATE + PROMPTS);
  const result = await itenary.response;
  const output = result.text();
  res.send(output);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    // create a new user

    // insert the user in the database
    const user = await db.collection("users").insertOne(req.body);

    res.json(user).status(201);
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    // check if the user exists
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });

    if (!user) {
      throw new Error("User does not exist");
    }
    // check if the password is correct
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error("Password is incorrect");
    }

    const token = await jwt.sign(
      { username: user.username },
      process.env.SECRET,
    );
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error });
  }
});
