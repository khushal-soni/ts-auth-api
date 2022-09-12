## Setup

**Install Dependecies -** `npm install`

**Create Directories in the project root -** `resouces/spreadSheets` `resources/uploads`

## Query for exporting the data from mongodb

```js
db.reports
    .aggregate([
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
                path: "$product",
            },
        },
        {
            $set: {
                product: "$product.name",
            },
        },
    ])
    .pretty();
```

## Summary Using GROUP

```js
db.reports
    .aggregate([
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
                path: "$product",
            },
        },
        {
            $set: {
                product: "$product.name",
            },
        },
        {
            $group: {
                _id: { segment: "$segment", country: "$country" },
                totalUnitsSold: { $sum: "$unitsSold" },
                totalGrossSales: { $sum: "$grossSales" },
                totalProfit: { $sum: "$profit" },
            },
        },
    ])
    .pretty();
```
