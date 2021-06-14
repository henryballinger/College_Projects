/* Group by City, push all over information relating to museums to the City document relating to it. Output to new collection identified using _bycity */
db.museum_embed_byid.aggregate([{ $group: {_id: {city: "$location.city"}, museums: {$push: "$$ROOT"}}}, {$out: "museum_embed_bycity"}])

/* Group by Museum Type, push all over information relating to museums to the Type document relating to it. Output to new collection identified using _bytype */
db.museum_embed_byid.aggregate([{ $group: {_id: {MuseumType: "$museumType"}, museums: {$push: "$$ROOT"}}}, {$out: "museum_embed_bytype"}])

