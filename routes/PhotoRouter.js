const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const verifyToken = require("../middleware/auth");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { group, count } = require("console");
const { lookup } = require("dns");
const router = express.Router();

// config storage images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// api

router.get("/photosOfUser/:userId", verifyToken, async function(req, res) {
  const userId = req.params.userId;
  try {
    return res.json(await Photo.find({user_id: userId}));
  } catch (error) {
    console.log(error);
  }
})

router.post("/commentsOfPhoto/:photo_id", verifyToken, async function(req, res) {
  const photo_id = req.params.photo_id;
  const { user_id, comment } = req.body;
  try {
    if(!comment || !user_id){
      return res.status(400).json({message: "Bad Request"});
    }
    const photo =  await Photo.findById(photo_id);
    if(!photo){
      return res.status(400).json({message: "Bad Request"});
    }
    const newComment = {
      comment: comment,
      user_id: user_id,
    }
    photo.comments.push(newComment);
    await photo.save();
    return res.status(200).json({message: "Succeed"})
  } catch (error) {
    console.log(error);
  }
})

router.post('/photos/new', verifyToken, upload.single('file'), async function(req, res){
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Bad Request' });
    }

    const newPhoto = new Photo({
      file_name: req.file.filename,
      createdAt: new Date(),
      user_id: req.user_id,
      comments: []

    });

    await newPhoto.save();
    return res.status(200).json({ message: 'Ảnh đã được thêm.', photo: newPhoto });
  } catch (error) {
    console.log(error);
  }
});

//#region edit cmt
 /*start edit
router.put("/:photoId/comment/:commentId", verifyToken, async (req, res) => {
  const { photoId, commentId } = req.params;
  const { newComment } = req.body;
  const userId = req.user_id; 

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const comment = photo.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

   
    if (comment.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    comment.comment = newComment;
    await photo.save();
    res.json({ message: "Comment updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
end edit */
//#endregion


//#region delete cmt
/* Xóa comment
router.delete("/:photoId/comment/:commentId", verifyToken, async (req, res) => {
  const { photoId, commentId } = req.params;
  const userId = req.user_id; // lấy từ middleware verifyToken

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const comment = photo.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Kiểm tra quyền xóa: chỉ xóa được comment của chính mình
    if (comment.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Cách xóa đúng: dùng pull()
    photo.comments.pull(commentId);
    await photo.save();

    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
*/
//#endregion


//#region delete photo
/*
router.delete("/:photoId", verifyToken, async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user_id;

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await photo.deleteOne();
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
*/
//#endregion


//#region liet ke người dùng có từ 2 ảnh trở lên 
/*
router.get("/users-with-many-photos", verifyToken, async (req, res) => {
  try {
    const results = await Photo.aggregate([
      { $group: { _id: "$user_id", count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      {
        $lookup: {
          from: "users", // tên collection (viết thường + số nhiều)
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          first_name: "$user.first_name",
          last_name: "$user.last_name"
        }
      }
    ]);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
*/
//#endregion


module.exports = router;
