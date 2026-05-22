export function apiResponse(data, message = "Success") {
  return {
    success: true,
    message,
    data
  };
}

