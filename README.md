# CardGenerator
A random card generator, designed specifically with Hearthstone in mind, but generally applicable to other CCG/TCG's.

Try it out online: [https://dominic-calkosz.com/Card-Generator](https://dominic-calkosz.com/Card-Generator)

## Generation Data
All of the card generation is based on a context free grammar, developed manually, which is pulled directly from [this Google Sheet](https://docs.google.com/spreadsheets/d/1h9wySUc0MGK2p3h5Eds8_8TSfLMenvqYym5zeSot7Bs/edit?usp=sharing). Special thanks to Adrian Mester for helping me to structure and populate this, and for the original inspiration.

## Setup
Simply clone the repository, and then run ``$node .`` to download and parse all generation data from the Google Sheet. You may need to follow some of the steps [here](https://developers.google.com/sheets/api/quickstart/nodejs) first, in order to enable and/or install the Google Sheets API.

You can then open the static ``CardGenTestPage.html`` directly in your web browser and test the results in the console.

## Testing
In the console, run ``test();`` to get a sampling of cards. To generate an individual minion or spell, try ``generateFullRandom("Minion");`` or ``generateFullRandom("Spell");`` respectively.
