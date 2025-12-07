
import Course from "../models/Course.js"

import User from "../models/User.js"
import { CourseProgress } from "../models/CourseProgress.js"


export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }

        return res.json({ success: true, user });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const userEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success:true, enrolledCourses: userData.enrolledCourses})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}



export const purchaseCourse = async (req,res) => {
    try {
        const {courseId} = req.body
        const userId = req.auth.userId;

        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)
        
        if(!userData || !courseData)
        {
            return res.json({success: false, message: "User or Course Not Found"})
        }

     
        if (!courseData.enrolledStudents.includes(userId)) {
            courseData.enrolledStudents.push(userId);
            await courseData.save();
        }

      
        if (!userData.enrolledCourses.includes(courseId)) {
            userData.enrolledCourses.push(courseId);
            await userData.save();
        }
        
      
        res.json({success: true, message: "Course Enrolled Successfully!"})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


export const updateUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success: true, message: "Lecture Already Completed"})
            }
            
            progressData.lectureCompleted.push(lectureId)
          
            await progressData.save()
        }
        else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]

            })
        }
        res.json({success:true, message: 'Progress Updated'})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


export const getUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.json({success: true, progressData})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}



export const addUserRating = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId, rating} = req.body
        
        if(!courseId || !userId || !rating || rating < 1 || rating > 5)
        {
            return res.json({success: false, message:"Invalid details"})
        }

        const course = await Course.findById(courseId)
        if(!course){
            return res.json({success: false, message:"Course Not found!"})
        }

        const user = await User.findById(userId)

        if(!user || !user.enrolledCourses.includes(courseId)){
         
            return res.json({success: false, message:"User has not enrolled in this course."}) 
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId.toString() === userId.toString())
        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }
        else{
            course.courseRatings.push({userId,rating});
        }

        await course.save()
        res.json({success: true, message:"Rating Added"})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}