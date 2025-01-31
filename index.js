import express from 'express';
import mongoose from "mongoose";
import pokemonRouter from "./routes/pokemon.js"



const app = express()


mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`)

app.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Staat toegang toe vanaf elke oorsprong
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS' // Voegt de ontbrekende methodes toe
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Content-Type, Accept, Authorization' // Zorgt dat clients de juiste headers mogen meesturen
    );
    next();
});

// Middleware voor JSON-gegevens
app.use(express.json());

// Middleware voor www-urlencoded-gegevens
app.use(express.urlencoded({extended: true}));

//middleware accept header
app.use((req, res, next)=>{
    if (req.header('Accept')!== 'application/json' && req.method !== "OPTIONS"){
        res.status(406).json({error:'only json is allowed'})
    } else {
        next();
    }
})

//middleware die zegt dat content type alleen application/json mag zijn
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.options('/pokemon', (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.status(204).send(); // 204 betekent "No Content"
});


app.options('/pokemon/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

app.use('/pokemon', pokemonRouter)

app.listen(process.env.EXPRESS_PORT, ()=>{
    console.log("server is gestart")
})
