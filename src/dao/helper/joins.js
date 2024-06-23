
class Joins {
  static resultMapper(res, rowMapper) {
    return Joins.resultMapperByKey('id', res, rowMapper);
  }


  static resultMapperByKey(key, res, rowMapper) {
    return Array.from(res.rows.reduce((map, row) => {
      map.get(row[key])
        ? map.set(row[key], [...map.get(row[key]), row])
        : map.set(row[key], [row]);
      return map;
    }, new Map()).values()).map((group) => rowMapper(group));
  }
}


export default Joins;
