# Vulcan

[ ![Codeship Status for RyanMarcus/vulcan](https://codeship.com/projects/445f6a20-3409-0133-a68d-56c8db4126b8/status?branch=master)](https://codeship.com/projects/100424)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FRyanMarcus%2Fvulcan.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FRyanMarcus%2Fvulcan?ref=badge_shield)

A library for proving statements in propositional logic using resolution.

Vulcan uses a modified version of the excellent [lexer and parse from llang](https://github.com/pnevyk/llang).

For examples, see the tests or [this blog post](http://rmarcus.info/blog/2015/09/02/vulcan.html).


# Simple usage example

```javascript
// We are using `const` for imports because the reference will never change.`
// See more here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const

const vulcan = require("vulcan");
const proof = vulcan.prove(["A -> B", // the knowledgebase
                            "B -> C", 
                            "C -> D",
                            "D -> E"],
                            "B -> D"); // the query
                            
console.log(vulcan.isProofComplete(proof)); 
console.log(proof)
```

Will output:

```
true
[ { label: 'inital expression', tree: '(A -> B)', idx: 0 },
    { label: 'eliminate implication', tree: '(!A | B)', idx: 1 },
    { label: 'inital expression', tree: '(B -> C)', idx: 2 },
    { label: 'eliminate implication', tree: '(!B | C)', idx: 3 },
    { label: 'inital expression', tree: '(C -> D)', idx: 4 },
    { label: 'eliminate implication', tree: '(!C | D)', idx: 5 },
    { label: 'inital expression', tree: '(D -> E)', idx: 6 },
    { label: 'eliminate implication', tree: '(!D | E)', idx: 7 },
    { label: 'knowledge base clause from 1',
    tree: '(!A | B)',
    idx: 8 },
    { label: 'knowledge base clause from 3',
    tree: '(!B | C)',
    idx: 9 },
    { label: 'knowledge base clause from 5',
    tree: '(!C | D)',
    idx: 10 },
    { label: 'assume for a contradiction', tree: 'B', idx: 12 },
    { label: 'assume for a contradiction', tree: '!D', idx: 13 },
    { label: 'resolve of 9 and 12',
    tree: 'C',
    idx: 22,
    req: [ 9, 12 ] },
    { label: 'resolve of 10 and 13',
    tree: '!C',
    idx: 27,
    req: [ 10, 13 ] },
    { label: 'resolve of 22 and 27',
    tree: false,
    idx: 109,
    req: [ 22, 27 ] } ]
```

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FRyanMarcus%2Fvulcan.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FRyanMarcus%2Fvulcan?ref=badge_large)