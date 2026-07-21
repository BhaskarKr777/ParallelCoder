export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;

  if (status === 500) {
    req.log.error({ err }, "Unhandled error");
  }

  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
