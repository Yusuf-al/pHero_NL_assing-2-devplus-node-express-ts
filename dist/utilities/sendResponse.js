const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        message: data.message,
        success: data.success,
        data: data.data,
        error: data.error,
    });
};
export default sendResponse;
