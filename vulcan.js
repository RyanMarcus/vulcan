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
	return parser.parse(lexer.lex(string));
}

function buildConjection(a, b) {
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
		return buildConjection(
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


console.log(JSON.stringify(eliminateBijection(buildTree("A <-> B & C"))));
console.log(JSON.stringify(eliminateImplication(eliminateBijection(buildTree("A <-> B & C")))));
