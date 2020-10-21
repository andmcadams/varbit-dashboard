const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose');
const app = express()
const port = 3001

const Schema = mongoose.Schema;

const QUEUE_LOCK = "queue_lock";
var queue = [];

var mongoDB = 'mongodb://localhost/varbits'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var UpdateSchema = new Schema({
	session: { type: String, required: [true, 'Missing session for varbit update'] },
	index: { type: Number, required: [true, 'Missing index for varbit update'] },
	tick: { type: Number, required: [true, 'Missing tick for varbit update'] },
	subtick: { type: Number },
	oldValue: { type: Number, required: [true, 'Missing oldValue for varbit update'] },
	newValue: { type: Number, required: [true, 'Missing newValue for varbit update'] }
})

var VarbitUpdateModel = mongoose.model('VarbitUpdate', UpdateSchema);

var VarbitSchema = new Schema({
	index: { type: Number, required: [true, 'Missing index for varbit'] }
});

var VarbitModel = mongoose.model('Varbit', VarbitSchema);

app.use(bodyParser.json({limit: '100mb'}));
app.use(cors());
app.get('/varbs', (req, res) => {

	VarbitUpdateModel.find( (err, varbitUpdates) => {
		if (err)
			return res.status(401).send({
				error: 'Failed to query'
			});

		return res.status(200).send(varbitUpdates);
	});
});

app.get('/retrieveVarbits', (req, res) => {
	// console.log('retrieveVarbits')
	VarbitModel.find((err, varbits) => {
		if (err)
			return res.status(401).send({
				error: 'Failed to query'
			});

		let sortedVarbits = varbits.sort((d1, d2) => {
			if (d1.updates.length == 0)
				return 1;
			else if (d2.updates.length == 0)
				return -1;

			return d2.updates[d2.updates.length-1].tick - d1.updates[d1.updates.length-1].tick
		});
		return res.status(200).send({
			arr: sortedVarbits
		});
	});
});

app.post('/updateMany', (req, res) => {
	// session is a unique string identifying the current session.
	// info is an array containing json representations of UpdateModels
	let session = req.body.session;
	let updates = req.body.info;

	return updateOne(res, session, updates);
});

function updateOne(res, session, updates) {

	let update = updates[0];

	// Append to varbit document
	// Check to see if the varb is in the db
	VarbitModel.findOne({ index: update.index }, (err, varbitModel) => {
	
		if (err)
			failure = true

		// If not, insert the varbit
		if (varbitModel == null) {

			var varbitInstance = new VarbitModel({
				index: update.index
			});

			varbitInstance.save(function(err) {
				if (err)
				{
					console.log('Failure to save: ' + err)
					return status(400).send({
						error: 'Failed to save varbit'
					});
				}

				// console.log("Append to new: " + update.index)
				return createUpdate(res, session, updates);
			});
		}
		else {
			// If it is, just create the update.
			// console.log("Append to existing: " + update.index)
			return createUpdate(res, session, updates);
		}
	});
}

function createUpdate(res, session, updates) {
	var varbitUpdateInstance = new VarbitUpdateModel({
		session: session,
		index: update.index,
		tick: update.tick,
		subtick: update.subtick,
		oldValue: update.oldValue,
		newValue: update.newValue
	});

	varbitUpdateInstance.save(function(err) => {
		if (err)
			return res.status(400).send({
				error: 'Failed to save varbit update'
			});
		// If saved, slice one off the front of the array.
		// If there are no more updates, return with an OK response.
		// Otherwise, add the next varbit update.

		// Splice is much faster than slice(0) and shift
		updates.splice(0, 1)
		if (updates.length == 0)
			return res.status(200).send();
		return updateOne(res, session, updates);
	});

}

app.get('/', (req, res) => {
	return res.status(200).send({
		'message': 'Alive'
	})
})

app.listen(port, () => {
	console.log(`Server up at http://localhost:${port}`)
})
