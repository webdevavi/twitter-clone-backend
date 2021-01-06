export const formatDate = (date: Date) => {
  try {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split("T")[0];
  } catch (err) {
    return null;
  }
};
