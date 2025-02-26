// Function to convert timestamptz data type value from database
// to human-readable format
const convertTimestamp = (timestamptz) => {
  const formatArgs = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const dateObj = new Date(timestamptz);
  const timestamp = new Intl.DateTimeFormat('en-US', formatArgs).format(dateObj);
  return timestamp;
};

export default convertTimestamp;