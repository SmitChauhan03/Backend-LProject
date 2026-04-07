import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        )
        //file has been uploaded succesfull
        // console.log("file is uploaded on cloudinary", response.url) 
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as uploaded operation got failed
        console.log("error while uploading on cloudinary", error.message);
        throw error;
    }
}

export {uploadOnCloudinary}