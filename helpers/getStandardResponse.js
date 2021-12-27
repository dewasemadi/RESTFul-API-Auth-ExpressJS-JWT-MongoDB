const getStandardResponse = (isSuccess, message, data = null) => {
  const response = {
    isSuccess: isSuccess,
    message: message,
  };

  if (!data) return response;

  response.data = data;
  return response;
};

module.exports = { getStandardResponse };
