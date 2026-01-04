import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {Header} from "./components/Header";
import {Hero} from "./components/Hero";
import {Features} from "./components/Features";
import {Showcase} from "./components/Showcase";
import {LastUrl} from "./components/LastUrl";
import {FAQ} from "./components/FAQ";
import {CTA} from "./components/CTA";
import {Footer} from "./components/Footer";
import {Redirect} from "./pages/Redirect";
import LinksModal from "./components/LinksModal";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Edit from "./pages/Edit";

function HomePage() {
    const [linksOpen, setLinksOpen] = React.useState(false);
    return (
        <div className="min-h-screen bg-black">
            <Header/>
            <Hero/>
            <Features/>
            <Showcase/>
            <LastUrl openLinksModal={() => setLinksOpen(true)}/>
            <FAQ/>
            <CTA/>
            <Footer/>
            <LinksModal open={linksOpen} onClose={() => setLinksOpen(false)}/>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/edit" element={<Edit/>}/>
                    <Route path="/redirect" element={<Redirect/>}/>
                    <Route path="/:shortCode" element={<Redirect/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
