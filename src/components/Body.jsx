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
        <div className="flex flex-col min-h-screen relative bg-[#0b0c14] text-slate-100 overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
            {/* Ambient Background Lighting Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Top-Left Rose/Pink Glow */}
                <div className="absolute -top-32 -left-32 w-[32rem] sm:w-[42rem] h-[32rem] sm:h-[42rem] rounded-full bg-gradient-to-tr from-rose-600/15 via-pink-500/10 to-transparent blur-[130px] animate-pulse pointer-events-none" />
                
                {/* Center-Right Indigo/Purple Glow */}
                <div className="absolute top-1/3 -right-32 w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />
                
                {/* Bottom-Left Gold/Amber Glow */}
                <div className="absolute -bottom-32 -left-20 w-[28rem] sm:w-[36rem] h-[28rem] sm:h-[36rem] rounded-full bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent blur-[120px] pointer-events-none" />
                
                {/* Subtle Radial Mesh Grid overlay */}
                <div className="absolute inset-0 bg-mesh-pattern opacity-20 pointer-events-none" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <NavBar />
                <div className="flex-1">
                    {/*Outlet - any children components of Body will be rendered here*/}
                    <Outlet />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Body;