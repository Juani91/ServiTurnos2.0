import Header from "../header/Header";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-serviturnos">
      <Header />
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout
