// Copyright 2015 Ryan Marcus
// This file is part of vulcan.
// 
// vulcan is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// vulcan is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with vulcan.  If not, see <http://www.gnu.org/licenses/>.

"use strict";

const util = require("./util.js");

function buildConjunction(a, b) {
    return { action: "conjunction",
	     args: [a, b] };
}

function buildImplication(a, b) {
    return { action: "implication",
	     args: [a, b] };
}

function buildNegation(a) {
    return { action: "negation",
	     args: [a] };
}

function buildDisjunction(a, b) {
    return { action: "disjunction",
	     args: [a, b] };
}

function eliminateBijection(tree) {

    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;

    if (tree.action == "equivalence") {
	// apply the transformation
	return buildConjunction(
	    buildImplication(
		eliminateBijection(tree.args[0]),
		eliminateBijection(tree.args[1])
	    ),
	    buildImplication(
		eliminateBijection(tree.args[1]),
		eliminateBijection(tree.args[0])
	    ));

	
    }

    return { action: tree.action,
	     args: tree.args.map(eliminateBijection) };
}

function deMorgans(tree) {
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;
    
    if (tree.action == "negation") {
	if (tree.args[0].action == "disjunction") {
	    // move the negation in
	    return deMorgans(buildConjunction(
		buildNegation(tree.args[0].args[0]),
		buildNegation(tree.args[0].args[1])
	    ));
	}

	if (tree.args[0].action == "conjunction") {
	    // move negation in
	    return deMorgans(buildDisjunction(
		buildNegation(tree.args[0].args[0]),
		buildNegation(tree.args[0].args[1])
	    ));
	}
    }

    return { action: tree.action,
	     args: tree.args.map(deMorgans) };
}

function eliminateImplication(tree) {
    
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;


    if (tree.action == "implication") {
	return buildDisjunction(
	    buildNegation(eliminateImplication(tree.args[0])),
	    eliminateImplication(tree.args[1]));
    }

    return { action: tree.action,
	     args: tree.args.map(eliminateImplication) };
    
}

function eliminateDoubleNegation(tree) {
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;


    if (tree.action == "negation") {
	if (tree.args[0].action == "negation") {
	    return eliminateDoubleNegation(tree.args[0].args[0]);
	}
    }

    return { action: tree.action,
	     args: tree.args.map(eliminateDoubleNegation) };
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function distribOr(tree) {
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;


    if (tree.action == "disjunction") {
	if (tree.args[1].action == "conjunction") {
	    return distribOr(buildConjunction(
		buildDisjunction(clone(tree.args[0]),
				 clone(tree.args[1].args[0])),
		buildDisjunction(clone(tree.args[0]),
				 clone(tree.args[1].args[1]))
	    ));
	    
	    
	}

	if (tree.args[0].action == "conjunction") {
	    return distribOr(buildConjunction(
		buildDisjunction(clone(tree.args[1]),
				 clone(tree.args[0].args[0])),
		buildDisjunction(clone(tree.args[1]),
				 clone(tree.args[0].args[1]))
	    ));
	    
	    
	}
    }


    return { action: tree.action,
	     args: tree.args.map(distribOr) };




}

function doComplementation(tree) {
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;
    
    if (tree.action == "disjunction") {
	var lc = tree.args[0];
	var rc = tree.args[1];

	if (lc.action == "negation") {
	    if (util.treeToExpr(lc.args[0]) == util.treeToExpr(rc)) {
		return {action: "literal",
			args: [true]};
	    }
	}


	if (rc.action == "negation") {
	    if (util.treeToExpr(rc.args[0]) == util.treeToExpr(lc)) {
		return {action: "literal",
			args: [true]};
	    }
	}
    }

    if (tree.action == "conjunction") {
	var lc = tree.args[0];
	var rc = tree.args[1];

	if (lc.args[0].action == "negation") {
	    if (util.treeToExpr(lc.args[0].args[0]) == util.treeToExpr(rc)) {
		return {action: "literal",
			args: [false]};
	    }
	}


	if (rc.args[0].action == "negation") {
	    if (util.treeToExpr(rc.args[0].args[0]) == util.treeToExpr(lc)) {
		return {action: "literal",
			args: [false]};
	    }
	}
    }


    return { action: tree.action,
	     args: tree.args.map(doComplementation) };
}


function doIdentity(tree) {
    if (!tree || tree.action == "substitution" || tree.action == "literal")
	return tree;

    if (tree.action == "disjunction") {
	var lc = tree.args[0];
	var rc = tree.args[1];

	if (lc.action == "literal") {
	    if (lc.args[0] == true) {
		return lc;
	    } else if (lc.args[0] == false) {
		return rc;
	    }
	}

	if (rc.action == "literal") {
	    if (rc.args[0] == true) {
		return rc;
	    } else if (rc.args[0] == false) {
		return lc;
	    }
	}
    }

    if (tree.action == "conjunction") {
	var lc = tree.args[0];
	var rc = tree.args[1];
	
	if (lc.action == "literal") {
	    if (lc.args[0] == true) {
		return rc;
	    } else if (lc.args[0] == false) {
		return lc;
	    }
	}
	
	if (rc.action == "literal") {
	    if (rc.args[0] == true) {
		return lc;
	    } else if (rc.args[0] == false) {
		return rc;
	    }
	}
    }

    return {action: tree.action,
	    args: tree.args.map(doIdentity)};



}




module.exports.convertToCNF = convertToCNF;
function convertToCNF(tree) {
    var actions = [{task: "eliminate bijection", f: eliminateBijection},
		   {task: "eliminate implication", f: eliminateImplication},
		   {task: "DeMorgan's", f: deMorgans},
		   {task: "eliminate double negation", f: eliminateDoubleNegation},
		   {task: "distribute or over and", f: distribOr},
		   {task: "complementation", f: doComplementation},
		   {task: "identity", f: doIdentity}
		  ];


    var toR = [{label: "initial expression", tree: tree}];
    for (let a of actions) {

        // stop early if we are already in CNF
        if (isCNF(toR.peek().tree)) {
            break;

        }
        
        // apply the action until it has no effect
	while (true) {
	    var newTree = a.f(toR.peek().tree);
	    if (util.treeToExpr(newTree) == util.treeToExpr(toR.peek().tree))
		break;

	    toR.push({label: a.task, tree: newTree});
	}
    }



    return toR;
    
}

module.exports.isCNF = isCNF;
function isCNF(tree) {
    var conjChild = function (tree) {
        if (tree.args.length < 2)
            return false;


        if (tree.action == "implication"
            || tree.action == "equivalence"
            || tree.action == "disjunction")
            return false;
        
        
        var lc;
	if (tree.args[0].action == "conjunction") {
	    lc = conjChild(tree.args[0]);
	} else {
	    lc = otherChild(tree.args[0]);
	}


	if (tree.args[1].action == "conjunction") {
	    return conjChild(tree.args[1]) && lc;
	} else {
	    return otherChild(tree.args[1]) && lc;
	}

        return false;


    };

    var otherChild = function (tree) {
	if (!tree)
	    return false;
        
	if (tree.action == "substitution" || tree.action == "literal")
	    return true;

	if (tree.action == "conjunction")
	    return false;

	if (tree.action == "negation") 
            return tree.args[0].action == "substitution";

	if (tree.action == "disjunction")
	    return otherChild(tree.args[0] && tree.args[1]);


	return false;
    };

    if (tree.action == "substitution" || (tree.action == "negation" && tree.args[0].action == "substitution"))
	return true;

    return conjChild(tree);
}

module.exports.splitClauses = splitClauses;
function splitClauses(tree) {
    var clauses = [];
    var findTopLevelDisjunctions = function (tree) {
	if (tree.action == "conjunction") {
	    findTopLevelDisjunctions(tree.args[0]);
	    findTopLevelDisjunctions(tree.args[1]);
	    return;
	}

	clauses.push(tree);
    };

    findTopLevelDisjunctions(tree);
    return clauses;
    
}
