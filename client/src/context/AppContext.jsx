import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

//for connecting with backend
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props)=>{

    //for backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const currency = import.meta.env.VITE_CURRENCY 
    const navigate = useNavigate()

    //for connecting with backend
    const {getToken} = useAuth()
    const {user} = useUser()


    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)  // make it true ot false for backend
    const [enrolledCourses, setEnrolledCourses] = useState([])

    //for backend
    const [userData, setUserData] = useState(null)

    // update for backend server
    //Fetch All Courses
    const fetchAllCourses = async ()=>{
        try{
           const {data} = await axios.get(backendUrl + '/api/course/all');

           if(data.success){
            setAllCourses(data.courses)
           } else{
             toast.error(data.message)
           }
        } catch(error) {
            toast.error(error.message)
        }
    }

    // featch user data for backend server
    const fetchUserData = async ()=> {

        if(user.publicMetadata.role === 'educator'){
            setIsEducator(true)
        }

        try{
            const token = await getToken();

            const {data} = await axios.get(backendUrl + '/api/user/data', {headers: 
                {Authorization: `Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
            } else{
                toast.error(data.message)
            }
        } catch (error){
            toast.error(error.message)
        }
    }


    // update this for backend

    //calculating avg rating
    const calculateRating = (course)=>{
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    //Calculate course unit time 
    const calculateChapterTime = (chapter)=>{
        let time = 0
        chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
        return humanizeDuration(time * 60 *1000, {units: ["h", "m"]})
    }

    //Calculate course duration
    const calculateCourseDuration = (course)=>{
        let time = 0
        course.courseContent.map((chapter)=> chapter.chapterContent.map(
            (lecture)=> time += lecture.lectureDuration
        ))
        return humanizeDuration(time * 60 *1000, {units: ["h", "m"]})
    }

    //Calculate number of Lectures 
    const calculateNoOfLectures = (course)=>{
        let totalLectures = 0;
        course.courseContent.forEach(chapter =>{
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length
            }
        });
        return totalLectures;
    }
     

    //update this for backend connection
    //Enrolled courses feacthing 
    const fetchUserEnrolledCourses = async ()=>{
        try{
            const token = await getToken();
            const {data} = await axios.get(backendUrl + '/api/user/enrolled-courses',
                {headers: {Authorization: `Bearer ${token}`}})
            
            if(data.success){
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else{
                toast.error(data.message)
            }
        } catch(error){
            toast.error(error.message)
        }
    }

    //update this for backend
    useEffect(()=>{
        fetchAllCourses()
    },[])

    //remove this for backend
    //  //for connecting with backend
    //  const logToken = async ()=>{
    //     console.log(await getToken());
    //  }


     //update this for backend server
     useEffect(()=>{
        if(user){
            // logToken() remove this for backend
            fetchUserData()
            fetchUserEnrolledCourses()
        }
     },[user])

     
    // update this value for baclend URL
    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        enrolledCourses,
        fetchUserEnrolledCourses,

        backendUrl, 
        userData, 
        setUserData,
        getToken,
        fetchAllCourses
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}