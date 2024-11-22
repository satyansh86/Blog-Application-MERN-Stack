const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const fs = require('fs');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });

const secret = process.env.JWT_SECRET;

exports.createPost = [uploadMiddleware.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json('File not uploaded');
  
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  if (!token) return res.status(401).json('JWT token not provided');
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Invalid token');
    
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
}];

exports.updatePost = [uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  if (!token) return res.status(401).json('JWT token not provided');

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Invalid token');

    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('You are not the author');
    }

    postDoc.set({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    await postDoc.save();
    res.json(postDoc);
  });
}];

exports.getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
};
