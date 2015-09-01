// Copyright 2015 Ryan Marcus
// This file is part of vulcan.
// 
// orbits is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// orbits is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with orbits.  If not, see <http://www.gnu.org/licenses/>.


var parser = require("./parse.js");
var lexer = require("./lex.js");




function buildTree(string) {
	return hoistNullActions(parser.parse(lexer.lex(string)));
}

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

	if (!tree || tree.action == "substitution")
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
	if (!tree || tree.action == "substitution")
		return tree;
	
	if (tree.action == "negation") {
		if (tree.args[0].action == "disjunction") {
			// move the negation in
			return buildConjunction(
				buildNegation(deMorgans(tree.args[0])),
				buildNegation(deMorgans(tree.args[1]))
			);
		}

		if (tree.args[0].action == "conjunction") {
			// move negation in
			return buildDisjunction(
				buildNegation(deMorgans(tree.args[0])),
				buildNegation(deMorgans(tree.args[0]))
			);
		}
	}

	return { action: tree.action,
		 args: tree.args.map(deMorgans) };
}

function eliminateImplication(tree) {
	
	if (!tree || tree.action == "substitution")
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
	console.log("Got: " + JSON.stringify(tree));
	if (!tree || tree.action == "substitution")
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
	
	if (!tree || tree.action == "substitution")
		return tree;

	if (tree.action == "disjunction") {
		if (tree.args[1].action == "conjunction") {
			return buildConjunction(
				buildDisjunction(distribOr(clone(tree.args[0])),
						 distribOr(clone(tree.args[1].args[0]))),
				buildDisjunction(distribOr(clone(tree.args[0])),
						 distribOr(clone(tree.args[1].args[1])))
			);
			
						 
		}

		if (tree.args[0].action == "conjunction") {
			return buildConjunction(
				buildDisjunction(distribOr(clone(tree.args[1])),
						 distribOr(clone(tree.args[0].args[0]))),
				buildDisjunction(distribOr(clone(tree.args[1])),
						 distribOr(clone(tree.args[0].args[1])))
			);
			
						 
		}
	}


	return { action: tree.action,
		 args: tree.args.map(distribOr) };




}

function hoistNullActions(tree) {
	if (!tree || tree.action == "substitution")
		return tree;

	if (tree.action == null)
		return hoistNullActions(tree.args[0]);

	return { action: tree.action,
		 args: tree.args.map(hoistNullActions) };
}


function convertToCNF(tree) {
	var actions = [eliminateBijection,
		   eliminateImplication,
		   deMorgans,
		   eliminateDoubleNegation,
		   distribOr];

	var toR = tree;
	actions.forEach(function (a) {
		toR = a(toR);
	});

	return toR;
		
}

console.log(JSON.stringify(convertToCNF(buildTree("A <-> B & C"))));
