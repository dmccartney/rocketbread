import { Route, Routes } from "react-router-dom";
import FinalizedIntervalPage from "./pages/FinalizedIntervalPage";
import LocalFilePage from "./pages/LocalFilePage";
import HomePage from "./pages/HomePage";
import NodePage from "./pages/NodePage";

function App() {
  return (
    <Routes>
      <Route path="/" exact element={<HomePage />} />
      <Route
        path="/finalized/:intervalIndex"
        exact
        element={<FinalizedIntervalPage />}
      />
      <Route path="/local/:fileId" exact element={<LocalFilePage />} />
      <Route path="/node/:nodeAddressOrName" exact element={<NodePage />} />
    </Routes>
  );
}

export default App;
