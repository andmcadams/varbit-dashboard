const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose');
const app = express()
const port = 3001

const Schema = mongoose.Schema;

var mongoDB = 'mongodb://localhost/varbits'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var UpdateSchema = new Schema({
	oldValue: { type: Number, required: [true, 'Missing oldValue'] },
	newValue: { type: Number, required: [true, 'Missing newValue'] },
	tick: { type: Number, required: [true, 'Missing tick'] },
	session: { type: Number, required: [true, 'Missing session'] }
})

var VarbitUpdateModel = mongoose.model('VarbitUpdate', UpdateSchema);

var VarbitSchema = new Schema({
	index: Number,
	name: String,
	updates: [UpdateSchema]
});

var VarbitModel = mongoose.model('Varbit', VarbitSchema);

app.use(bodyParser.json());
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

app.get('/varbits', (req, res) => {
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
		return res.status(200).send(sortedVarbits);
	});
});

function createUpdate(res, session, varbitInstance, varbitUpdateInstance, updates) {
	varbitInstance.updates.push(varbitUpdateInstance)

	varbitInstance.save(function(err) {
		if (err)
		{
			console.log('Failure to save: ' + err)
		}
		else
			console.log('Saved')
			// If all done, return
		if (updates.length == 0)
			return res.status(200).send();
		return updateOne(res, session, updates);
	});
}

app.post('/update', (req, res) => {
	// Record the varbit and the value
	let index = parseInt(req.body.index);
	let oldValue = parseInt(req.body.oldValue);
	let newValue = parseInt(req.body.newValue);
	let tick = parseInt(req.body.tick);
	let session = parseInt(req.body.session);

	var varbitUpdateInstance = new VarbitUpdateModel({
		oldValue: oldValue,
		newValue: newValue,
		tick: tick,
		session: session
	})

	// Check to see if the varb is in the db
	VarbitModel.findOne({ index: index }, (err, varbitModel) => {
	
		if (err)
			return res.status(401).send({
				error: 'Failed to query Varbit: ' + err
			});

		// If not, create it
		if (varbitModel == null) {

			var varbitInstance = new VarbitModel({
				index: index,
				updates: []
			});
			return createUpdate(res, varbitInstance, varbitUpdateInstance);
		}

		// If it is, create the update and append it to the array
		return createUpdate(res, varbitModel, varbitUpdateInstance);

	});
})


function updateOne(res, session, updates) {

	let update = updates[0];
	var varbitUpdateInstance = new VarbitUpdateModel({
		oldValue: update.oldValue,
		newValue: update.newValue,
		tick: update.tick,
		session: session
	});
	// Append to varbit document
	// Check to see if the varb is in the db
	VarbitModel.findOne({ index: update.index }, (err, varbitModel) => {
	
		if (err)
			failure = true

		// If not, create it
		if (varbitModel == null) {

			var varbitInstance = new VarbitModel({
				index: update.index,
				updates: []
			});
			console.log("Append to new: " + update.index)
			return createUpdate(res, session, varbitInstance, varbitUpdateInstance, updates.slice(1));
		}
		else {
			// If it is, create the update and append it to the array
			console.log("Append to existing: " + update.index)
			return createUpdate(res, session, varbitModel, varbitUpdateInstance, updates.slice(1));
		}
	});
}

app.post('/updateMany', (req, res) => {
	// session is a unique string identifying the current session.
	// info is an array containing json representations of UpdateModels
	let session = req.body.session;
	let updates = req.body.info;

	return updateOne(res, session, updates);

});

app.get('/', (req, res) => {
	return res.status(200).send({
		'message': 'Alive'
	})
})

app.listen(port, () => {
	console.log(`Server up at http://localhost:${port}`)
})
