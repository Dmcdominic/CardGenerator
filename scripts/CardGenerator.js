// ========= VARIABLE DECLARATIONS ==========
// Substitution rules for cleaner syntax
var substitutions = {
	" \\n " : "<br>",
	"\\n" : "<br>",
	" ." : ".",
	" ," : ",",
	"  " : " ",
	"plus " : "+",
	" / " : "/",
	" -" : "-"
}

// ========== CONTENT STRUCTURING ==========
var values = data.values;
var nonTerminals = {};
for (var i=1; i < values.length; i++) {
	var nonTerminalName = values[i].splice(0, 1);
	nonTerminalName = nonTerminalName[0];
	if (nonTerminalName === undefined) {
		continue;
	}

	// Trim the nonTerminal
	nonTerminalName = trimNonTerminalName(nonTerminalName);
	var to_remove = [];
	for (var j=0; j < values[i].length; j++) {
		// Remove any TODO cells
		if (values[i][j].toLowerCase().includes('todo')) {
			to_remove.push(values[i]);
		} else {
			// Trim the values
			values[i][j] = trimValueName(values[i][j]);
		}
	}
	for (var j=0; j < to_remove.length; j++) {
		values[i].splice(values[i].indexOf(to_remove[j]), 1);
	}
	nonTerminals[nonTerminalName.name] = values[i];
}

// Remove the empty string nonTerminal
delete nonTerminals[""];

// Populate tags
getTags("Minion");
getTags("Spell");


// ========== CONTENT STRUCTURING UTIL ==========
function trimNonTerminalName(nonTerminalName) {
	var new_nonTerminal_obj = {name:removeComments(nonTerminalName)};
	return new_nonTerminal_obj;
}

function trimValueName(valueName) {
	var new_value_obj = {name:removeComments(valueName), weight:parseWeight(valueName)};
	return new_value_obj;
}

function removeComments(valueString) {
	// Remove everything after a parenthesis
	var first_paren = valueString.indexOf('(');
	if (first_paren >= 0) {
		valueString = valueString.substring(0, first_paren);
	}

	// Remove everything after a bracket
	var first_bracket = valueString.indexOf("[");
	if (first_bracket >= 0) {
		valueString = valueString.substring(0, first_bracket);
	}

	// Remove everything after an angle bracket
	first_bracket = valueString.indexOf("<");
	if (first_bracket >= 0) {
		valueString = valueString.substring(0, first_bracket);
	}

	// Trim whitespace
	valueString = valueString.trim();

	return valueString;
}

function parseWeight(valueString) {
	// Check for angle bracket notation
	var first_bracket = valueString.indexOf("<");
	var last_bracket = valueString.indexOf(">");
	if (first_bracket >= 0 && last_bracket > 0) {
		weight = parseFloat(valueString.substring(first_bracket + 1, last_bracket));
	} else {
		weight = 1;
	}
	return weight;
}


// ========== TAG POPULATION ==========
function getTags(obj) {
	if (obj === null || obj === undefined) {
		throw "Cannot get tags of null or undefined.";
	}

	if (obj.tags !== undefined) {
		return obj.tags;
	}

	// Convert a pure string input into an object.
	if (isString(obj)) {
		obj = {name:obj};
	}

	obj.tags = " ";

	for (var x=0; x < 1; x++) {
		// Strings - e.g. terminals
		if (isNonTerminal(obj)) {
			obj.tags += trimAll(obj.name || " ");
			break;
		}

		// Sequences (i.e. includes a '+')
		var plusIndex = obj.name.indexOf('+');
		if (plusIndex > 0) {
			var tempName = obj.name
			while (plusIndex > 0) {
				var firstSymbol = tempName.substring(0, plusIndex).trim();
				tempName = tempName.substring(plusIndex + 1, tempName.length).trim();
				obj.tags += getTags(firstSymbol) + " ";
				plusIndex = tempName.indexOf('+');
			}
			obj.tags += getTags(tempName) + " ";
			break;
		}

		// NonTerminals
		var values = nonTerminals[obj.name];
		if (values === undefined) {
			throw "ERROR: Values for \'" + obj.name + "\' not found in nonTerminals object";
		}

		if (isArray(values)) {
			for (var i=0; i < values.length; i++) {
				obj.tags += getTags(values[i]) + " ";
			}
			break;
		}

		// Nothing should fall through
		throw "ERROR: No valid case found while getting tags for: " + obj;
	}

	// Nothing should fall through
	obj.tags = trimAll(obj.tags);
	return obj.tags;
}


