## Query for exporting the data from mongodb

```js
db.reports
    .aggregate([
        {
            $lookup: {
                from: "countries",
                let: {
                    country_id: "$country",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$country_id"],
                            },
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            _id: 0,
                        },
                    },
                ],
                as: "country",
            },
        },
        {
            $lookup: {
                from: "segments",
                let: {
                    segment_id: "$segment",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$segment_id"],
                            },
                        },
                    },
                    {
                        $project: {
                            segment: 1,
                            _id: 0,
                        },
                    },
                ],
                as: "segment",
            },
        },
        {
            $lookup: {
                from: "products",
                let: {
                    product_id: "$product",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$product_id"],
                            },
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            _id: 0,
                        },
                    },
                ],
                as: "product",
            },
        },
        {
            $unwind: {
                path: "$country",
            },
        },
        {
            $unwind: {
                path: "$segment",
            },
        },
        {
            $unwind: {
                path: "$product",
            },
        },
        {
            $set: {
                country: "$country.name",
                segment: "$segment.segment",
                product: "$product.name",
            },
        },
    ])
    .pretty();
```
