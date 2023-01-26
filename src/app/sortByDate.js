export const sortListByDate = (list) => {
  if (list) {
    const newList = list.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    return newList;
  }
};
