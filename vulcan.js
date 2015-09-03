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


var cnf = require("./cnf.js");
var util = require("./util.js");




function findLiterals(clause) {
	var literals = [];
	var f = function (c) {
		if (!c)
			return;

		if (c.action == "negation" && c.args[0].action == "substitution") {
			literals.push("!" + c.args[0].args[0]);
			return;
		}


		if (c.action == "substitution") {
			literals.push(c.args[0]);
			return;
		}

		f(c.args[0]);
		f(c.args[1]);
		
	};

	f(clause);
	return literals;
}

function resolve(clause1, clause2) {

	var clause1literals = findLiterals(clause1);
	var clause2literals = findLiterals(clause2);

	var findCompLiterals = function(c1l, c2l) {
		var toR = [];
		c1l.forEach(function (i) {
			var symbol = (i.startsWith("!") ? i.substring(1) : i);
			var inverse = (i.startsWith("!") ? i.substring(1) : "!" + i);
			if (c2l.includes(inverse))
				toR.push(symbol);
		});
		return toR;
	};

	var compLit = findCompLiterals(clause1literals, clause2literals);
	if (compLit.length > 1) {
		// it's a tautology
		return {action: "literal",
			args: [true] };
	}

	var newLiterals = clause1literals.concat(clause2literals);

	newLiterals.sort();
	newLiterals = newLiterals.filter(function (i) {
		var symbol = (i.startsWith("!") ? i.substring(1) : i);
		if (compLit.includes(symbol))
			return false;
		return true;
	}).reduce(function (accum, nxt) {
		if (accum.peek() == nxt)
			return accum;

		return accum.concat([nxt]);

	}, []);


	if (newLiterals.length == 0)
		return {action: "literal",
			args: [false]};

	return util.buildTree(newLiterals.join(" | "));
	
}

module.exports.prove = prove;
function prove(sentences, q) {
	var cnfProofs = [];
	var toR = [];
	
	var pc = 0;

	// convert each sentence to CNF
	sentences.forEach(function (i) {
		var toAdd = cnf.convertToCNF(util.buildTree(i)).map(function (i) {
			i.idx = pc++;
			return i;
		});;
		toR = toR.concat(toAdd);
		cnfProofs.push(toR);
	});

	var pcCutoff = pc;

	// next, build the knowledge base
	var kb = cnfProofs.map(function (i) {
		var t = i.peek();
		return t;
	}).map(function (i) {
		var t = cnf.splitClauses(i.tree).map(function (c) {
			c.idx = pc++;
			c.from = i.idx;
			return c;
		});
		return t;
	}).reduce(function (accum, nxt) {
		return accum.concat(nxt);
	}, []);

//	toR.push({label: "sep"});

	kb.forEach(function (i) {
		toR.push({label: "knowledge base clause from " + i.from,
			  tree: i,
			  idx: i.idx});
	});

	// now add the negation of our query to the KB
	var negCNF = cnf.convertToCNF(util.negate(util.buildTree(q)));
	var neg = negCNF.peek().tree;
	cnf.splitClauses(negCNF.peek().tree).forEach(function (i) {
		i.idx = pc++;
		kb.push(i);
		toR.push({label: "assume for a contradiction",
			  tree: kb.peek(),
			  idx: kb.peek().idx});
	});
/*	neg.idx = pc++;
	kb.push(neg);
	toR.push({label: "assume for a contradiction",
		  tree: kb.peek(),
		  idx: kb.peek().idx});*/

	var findRequiredSteps = function(idx) {
		var requiredSteps = [idx];
		
		var step = toR.filter(function (i) {
			return i.idx == idx;
		})[0];


		if (!step.req)
			return requiredSteps;

		step.req.forEach(function (i) {
			requiredSteps = requiredSteps.concat(findRequiredSteps(i));
		});

		return requiredSteps;
	};

	while (true) {
		var newClauses = [];
		for (var i = 0; i < kb.length; i++) {
			for (var j = 1; j < kb.length; j++) {
				var resolvent = resolve(kb[i], kb[j]);
				//console.log(util.treeToExpr(kb[i]) + " // " + util.treeToExpr(kb[j]) + " -> " + util.treeToExpr(resolvent));
				if (newClauses.map(util.treeToExpr).includes(util.treeToExpr(resolvent)))
					continue;
				resolvent.idx = pc++;

				toR.push({label: "resolve of " + kb[i].idx + " and " + kb[j].idx,
					  tree: resolvent,
					  idx: resolvent.idx,
					  req: [kb[i].idx, kb[j].idx]});


				if (resolvent.action == "literal" && resolvent.args[0] == false) {
					// we found a contradiction!
					var req = findRequiredSteps(resolvent.idx);
					return toR.filter(function (i) {
						return req.includes(i.idx) || i.idx <= pcCutoff || i.label == "sep";
					}).map(function (i) {
						if (i.tree)
							i.tree = util.treeToExpr(i.tree);
						return i;
					});
					

				} 

				if (resolvent.action == "literal" && resolvent.args[0] == true) {
					// we found a tautology. not useful.
					continue;
				}
				newClauses.push(resolvent);
			}
		}
		

		var kbS = kb.map(util.treeToExpr);
		var haveAll = (newClauses.map(util.treeToExpr).every(function (i) {
			return kbS.includes(i);
		}));

		if (haveAll) {
			toR.push({label: "model exhausted, proof could not be reached"});
			return toR.map(function (i) {
				if (i.tree)
					i.tree = util.treeToExpr(i.tree);
				return i;
			});
				  
		}
		    

		kb = kb.concat(newClauses);
	}
}


module.exports.addParens = addParens;
function addParens(str) {
	return util.treeToExpr(util.buildTree(str));
}

module.exports.isProofComplete = isProofComplete;
function isProofComplete(proof) {
	return proof.peek().label != "model exhausted, proof could not be reached";
}

//console.log(proofToString(convertToCNF(buildTree("A -> B"))));
//console.log(cnf.splitClauses(buildTree("(A | B) & (C | D) & (!C | L)")).map(util.treeToExpr));
//console.log(resolve(buildTree("A"), buildTree("A")));

//console.log(util.proofToString(prove(["A <-> B", "!B"], "!A")));
