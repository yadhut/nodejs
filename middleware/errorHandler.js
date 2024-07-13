// const notFound = (req, res, next) => {
//     console.log("error handler middleware called....")

//     const error = new Error(`Not Found: ${req.originalUrl}`);
//     res.status(404);
//     next(error);
// };

const errorHander = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({message: err?.message, stackTrace: err?.stack});
};

module.exports = errorHander