const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

const upload = multer({
    limites: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload an image!'));
        }

        callback(undefined, true);
    }
});

router.post('/tasks/:id/taskimage', auth, upload.single('taskimage'), async (req, res) => {
    try{
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if(!task){
            return res.status(404).send('Task not found');
        }
        
        task.taskimage = buffer;
        await task.save();
        res.send();
    }
    catch(err){
        res.status(400).send(err);
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.get('/tasks/:id/taskimage', async (req, res) => {
    try{
        const task = await Task.findOne({ _id: req.params.id });

        if(!task || !task.taskimage){
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(task.taskimage);
    }
    catch(err){
        res.status(404).send(err);
    }
});

router.delete('/tasks/:id/taskimage', auth, async (req, res) => {
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        task.taskimage = undefined;
        await task.save();
        res.send(task.taskimage);
    }
    catch(err){
        res.status(400).send(err);
    }
});


module.exports = router;