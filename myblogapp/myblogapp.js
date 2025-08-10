const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;


app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/blogdb-react', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Successfully connected to MongoDB!');
});

// --- Mongoose Schema and Model ---
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);



// Get all blog posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server Error: Could not fetch posts.' });
  }
});

//  Create a new blog post
app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Please provide both title and content.' });
  }
  const newPost = new Post({ title, content });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server Error: Could not save post.' });
  }
});

// Update a post by its ID
app.put('/posts/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true } 
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Post ID format' });
        }
        res.status(500).json({ message: 'Server Error: Could not update post' });
    }
});


// Delete a blog post by its ID
app.delete('/posts/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error("Error deleting post:", err);
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Post ID format' });
        }
        res.status(500).json({ message: 'Server Error: Could not delete post' });
    }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
