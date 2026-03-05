function populateOptions(options, query) {
  if (!Array.isArray(options) || options.length === 0) {
    return query;
  }

  let newQuery = query;

  for (const opt of options) {
    if (opt.populate) {
      // Handle nested populate
      newQuery = newQuery.populate({
        path: opt.path,
        select: opt.select,
        populate: opt.populate,
      });
    } else {
      newQuery = newQuery.populate({
        path: opt.path,
        select: opt.select,
      });
    }
  }

  return newQuery;
}

module.exports = populateOptions;
