const errors = require('../config/errors')

function paginate(model){
    return async (req, res, next) => {
        const searchString = decodeURI(req.query.search);
        const docsLength = await model.countDocuments().exec();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || docsLength;
        const startIndex = (page - 1) * limit;

        const result = {};
        if(docsLength === 0){
            return res.send();
        }
        if(page > Math.ceil(docsLength/limit))
            return res.status(400).send();
        try {
            if(req.query.search){
                const docsLength = await model.find({name: {$regex: `${searchString}`, $options: 'i'}}).countDocuments().exec();
                result.totalItems = docsLength;
                result.results = await model.find({name: {$regex: `${searchString}`, $options: 'i'}}).limit(limit).skip(startIndex).sort({createdAt: -1}).exec();
            } else {
                const docsLength = await model.find({visibility: 'public'}).limit(limit).skip(startIndex).sort({createdAt: -1}).countDocuments().exec();
                result.results = await model.find({visibility: 'public'}).limit(limit).skip(startIndex).sort({createdAt: -1}).exec();
                result.totalItems = docsLength;
            }
            res.paginatedResult = result;
            next();
        } catch (e) {
            console.log(e);
            res.status(500).send(errors.internalServerError);
        }
    }
}

module.exports = paginate;
