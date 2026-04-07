import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';



const registerUser = asyncHandler( async (req, res) => {
    
    // > get user details from frontend

    const {fullName, email, username, password}= req.body;
    // console.log(fullName, email, username, password);

    // > validation - not empty

    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    if(
        [fullName, email, username, password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are required..")
    }

    // > check if user already exist: username and email

    const existedUser = await User.findOne({
        $or : [{ email }, { username }]
    })
    
    if(existedUser){
        throw new ApiError(409, "User already exists.")
    }

    // > check avatar and cover image file
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath)     


    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    console.log(coverImageLocalPath)

    
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required.")
    }

    // > upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log(avatar, coverImage);

    if(!avatar){
        throw new ApiError(400, "avatar file is required.")
    }

    // create user object (mongodb) -create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
    })
    
    // > remove password and refreshtoken field from response

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken "
    )

    // check for user creation 
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user.")
    }

    // return response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully." )
    )
    
} )






export {registerUser}