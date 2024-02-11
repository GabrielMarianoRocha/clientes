export default (item, query): boolean =>
  item.toLowerCase().includes(query.toLowerCase());
