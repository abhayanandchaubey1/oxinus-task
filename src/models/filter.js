class Filter {
    static types = Object.freeze({

    });

    static getAllowedFilter(filter) {
      switch (filter) {
        default:
          return Object.freeze([]);
      }
    }

    static fromRequest(req, type, isExport = false) {
      const filter = {
        allowedFilters: [...Filter.getAllowedFilter(type)],
      };

      const params = req.query;

      const page = params.page ? (Math.abs(parseInt(params.page, 10)) - 1) : 0;
      const limit = params.limit ? parseInt(params.limit, 10) : 50;

      filter.page = page;
      filter.limit = limit;

      params.order && (filter.order = params.order);
      params.direction && (filter.direction = params.direction);
      params.allResults && (filter.allResults = (params.allResults.toLowerCase() === 'true'));

      if (isExport) filter.allResults = true;

      filter.filters = {};

      if (params.filter) {
        filter.allowedFilters.forEach((key) => {
          if (params.filter[key]) {
            filter.filters[key] = params.filter[key];
          }
        });
      }

      return {
        ...filter,
        allowedFilters: [...filter.allowedFilters],
        filters: { ...filter.filters },
      };
    }
}

export default Filter;
