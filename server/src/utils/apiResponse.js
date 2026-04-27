export const sendSuccess = (res, data, message = 'Success') => {
  res.json({
    message,
    data,
  });
};
