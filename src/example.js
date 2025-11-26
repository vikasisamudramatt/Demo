// Example JavaScript file to demonstrate automatic code review

/**
 * A simple calculator function
 */
function calculateSum(a, b) {
  // TODO: Add input validation
  const result = a + b;
  return result;
}

/**
 * Process user data
 */
function processUserData(userData) {
  const processed = {
    name: userData.name,
    email: userData.email,
    timestamp: new Date()
  };

  return processed;
}

module.exports = {
  calculateSum,
  processUserData
};
