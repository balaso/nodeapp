class DateDiff {
    constructor(date1, date2) {
        this.date1 = date1;
        this.date2 = date2;
        this.difference = Math.floor(date1 - date2);

        this.divisors  = {
            days: 1000 * 60 * 60 * 24,
            hours: 1000 * 60 * 60,
            minutes: 1000 * 60,
            seconds: 1000
          };
    }

    hours() {
        return this.roundIt(this.difference / this.divisors.hours);
    }

    roundIt(v) {
        return parseFloat(v.toFixed(1));
    };

    seconds() {
        return this.roundIt(this.difference / this.divisors.seconds);
    };

    minutes() {
        return this.roundIt(this.difference / this.divisors.minutes);
    };

    days() {
        return this.roundIt(this.difference / this.divisors.days);
    };

    weeks() {
        return this.roundIt(this.days() / 7);
    };
}

module.exports = DateDiff