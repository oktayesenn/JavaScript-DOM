function checkAge(age) {
    if (age < 0) {
        return "Invalid age";
    }
    if (age < 18) {
        return "Minor";
    }
    return "Adult";
}
console.log(checkAge(20));