// ========== UTIL ==========
// Type-checking
function isString(val) {
	return typeof val === 'string' || val instanceof String;
}

function isNonTerminal(val) {
	return isString(val.name) && val.name.indexOf('+') == -1 && val.name.charAt(0) == "\"";
}

function isArray(val) {
	return Array.isArray(val);
}

function trimQuotes(val) {
	var next_quote = val.indexOf('\"');
	while (next_quote >= 0) {
		val = val.slice(0, next_quote) + val.slice(next_quote + 1, val.length);
		next_quote = val.indexOf('\"');
	}
	return val.trim();
}

function trimAll(val) {
	var trimmed = trimQuotes(val).trim();
	for (var toReplace in substitutions) {
		trimmed = substituteEach(trimmed, toReplace, substitutions[toReplace]);
	}
	return trimmed;
}

function substituteEach(val, replaceThis, withThis) {
	var next_index = val.indexOf(replaceThis);
	while (next_index >= 0) {
		val = val.slice(0, next_index) + withThis + val.slice(next_index + replaceThis.length, val.length);
		next_index = val.indexOf(replaceThis, next_index + withThis.length);
	}
	return val;
}

// Get a random element of an Array
function randElement(array, obj) {
	if (!isArray(array)) {
		throw "Cannot get a random element of non-array object.";
	} else if (array.length === 0) {
		//throw "Cannot get a random element of empty array.";
		// Temporary filler, before content is finished:
		var new_value_obj = {name:"\"<insert random " + obj.name + " here>\""};
		return new_value_obj;
	}

	// Direct selection
	if (array.length === 1) {
		return array[0];
	}

	// Weighted selection
	var total_weight = 0;
	for (var i=0; i < array.length; i++) {
		total_weight += array[i].weight;
	}

	var random_val = Math.random() * total_weight;
	var weight_counter = 0;
	for (var i=0; i < array.length; i++) {
		weight_counter += array[i].weight;
		if (random_val < weight_counter) {
			return array[i];
		}
	}

	// Nothing should fall through
	throw "ERROR: Weighted random selection failed on obj: " + obj.name;
}


// ========== GENERATION ==========
// Create a random instance of an object
function generateRandom(obj) {
	// Null check
	if (obj === null || obj === undefined) {
		throw "Cannot generate random of null or undefined.";
	}

	// Convert a pure string input into an object.
	// Otherwise, create a shallow copy.
	if (isString(obj)) {
		obj = {name:obj};
	} else {
		obj = Object.assign({}, obj);
	}

	// Strings - e.g. terminals
	if (isNonTerminal(obj)) {
		return obj;
	}

	// Sequences (i.e. includes a '+')
	var plusIndex = obj.name.indexOf('+');
	if (plusIndex > 0) {
		var output = "";
		while (plusIndex > 0) {
			var firstSymbol = obj.name.substring(0, plusIndex).trim();
			obj.name = obj.name.substring(plusIndex + 1, obj.name.length).trim();
			output += generateRandom(firstSymbol).name.trim() + " ";
			plusIndex = obj.name.indexOf('+');
		}
		output += generateRandom(obj).name.trim();
		output = output.trim();
		var new_value_obj = {name:output};
		return new_value_obj;
	}

	// NonTerminals
	var values = nonTerminals[obj.name];
	if (values === undefined) {
		throw "ERROR: Values for \'" + obj.name + "\' not found in nonTerminals object";
	}

	if (isArray(values)) {
		var generated_obj = generateRandom(randElement(values, obj));
		generated_obj.name = trimQuotes(generated_obj.name);
		return generated_obj;
	}

	// Nothing should fall through
	throw "ERROR: No valid case found while trying to generate random: " + obj;
}

function generateFullRandom(name) {
	var randomly_generated_string = generateRandom(name).name;
	return trimAll(randomly_generated_string);
}


// ========= TESTING & GENERATION INTERFACE ==========
var minion_total = 3;
var spell_total = 3;

// Testing content structuring
// console.log("Full content data:");
// console.log(nonTerminals);

// Generating a set of cards
function generateCards(minion_total, spell_total) {
	console.log("===== Generating " + minion_total + " random minions =====");
	for (var i=0; i < minion_total; i++) {
		console.log("MINION: " + generateFullRandom("Minion"));
	}

	console.log("===== Generating " + spell_total + " random spells =====");
	for (var i=0; i < spell_total; i++) {
		console.log("SPELL: " + generateFullRandom("Spell"));
	}

	console.log("===== Completed generation =====");
	return true;
}

function test() {
	generateCards(minion_total, spell_total);
}
