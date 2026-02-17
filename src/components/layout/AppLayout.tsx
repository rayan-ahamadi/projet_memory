import { Outlet } from "react-router-dom";


export default function AppLayout() {
    return (
        <div id="app">
            <main>
                <Outlet />
            </main>
        </div> 
    )
}