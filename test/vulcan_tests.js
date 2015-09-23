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

var assert = require("assert");
var util = require("../util.js");
var vulcan = require("../vulcan.js");



describe("Vulcan", function() {
	describe("prove()", function() {
		it("should prove modus ponens", function() {
			var proof = vulcan.prove(["A -> B", "A"], "A");
			assert(vulcan.isProofComplete(proof));

		});

		it("should not prove the converse of modus ponens", function() {
			var proof = vulcan.prove(["A -> B", "B"], "A");
			assert(! vulcan.isProofComplete(proof));

		});


		it("should prove bijective identity", function() {
			var proof = vulcan.prove(["A <-> B", "B"], "A");
			assert(vulcan.isProofComplete(proof));


		});

		it("should prove the inverse bijective identity", function() {
			var proof = vulcan.prove(["A <-> B", "!B"], "!A");
			assert(vulcan.isProofComplete(proof));


		});

		it("should not prove the converse of bijective identity", function() {
			var proof = vulcan.prove(["A <-> B", "!B"], "A");
			assert(! vulcan.isProofComplete(proof));

		});

		it("should find simple proofs", function () {
			var proof = vulcan.prove(["(A & B) | C", "!B"], "C");
			assert(vulcan.isProofComplete(proof));

			
		});

		it("should be able to resolve implications", function () {
			var proof = vulcan.prove(["A -> B", "B -> C"], "A -> C");
			assert(vulcan.isProofComplete(proof));
		});

		it("should be able to resolve implications", function () {
			var proof = vulcan.prove(["A -> B", 
                                                  "B -> C", 
                                                  "C -> D",
                                                  "D -> E"], "A -> E");
			assert(vulcan.isProofComplete(proof));
		});


		it("should be able to resolve implications", function () {
			var proof = vulcan.prove(["A -> B", 
                                                  "B -> C", 
                                                  "C -> D",
                                                  "D -> E"], "B -> D");
			assert(vulcan.isProofComplete(proof));
		});

		it("should be able to resolve implications", function () {
			var proof = vulcan.prove(["A -> B", 
                                                  "!B | C", 
                                                  "C -> D",
                                                  "D -> E"], "B -> D");
			assert(vulcan.isProofComplete(proof));
		});

		it("should not falsely resolve complex queries", function () {
                        this.timeout(20000);
			var proof = vulcan.prove(["A -> B", 
                                                  "!B | C", 
                                                  "C -> D",
                                                  "D -> !E"], "!B | E");
			assert(!vulcan.isProofComplete(proof));
		});

		it("should resolve complex queries with extra info", function () {
                        this.timeout(20000);
			var proof = vulcan.prove(["A -> B", 
                                                  "!B | (C <-> B)", 
                                                  "C -> D",
                                                  "D -> !E"], "!B | E");
			assert(vulcan.isProofComplete(proof));
		});

	});
});
