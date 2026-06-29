import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch,useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import { createSocketConnection, disconnectSocket } from "../utils/socket";

const Body = () =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((store)=>store.user);
    
    const fetchUser = async () => {
        if(userData) return;
        try{
        const res = await axios.get(BASE_URL + "profile/view",
            {withCredentials:true}
        );
        dispatch(addUser(res.data));
        }catch(err){
            if(err.status===401){
                if (window.location.pathname !== "/") {
                    navigate("/login");
                }
            }
            console.log(err);
        }
    };

    useEffect(()=>{
             fetchUser();
    },[]);

    useEffect(() => {
        if (userData && window.location.pathname === "/") {
            navigate("/feed");
        }
    }, [userData, navigate]);

    useEffect(() => {
        if (!userData?._id) {
            disconnectSocket();
            return;
        }

        createSocketConnection();
    }, [userData?._id]);

    return (
        <div>
            <NavBar/>
            
            {/*Outlet - any children components of Body will be rendered here*/}
            <Outlet />

            <Footer/>
        </div>
    );
};

export default Body;