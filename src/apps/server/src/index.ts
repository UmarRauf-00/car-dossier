import express, {type Express, type Request, type Response } from "express";

const app: Express = express();

// Middleware to parse json
app.use(express.json())

const port = 8000;
const dummyData = [{
        id:1,
        brand: "Honda",
        trim: "Accord Euro",
        year: "2012"
    }];

// GET

/**
 * @return All cars data
 */
app.get("/", (_req: Request, res: Response) => {
        res.status(200).send(dummyData)
})

/**
 * @return Single car data by ID
 */
app.get("/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)
    if(!(isNaN(id)) || !id){
        const matchingNode = dummyData.find(data => data.id === id);

        if(!matchingNode) return res.status(404).send({msg: `No cars found with id: ${id}`})
         
        res.status(200).send(dummyData)
    } 
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});