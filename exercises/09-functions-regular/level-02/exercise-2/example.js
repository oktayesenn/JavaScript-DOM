function double(x) {
    return x * 2;
}
function quadruple(x) {
    return double(double(x));
}
console.log(quadruple(5)); // 20