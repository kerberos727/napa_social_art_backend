export const removeDuplicates = (array, comparer) => {
    return array.reduce((uniqueArray, item) => {
      if (!uniqueArray.some((uniqueItem) => comparer(item, uniqueItem))) {
        uniqueArray.push(item);
      }
      return uniqueArray;
    }, []);
  }