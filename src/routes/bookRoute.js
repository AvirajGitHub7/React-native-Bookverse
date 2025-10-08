import express from "express"
import cloudinary from "../lib/cloudinary.js";
const router = express.Router()
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !rating || !caption) {
            return res.status(400).json({ message: "Please provide all the field" });

        }

        //Upload Image to Cloudinary
        const UploadResponse = await cloudinary.uploader.upload(image);
        const ImageUrl = UploadResponse.secure_url

        //Save to the database
        const newbook = new Book({
            title,
            caption,
            rating,
            image: ImageUrl,
            user: req.user._id,

        })

        await newbook.save()

        res.status(201).json({
            message: "Book created successfully",
            book: newbook,
        });

    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Server error while creating book" });
    }

})

//const response=await fetch("http://localhost:3000/api/book/page=1&limit=5");
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.params.page || 1
        const limit = req.params.limit || 1
        const skip = (page - 1) * limit

        const books = await Book.find()
            .sort({ createdAt: -1 })  //newest to oldest
            .limit(limit)
            .skip(skip)
            .populate("user", "username profileImage") //populate mai field ka naam aata hai naki model ka

        const totalbooks = await Book.countDocuments()

        res.send({
            books,
            totalbooks,
            totalpages: Math.ceil(totalbooks / limit),
            currentpage: page
        })
    } catch (error) {
        console.log("Error in getting all the books route,", error)
        res.status(500).json({ message: "Internal Server Error" })
    }

})

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findOne(req.params.id);
        if (!book) return res.status(404).json({ message: "Book Not found" })

        //check if the user is the creator or not
        if (book.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" })

        //delete image from Cloudinary as well 
        //https://res.cloudinary.com/vdghevhe/image/upload/v1798090/quidbdoe61drfri0.png

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];   //quidbdoe61drfri0
                await cloudinary.uploader.destroy(publicId)
            } catch (error) {
                console.log("Error deleting image form cloudinary", error);
            }
        }

        await book.deleteOne();

        res.json("Book deleted successfully");
    } catch (error) {
        console.log("Error deleting book", error)
        res.status(500).json({ message: "Internal server Error" })

    }
})

//your Recomendation in your profile -> const response=await fetch("http://localhost:3000/api/books/user") 
router.get("/", protectRoute, async (req, res) => {
    try {
        const books = (await Book.find({ user: req.user._id })).sort({ createdAt: -1 })
        res.json(books);
    } catch (error) {
        console.log("Get user books user:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
})

export default router
