import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { LotteryPage } from "./pages/lottery";
import { Rank } from "./pages/rank";
import { Game2049Page } from "./pages/game";

export const Router = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<LotteryPage />} /> 
            <Route path="/rank" exact element={<Rank />} /> 
            <Route path="/game" exact element={
                
                    <Game2049Page />
            } />
        </Routes>
        </BrowserRouter>
    );
}