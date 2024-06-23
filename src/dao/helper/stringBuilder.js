
class StringBuilder {
  constructor(value) {
    this.strings = [];
    this.append(value);
  }

  append(value) {
    if (value) {
      this.strings.push(value);
    }
  }

  length() {
    return this.strings.length;
  }

  toString() {
    return this.strings.join('');
  }
}

export default StringBuilder;
