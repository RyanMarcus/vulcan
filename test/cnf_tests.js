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

var assert = require("assert");
var cnf = require("../cnf.js");
var util = require("../util.js");



describe("CNF Converter Internals", function() {
	describe("isCNF()", function() {
		it("should identify expressions in CNF", function () {
			var t = util.buildTree("A & B & !C");
			assert(cnf.isCNF(t));
		});

		it("should identify expressions in CNF", function () {
			var t = util.buildTree("A & (B | D) & !C");
			assert(cnf.isCNF(t));
		});

		it("should identify trivial expressions in CNF", function () {
			var t = util.buildTree("A");
			assert(cnf.isCNF(t));
		});


		it("should identify trivial expressions in CNF", function () {
			var t = util.buildTree("!A");
			assert(cnf.isCNF(t));
		});


		it("should identify expressions not in CNF", function () {
			var t = util.buildTree("A -> B & !C");
			assert(!cnf.isCNF(t));
		});

		it("should identify expressions not in CNF", function () {
			var t = util.buildTree("A & (B | (A & C)) & !C");
			assert(!cnf.isCNF(t));
		});
	});

	describe("splitClauses()", function() {
		it("should correctly split up expressions in CNF", function() {
			var t = util.buildTree("A & B & C");
			var clauses = cnf.splitClauses(t);
			assert(clauses[0].action == "substitution");
			assert(clauses[0].args[0] == "A");
			assert(clauses[1].action == "substitution");
			assert(clauses[1].args[0] == "B");
			assert(clauses[2].action == "substitution");
			assert(clauses[2].args[0] == "C");

		});

		it("should correctly split up expressions in CNF", function() {
			var t = util.buildTree("A & !B & C");
			var clauses = cnf.splitClauses(t);
			assert(clauses[0].action == "substitution");
			assert(clauses[0].args[0] == "A");
			assert(clauses[1].action == "negation");
			assert(clauses[2].action == "substitution");
			assert(clauses[2].args[0] == "C");

		});

		it("should correctly split up expressions in CNF", function() {
			var t = util.buildTree("A & (!B | D) & C");
			var clauses = cnf.splitClauses(t);
			assert(clauses[0].action == "substitution");
			assert(clauses[0].args[0] == "A");
			assert(clauses[1].action == "disjunction");
			assert(clauses[2].action == "substitution");
			assert(clauses[2].args[0] == "C");

		});
	});
});

describe("CNF Converter", function() {
	describe("convertToCNF()", function() {
		it("should convert trivial expressions to CNF", function() {
			var t = util.buildTree("A");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "substitution");
			assert(e.args[0] == "A");
			assert(cnf.isCNF(e));

		});

		it("should convert trivial expressions to CNF", function() {
			var t = util.buildTree("!A");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "negation");
			assert(cnf.isCNF(e));

		});

		it("should convert CNF expressions to CNF", function() {
			var t = util.buildTree("A & B & C");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "conjunction");
			assert(cnf.isCNF(e));

		});


		it("should convert CNF expressions to CNF", function() {
			var t = util.buildTree("A & (B | !D) & C");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "conjunction");
			assert(cnf.isCNF(e));

		});

		it("should convert non-CNF expressions to CNF", function() {
			var t = util.buildTree("A & (B -> !D) & C");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "conjunction");
			assert(cnf.isCNF(e));

		});

		it("should convert non-CNF expressions to CNF", function() {
			var t = util.buildTree("A & (B -> (!D & C)) <-> C");
			var e = cnf.convertToCNF(t).peek().tree;

			assert(e.action == "conjunction");
			assert(cnf.isCNF(e));

		});
	});
	
});
