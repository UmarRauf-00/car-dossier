import express, {type Express, type Request, type Response } from "express";
import { ApolloServer, type BaseContext } from "@apollo/server";
import { expressMiddleware} from '@apollo/server/express4'
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"

import cors from 'cors'

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


app.use(cors({ origin: 'http://192.168.1.34:5173' }))

const server = new ApolloServer<BaseContext>({
    typeDefs,
    resolvers
});

async function startServer() {
  await server.start()
  app.use('/graphql', expressMiddleware(server))
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

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


startServer();