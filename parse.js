module.exports.parse = parse;


/*
This file is part of llang.

llang is MIT licensed. Feel free to use it, contribute or spread the word. Created with love by Petr Nevyhoštěný (Twitter).
*/



function parse(tokens) {
    var token;
    return process();

    function process(operation) {
        operation = operation || null;
        var args = [];

        while (next()) {
            if (token.type == 'boundary') {
                if (token.value == '(') args.push(process());
                else if (token.value == ')') return node(operation, args);
            }

            else if (token.type == 'variable') {
                args.push(node('substitution', [ token.value ]));
                if (isUnary(operation)) return node(operation, args);
            }

            else if (token.type == 'operator') {
                if (isUnary(token.value)) {
                    args.push(process(token.value));
                    continue;
                }

                if (operation) {
                    var tmp = args.slice(0);
                    args = [];
                    args.push(node(operation, tmp));
                }

                operation = token.value;
            }
        }

        return node(operation, args);
    }

    function next() {
        //TODO: use pointer instead of shifting
        //(parse would not need to clone tokens array)
        return (token = tokens.shift());
    }

    function node(action, args) {
        return {
            action: translate(action),
            args: args
        };
    }

    function translate(operator) {
        var map = {
            '!': 'negation',
            '|': 'disjunction',
            '&': 'conjunction',
            '->': 'implication',
            '<->': 'equivalence'
        };

        return map[operator] || operator;
    }

    function isUnary(op) {
        return op === '!';
    }

    function syntaxError() {
        throw new Error('Syntax error!');
    }
}
