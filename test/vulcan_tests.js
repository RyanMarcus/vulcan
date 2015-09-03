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
var util = require("../util.js");
var vulcan = require("../vulcan.js");



describe("Vulcan", function() {
	describe("prove()", function() {
		it("should prove modus ponens", function() {
			var proof = vulcan.prove(["A -> B", "A"], "A");
			assert(proof.peek().label != "model exhausted, proof could not be reached");
		});

		it("should not prove the converse of modus ponens", function() {
			var proof = vulcan.prove(["A -> B", "B"], "A");
			assert(proof.peek().label == "model exhausted, proof could not be reached");
		});


		it("should prove bijective identity", function() {
			var proof = vulcan.prove(["A <-> B", "B"], "A");
			assert(proof.peek().label != "model exhausted, proof could not be reached");
		});

		it("should not prove the converse of bijective identity", function() {
			var proof = vulcan.prove(["A <-> B", "!B"], "A");
			assert(proof.peek().label == "model exhausted, proof could not be reached");
		});

		it("should find simple proofs", function () {
			var proof = vulcan.prove(["(A & B) | C", "!B"], "C");
			assert(proof.peek().label != "model exhausted, proof could not be reached");
			
		});


	});
});
