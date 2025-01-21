import mongoose from "mongoose";


const spotSchema= new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    review: {type: String, required: true},

},{
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            // Voeg de _links toe aan elke spot
            ret._links = {
                self: {
                    "href": `http://145.24.223.61:8001/spots/${ret._id}`
                },
                collection: {
                    "href": "http://145.24.223.61:8001/spots/"
                }
            };

            delete ret._id
        }
    }
})


const Spot = mongoose.model('Spot', spotSchema);

export  default Spot;