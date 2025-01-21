import express from "express";
import Spot from "../models/Spot.js";
import {faker} from "@faker-js/faker";
import mongoose from "mongoose";
import spot from "../models/Spot.js";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1

        const skip = (page - 1) * limit
        const spots = await Spot.find({}).skip(skip).limit(limit);
        console.log(spots.length)

        const totalItems = await Spot.countDocuments();
        const totalPages = Math.ceil(totalItems / limit)
        res.status(200).json(
            {
                "items": spots,
                "_links": {
                    "self": {
                        "href": `${process.env.BASE_URL}/spots`
                    },
                    "collection": {
                        "href": `${process.env.BASE_URL}`
                    }
                },
                "pagination": {
                    "currentPage": page,
                    "currentItems": spots.length,
                    "totalPages": totalPages,
                    "totalItems": totalItems,
                    "_links": {
                        "first": {
                            "page": 1,
                            "href": `${process.env.BASE_URL}/spots?page=1&limit=${limit}`
                        },
                        "last": {
                            "page": totalPages,
                            "href": `${process.env.BASE_URL}/spots?page=${totalPages}&limit=${limit}`
                        },
                        "previous": page > 1 ? {
                            "page": page - 1,
                            "href": `${process.env.BASE_URL}/spots?page=${page - 1}&limit=${limit}`
                        } : null,
                        "next": page < totalPages ? {
                            "page": page + 1,
                            "href": `${process.env.BASE_URL}/spots?page=${page + 1}&limit=${limit}`
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
        await Spot.deleteMany({})

        //create new items
        for (let i = 0; i <req.body.amount; i++) {
            const randomTitle = faker.animal.cat()
            const randomDescription = faker.image.avatar()
            const randomReview = faker.vehicle.manufacturer()

            await Spot.create({
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
        const { title, description, review } = req.body;

        // Controleer of alle velden aanwezig zijn
        if (!title || !description || !review) {
            return res.status(400).json({ error: "All fields (title, description, review) are required." });
        }

        // Maak een nieuw document aan in de database
        const newSpot = await Spot.create({ title, description, review });

        res.status(201).json(newSpot); // Geef het aangemaakte item terug
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
        const spot = await Spot.findById(req.params.id);

        // Als de resource niet bestaat, geef een 404 terug
        if (!spot) {
            return res.status(404).json({ error: 'Spot not found' });
        }

        // Stuur de gevonden resource terug
        res.json(spot);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const spotId = req.params.id
        const { title, description, review } = req.body

        const spot = await Spot.findByIdAndUpdate(
            spotId,
            {
                title: title,
                description: description,
                review: review,
            },
            { new: true, runValidators: true });

        res.status(200).json(spot)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.delete('/:id', async (req, res)=>{
    try{
        const spot = await Spot.findByIdAndDelete(req.params.id);

        if (!spot) {
            return res.status(404).json({ error: 'Spot not found' });
        }
        res.status(204).send();
    }catch (e){
        console.log(e)
        res.status(500).json({ error: 'Something went wrong' });
    }
})


export default router;