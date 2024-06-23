import QueryBuilder from './queryBuilder';

class Queries {
  static updaterFor(tableName, updateMapper, entity, uniqueKey = 'id') {
    const qb = new QueryBuilder('UPDATE ').append(tableName).append(' SET ');
    const updateMap = updateMapper(entity);
    if (Object.keys(updateMap).length === 0) {
      return qb.append(`id = id WHERE ${uniqueKey} = ?`, [entity.id]).build();
    }

    Object.keys(updateMap).forEach((key, i, arr) => {
      qb.append(`${key}=?`, [updateMap[key]]);
      if ((i + 1) !== arr.length) qb.append(',');
    });

    return qb.append(` WHERE ${uniqueKey} = ?`, [entity.id]).build();
  }

  static batchInsert(baseSql, elems, transformer) {
    const qb = new QueryBuilder(baseSql);
    qb.append(' VALUES ');

    elems.forEach((elem, i) => {
      const args = transformer(elem);
      let sql = '(';
      for (let j = 0; j < args.length; j++) {
        sql += `${QueryBuilder.placeholder}`;
        if ((j + 1) !== args.length) sql += ',';
      }
      sql += ')';
      qb.append(sql, [...args]);
      if ((i + 1) !== elems.length) qb.append(',');
    });


    return qb.build();
  }
}

export default Queries;
