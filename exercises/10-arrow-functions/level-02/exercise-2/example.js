const isPositive = (x) => {
    if (x > 0) {
        return true;
    } else {
        return false;
    }
};
console.log(isPositive(5)); // true
console.log(isPositive(-3)); // false