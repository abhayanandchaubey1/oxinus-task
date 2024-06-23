/* eslint-disable max-classes-per-file */
export class BadRequest extends Error {
  constructor(msg) {
    super(msg);
    this.status = 400;
  }
}

export class Unauthorized extends Error {
  constructor(msg) {
    super(msg);
    this.status = 401;
  }
}

export class Forbidden extends Error {
  constructor(msg) {
    super(msg);
    this.status = 403;
  }
}


export class NotFound extends Error {
  constructor(msg) {
    super(msg);
    this.status = 404;
  }
}

export class Conflict extends Error {
  constructor(msg) {
    super(msg);
    this.status = 409;
  }
}

export class UpgradeRequired extends Error {
  constructor(msg) {
    super(msg);
    this.status = 426;
  }
}

export class ServerError extends Error {
  constructor(msg) {
    super(msg);
    this.status = 500;
  }
}
