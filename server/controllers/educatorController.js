import {clerkClient} from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'

import User from '../models/User.js'


export const updateRoleToEducator = async (req,res)=>{
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{
                role: 'educator',
            }
        })

        res.json({success: true, message: 'You can publish a course now'})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;

   
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

      
        const newCourse = await Course.create(parsedCourseData);
        await newCourse.save()

        res.json({ success: true, message: "Course Added", course: newCourse });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



export const getEducatorCourses = async(req,res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({success: true, courses})
        
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


export const educatorDashboardData = async(req,res) =>{
    try {
        const educator = req.auth.userId

        const courses = await Course.find({educator});
        const totalCourses = courses.length;

       

    
        const enrolledStudentsData = [];
        for(const course of courses){
         
            const students = await User.find({
                _id: {$in: course.enrolledStudents} 
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }
        res.json({success: true, dashboardData: {
            totalEarnings,enrolledStudentsData, totalCourses
        }})
    } catch (error) {
        res.json({success: false, message:error.message})     
    }
}


export const getEnrolledStudentsData = async(req,res) =>{
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator})
        
        const enrolledStudents = [];

      
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl createdAt'); 

            students.forEach(student => {
                enrolledStudents.push({
                    student: {
                        _id: student._id,
                        name: student.name,
                        imageUrl: student.imageUrl
                    },
                    courseTitle: course.courseTitle,
                    purchaseDate: student.createdAt 
                });
            });
        }

        res.json({success: true, enrolledStudents});

    } catch (error) {
        res.json({success: false, message:error.message})
    }
}