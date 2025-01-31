import express from "express";
import {faker} from "@faker-js/faker";
import mongoose from "mongoose";
import Pokemon from "../models/Pokemon.js";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit)
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * limit

        let pokemon;
        if (limit > 0) {
            pokemon = await Pokemon.find({}).skip(skip).limit(limit);
        } else {
            pokemon = await Pokemon.find({});
        }

        console.log(pokemon.length)

        const totalItems = await Pokemon.countDocuments();
        const totalPages = Math.ceil(totalItems / limit)
        res.status(200).json(
            {
                "items": pokemon,
                "_links": {
                    "self": {
                        "href": `${process.env.BASE_URL}/pokemon`
                    },
                    "collection": {
                        "href": `${process.env.BASE_URL}`
                    }
                },
                "pagination": {
                    "currentPage": page,
                    "currentItems": pokemon.length,
                    "totalPages": totalPages,
                    "totalItems": totalItems,
                    "_links": {
                        "first": {
                            "page": 1,
                            "href": `${process.env.BASE_URL}/pokemon?page=1&limit=${limit}`
                        },
                        "last": {
                            "page": totalPages,
                            "href": `${process.env.BASE_URL}/pokemon?page=${totalPages}&limit=${limit}`
                        },
                        "previous": page > 1 ? {
                            "page": page - 1,
                            "href": `${process.env.BASE_URL}/pokemon?page=${page - 1}&limit=${limit}`
                        } : null,
                        "next": page < totalPages ? {
                            "page": page + 1,
                            "href": `${process.env.BASE_URL}/pokemon?page=${page + 1}&limit=${limit}`
                        } : null
                    }
                }
            })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/seed', async (req, res)=>{
    try {
        //deleten alle items voordat nieuwe worden toegevoegd
        await Pokemon.deleteMany({})

        //create new items
        for (let i = 0; i <req.body.amount; i++) {
            const randomTitle = faker.music.songName()
            const randomDescription = faker.music.genre()
            const randomReview = faker.music.album()

            await Pokemon.create({
                title: randomTitle,
                description: randomDescription,
                review: randomReview

            })
        }
        res.status(201).send({ message: 'Data succesvol toegevoegd!' });
    }catch (e){
        console.log(e)
    }
})

router.post('/', async (req, res) => {
    try {
        const { title, description, review, imageUrl } = req.body;

        // Controleer of alle velden aanwezig zijn
        if (!title || !description || !review) {
            return res.status(400).json({ error: "All fields (title, description, review) are required." });
        }

        // Maak een nieuw document aan in de database
        const newPokemon = await Pokemon.create({ title, description, review, imageUrl });

        res.status(201).json(newPokemon); // Geef het aangemaakte item terug
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        // Controleer of het ID geldig is
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Zoek de resource in de database
        const pokemon = await Pokemon.findById(req.params.id);

        // Als de resource niet bestaat, geef een 404 terug
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }

        // Stuur de gevonden resource terug
        res.json(pokemon);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const pokemonId = req.params.id
        const { title, description, review, imageUrl } = req.body

        const pokemon = await Pokemon.findByIdAndUpdate(
            pokemonId,
            {
                title: title,
                description: description,
                review: review,
                imageUrl: imageUrl
            },
            { new: true, runValidators: true });

        res.status(200).json(pokemon)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.delete('/:id', async (req, res)=>{
    try{
        const pokemon = await Pokemon.findByIdAndDelete(req.params.id);

        if (!pokemon) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        res.status(204).send();
    }catch (e){
        console.log(e)
        res.status(500).json({ error: 'Something went wrong' });
    }
})


export default router;