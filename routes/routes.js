const express = require ('express');
const router = express.Router();
const Project = require('../models/ProjectModel.js');
const multer = require('multer');
const fs = require('fs');

// Image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + "-"+ file.originalname);
    }
});      

var upload = multer({storage: storage}).single('images');

// Insert a project into the database route
router.post('/create', upload, async (req, res) => {
    try {
        const project = new Project({
            name: req.body.name,
            tagline: req.body.tagline,
            mainUrl: req.body.mainUrl,
            nameOfLink: req.body.nameOfLink,
            images: req.file.filename,
            description: req.body.description,
            collaborators: req.body.collaborators,
            additionalLink: req.body.additionalLink, 
            additionalLinkName: req.body.additionalLinkName
        });
        
        await project.save();

        req.session.message = {
            type: 'success',
            message: 'Project created successfully!'
        };
        res.redirect('/admin-dashboard');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get('/', (req, res) => {
    res.render('index', {title:"Home Page"})
});

router.get('/projects', (req, res) => {
    res.send('All Projects');
});

router.get('/login', (req, res) => {
    res.render('AdminLogin', {title:"Admin Login"})
});

// Get all projects route
router.get('/admin-dashboard', async (req, res) => {
    try {
        if (req.session.user) {
            const projects = await Project.find().exec();

            res.render('admin-dashboard', {
                title: 'Admin Dashboard',
                projects: projects,
                message: req.session.message,  // Pass message here if needed
            });
        } else {
            res.send('Unauthorized User');
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


router.post('/login', (req, res) => {
    if(req.body.username == process.env.USER && req.body.password == process.env.PASSWORD){
    req.session.user = req.body.username;
    res.redirect('/admin-dashboard');
    }
    else{
        res.end('Incorrect Username or Password');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
            return res.redirect('/admin-dashboard');
        }
        res.clearCookie(process.env.SESS_NAME);
        res.redirect('/login');
    })
});

router.get('/create', (req, res) => {
    res.render('Create', {title:"Create Project"})
});

router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const project = await Project.findById(id);

        if (!project) {
            return res.redirect('/admin-dashboard');
        }

        if (project == null) {
            return res.redirect('/admin-dashboard');
        }

        res.render('Edit', { title: 'Edit Project', project: project });
    } catch (err) {
        console.error(err);
        res.redirect('/admin-dashboard');
    }
});

// Update Project Route
router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;

            // Check if req.body.old_image is defined before trying to delete the old image
            if (req.body.old_image) {
                try {
                    fs.unlinkSync('./uploads/' + req.body.old_image);
                } catch (err) {
                    console.error(err);
                }
            }
        } else {
            // If no new file is uploaded, keep the old image
            new_image = req.body.old_image;
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.redirect('/admin-dashboard');
        }

        // Update project properties
        project.name = req.body.name;
        project.tagline = req.body.tagline;
        project.mainUrl = req.body.mainUrl;
        project.nameOfLink = req.body.nameOfLink;

        // Check if req.file is defined before accessing its properties
        if (req.file) {
            project.images = req.file.filename;
        }

        project.description = req.body.description;
        project.collaborators = req.body.collaborators;
        project.additionalLink = req.body.additionalLink;
        project.additionalLinkName = req.body.additionalLinkName;

        // Save the updated project
        await project.save();

        req.session.message = {
            type: 'success',
            message: 'Project updated successfully!'
        };
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin-dashboard');
    }
});

// Delete Project Route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const project = await Project.findByIdAndDelete(id);

        if (project && project.images !== '') {
            try {
                fs.unlinkSync('./uploads/' + project.images);
            } catch (error) {
                console.error(error);
            }
        }

        req.session.message = {
            type: 'success',
            message: 'Project deleted successfully!'
        };
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;