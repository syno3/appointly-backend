import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import routes from "./routes/api.js";


const app = express();
app.use(bodyparser.json({ limit: "50mb", extended: true }));
app.use(bodyparser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    }
);

app.use("/api", routes);
