/*
 This file is part of llang.

 llang is MIT licensed. Feel free to use it, contribute or spread the word. Created with love by Petr Nevyhoštěný (Twitter).
 */

module.exports.lex = lex;

function lex(input) {
    var pointer = 0;
    var tokens = [];
    var c;
    var operator = '';

    while (next()) {
        if (isSpecial(c)) {
            operator += c;
            if (operatorExists(operator)) {
                push('operator', operator);
                operator = '';
            }
        }

        else {
            if (operator.length) unrecognizedToken(operator, pointer - operator.length - 1);

            if (isWhiteSpace(c)) continue;
            else if (isVariable(c)) push('variable', c.toUpperCase());
            else if (isExpressionBoundary(c)) push('boundary', c);
            else unrecognizedToken(c, pointer - 2);
        }
    }

    return tokens;

    function next() {
        return (c = input[pointer++]);
    }

    function push(type, value) {
        tokens.push({
            type : type,
            value : value
        });
    }

    function isWhiteSpace(c) {
        return /\s/.test(c);
    }

    function isVariable(c) {
        return /[A-Za-z]/.test(c);
    }

    function isSpecial(c) {
        return /[<>\-|&!]/.test(c);
    }

    function isExpressionBoundary(c) {
        return /[\(\)]/.test(c);
    }

    function operatorExists(op) {
        return ['!', '|', '&', '->', '<->'].indexOf(op) !== -1;
    }

    function unrecognizedToken(token, position) {
        throw new Error('Unrecognized token "' + token + '" on position ' + position + '!');
    }
}
