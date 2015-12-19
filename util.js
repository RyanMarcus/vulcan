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

const parser = require("./parse.js");
const lexer = require("./lex.js");

Array.prototype.peek = function () {
	return this[this.length - 1];
};

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}


function hoistNullActions(tree) {
	if (!tree || tree.action == "substitution" || tree.action == "literal")
		return tree;

	if (tree.action == null)
		return hoistNullActions(tree.args[0]);

	return { action: tree.action,
		 args: tree.args.map(hoistNullActions) };
}


module.exports.negate = negate;
function negate(a) {
	return { action: "negation",
		 args: [a] };
}

module.exports.treeToExpr = treeToExpr;
function treeToExpr(tree) {

	if (tree.action == "substitution") {
		return tree.args[0];
	}

	if (tree.action == "literal") {
		return tree.args[0];
	}

	if (tree.action == "negation") {
		if (tree.args[0].action == "substitution") {
			return "!" + tree.args[0].args[0];
		}
		return "(!" + treeToExpr(tree.args[0]) + ")";
	}



	if (tree.action == "conjunction") {
		return "(" + treeToExpr(tree.args[0]) + " & " +  treeToExpr(tree.args[1]) + ")";
	}

	if (tree.action == "disjunction") {
		return "(" + treeToExpr(tree.args[0]) + " | " +  treeToExpr(tree.args[1]) + ")";
	}

	if (tree.action == "implication") {
		return "(" + treeToExpr(tree.args[0]) + " -> " + treeToExpr(tree.args[1]) + ")";
	}

	if (tree.action == "equivalence") {
		return "(" + treeToExpr(tree.args[0]) + " <-> " + treeToExpr(tree.args[1]) + ")";
	}

	return "";


}



module.exports.proofToString = proofToString;
function proofToString(proof) {
	proof = proof.map(function(i) {
		if (i.label == "sep")
			return "------------------------------\n";
		
		if (i.tree) {
			return i.idx + "\t" + i.tree + "\t" + i.label + "\n";
		}

		return i.label + "\n";
	});

	return proof.join("");
}

module.exports.buildTree = buildTree;
function buildTree(string) {
	return hoistNullActions(parser.parse(lexer.lex(string)));
}
