import mongoose from "mongoose";


const pokemonSchema= new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    review: {type: String, required: true},
    imageUrl: { type: String, default: null },

},{
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            // Voeg de _links toe aan elke pokemon
            ret._links = {
                self: {
                    "href": `http://145.24.223.61:8001/pokemon/${ret._id}`
                },
                collection: {
                    "href": "http://145.24.223.61:8001/pokemon/"
                }
            };

            delete ret._id
        }
    }
})


const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export  default Pokemon;