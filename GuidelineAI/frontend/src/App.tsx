import { Layout } from "@/components/Layout";
import Analytics from "@/pages/Analytics";
import Ask from "@/pages/Ask";
import Evaluation from "@/pages/Evaluation";
import Guideline from "@/pages/Guideline";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Status from "@/pages/Status";
import Team from "@/pages/Team";
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Ask />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/guideline" element={<Guideline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/team" element={<Team />} />
          <Route path="/status" element={<Status />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </>
  );
}
