import Joins from './joins';

class Mapper {
  static getTotalCount(res, column) {
    return parseInt(res.rows[0] ? (res.rows[0][column || 'full_count'] || 0) : 0, 10);
  }

  static getUnique(res, rowMapper) {
    return Joins.resultMapper(res, rowMapper)[0];
  }

  static getId(res) {
    return parseInt(res.rows[0] ? (res.rows[0].id || 0) : 0, 10);
  }

  static getNewMetaData(filter, total) {
    return {
      ...filter,
      page: (filter.page + 1),
      total,
      limit: filter.allResults ? total : filter.limit,
    };
  }

  static getPaginatedResponse(filter, searchResults, extraMetaData = {}) {
    return {
      metadata: {
        order: filter.order || null,
        direction: filter.direction,
        page: filter.page,
        limit: filter.limit,
        total: filter.total,
        ...extraMetaData,
        filters: { ...filter.filters },
        allowedFilters: [...filter.allowedFilters],
      },
      records: searchResults,
    };
  }

  static getLabels(rows = []) {
    const labelsMap = new Map();

    rows.forEach((row) => {
      if (row.language_code) {
        labelsMap.set(row.language_code, {
          languageCode: row.language_code,
          label: row.label,
        });
      }
    });

    return Array.from(labelsMap.values());
  }
}

export default Mapper;
