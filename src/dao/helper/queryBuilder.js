import StringBuilder from './stringBuilder';

class QueryBuilder {
    static placeholder = '?';

    constructor(query, args) {
      this.query = new StringBuilder();
      this.args = [];
      this.append(query, args);
      return this;
    }

    /**
     * Appends given fragment and arguments to this query.
     */
    append(sql, args) {
      this.appendSql(sql);
      this.appendArgs(args);
      return this;
    }

    /**
     * Appends given fragment to this query.
     */
    appendSql(sql) {
      this.query.append(sql);
      return this;
    }

    /**
     * Appends given arguments to this query.
     */
    appendArgs(args = []) {
      this.args = [...this.args.concat(args)];
      return this;
    }

    /**
     * Adds a given amount of comma-separated place-holders.
     * The amount must be at-least 1.
     */
    appendPlaceholders(count = 0) {
      if (count <= 0) throw new Error(`count must be positive, but was: ${count}`);

      this.query.append('?');

      for (let i = 1; i < count; i += 1) {
        this.query.append(',?');
      }
      return this;
    }

    /**
     * Is the query string empty?
     */
    isEmpty() {
      return this.query.length() === 0;
    }

    /**
     * Does this query have any arguments?
     */
    hasArguments() {
      return this.args.length !== 0;
    }

    build() {
      if (this.query.length() === 0) throw new Error('empty query');

      let query = this.query.toString();
      for (let i = 1; i <= this.args.length; i += 1) {
        query = query.replace('?', `$${i}`);
      }
      if (query.indexOf('?') !== -1) {
        throw new Error('placeholder arguments mismatched');
      }

      return {
        sql: query,
        args: [...this.args],
      };
    }

    static formatQuery(queryString, ...args) {
      return [...args].reduce((acc, arg) => acc.replace('{s}', arg), queryString);
    }
}

export default QueryBuilder;
